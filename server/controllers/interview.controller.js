import fs from "fs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/User.model.js";
import Interview from "../models/interview.model.js";

// ✅ No library — pure Node.js se PDF text nikalo
const extractTextFromPdf = (buffer) => {
  const text = buffer.toString("latin1");
  const matches = text.match(/BT[\s\S]*?ET/g) || [];
  let extracted = matches
    .join(" ")
    .replace(/\(([^)]+)\)\s*Tj/g, "$1 ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (extracted.length < 50) {
    extracted = text
      .replace(/[^\x20-\x7E\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3000);
  }
  return extracted;
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "resume required" });
    }

    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const resumeText = extractTextFromPdf(fileBuffer);

    console.log("Resume text length:", resumeText.length);
    console.log("Resume preview:", resumeText.substring(0, 200));

    const messages = [
      {
        role: "system",
        content: `Extract structured data from resume. Return strictly JSON:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1","project2"],
  "skills": ["skill1","skill2"]
}`,
      },
      { role: "user", content: resumeText },
    ];

    const aiResponse = await askAi(messages);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const match = aiResponse.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    fs.unlinkSync(filepath);

    res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      resumeText,
    });
  } catch (error) {
    console.error("analyzeResume error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;
    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.credits < 5) {
      return res.status(403).json({ message: "Not enough credits. Minimum 5 required." });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const messages = [
      {
        role: "system",
        content: `You are a real human interviewer. Generate exactly 5 interview questions.
Rules:
- Each question 15-25 words
- One sentence per line
- No numbering`,
      },
      {
        role: "user",
        content: `Role:${role}\nExperience:${experience}\nInterviewMode:${mode}\nProjects:${projectText}\nSkills:${skillsText}\nResume:${safeResume}`,
      },
    ];

    const aiResponse = await askAi(messages);
    if (!aiResponse?.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    user.credits -= 5;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    res.json({
      interviewId: interview._id,
      creditLeft: user.credits,
      userName: user.name,
      questions: interview.questions || [],
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to create interview ${error}` });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const questions = interview.questions || [];
    const question = questions[questionIndex];

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded.";
      question.answer = answer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `Evaluate answer. Return JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short feedback"
}`,
      },
      {
        role: "user",
        content: `Question:${question.question}\nAnswer:${answer}`,
      },
    ];

    const aiResponse = await askAi(messages);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const match = aiResponse.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback });
  } catch (error) {
    return res.status(500).json({ message: `failed to submit answer ${error}` });
  }
};

export const getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status questions createdAt");

    res.json({ interviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(400).json({ message: "failed to find Interview" });

    const questions = interview.questions || [];
    const totalQuestions = questions.length;

    let totalScore = 0, totalConfidence = 0, totalCommunication = 0, totalCorrectness = 0;

    questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";
    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Interview ${error}` });
  }
};