import React, { useState, useEffect, useRef } from "react";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import Timer from "./Timer";
import api from "../utils/api.js";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions = [], userName } = interviewData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("AI Speaking");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // ✅ Voices preload
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  // ✅ Question speak karo
 const speakQuestion = (text) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(
    (v) =>
      v.name.includes("Female") ||
      v.name.includes("Samantha") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Zira") ||
      v.name.includes("Google US English")
  );
  if (femaleVoice) utterance.voice = femaleVoice;

  utterance.onstart = () => {
    setStatus("AI Speaking");
    // ✅ Video play karo jab AI bol raha ho
    if (videoRef.current) videoRef.current.play();
  };

  utterance.onend = () => {
    setStatus("Your Turn");
    // ✅ Video pause karo jab AI chup ho jaye
    if (videoRef.current) videoRef.current.pause();
  };

  window.speechSynthesis.speak(utterance);
};

  // ✅ Har question change pe timer + speech
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimit);
    clearInterval(timerRef.current);

    // thoda delay de do — voices load hone ke liye
    const speechTimeout = setTimeout(() => {
      speakQuestion(currentQuestion.question);
    }, 500);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(speechTimeout);
      window.speechSynthesis.cancel();
    };
  }, [currentIndex]);

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();

    const timeTaken = currentQuestion.timeLimit - timeLeft;

    try {
      await api.post("/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: answer || "",
        timeTaken,
      });
    } catch (err) {
      console.error("Submit error:", err);
    }

    setAnswer("");

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("AI Speaking");
    } else {
      try {
        const result = await api.post("/api/interview/finish", { interviewId });
        onFinish(result.data);
      } catch (err) {
        console.error("Finish error:", err);
      }
    }

    setSubmitting(false);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT — Video + Timer */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">

          {/* Video */}
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              ref={videoRef}
              src={femaleVideo}
              autoPlay
              loop
              playsInline
              muted
              preload="auto"
              className="w-full h-auto object-cover"
            />
            {/* Status badge on video */}
            <div className="absolute bottom-3 left-3">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  status === "AI Speaking"
                    ? "bg-emerald-500 text-white animate-pulse"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {status === "AI Speaking" ? "🎙️ AI Speaking..." : "✍️ Your Turn"}
              </span>
            </div>
          </div>

          {/* Timer Card */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              <span
                className={`text-sm font-semibold ${
                  status === "AI Speaking"
                    ? "text-emerald-600"
                    : "text-blue-500"
                }`}
              >
                {status}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion.timeLimit}
              />
            </div>
            <div className="h-px bg-gray-200" />
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <p className="text-xs text-gray-400">Current Question</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {totalQuestions}
                </span>
                <p className="text-xs text-gray-400">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Question + Answer */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-600">
              AI Smart Interview
            </h2>
            {userName && (
              <span className="text-sm text-gray-400">
                👋 Hi, {userName}
              </span>
            )}
          </div>

          {/* Question Box */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                ⏱ {currentQuestion.timeLimit}s
              </span>
            </div>
          </div>

          {/* Answer Textarea */}
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setStatus("User Typing");
            }}
            placeholder="Type your answer here..."
            className="w-full flex-1 min-h-[220px] bg-gray-50 p-4 sm:p-6 rounded-2xl resize-none outline-none border-2 border-emerald-500 focus:ring-2 focus:ring-emerald-300 transition text-gray-800"
          />

          {/* Repeat + Submit buttons */}
          <div className="flex justify-between items-center">
            {/* Question dobara bolne ke liye */}
            <button
              onClick={() => speakQuestion(currentQuestion.question)}
              className="text-sm text-emerald-600 hover:text-emerald-800 underline underline-offset-2"
            >
              🔊 Repeat Question
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-full transition shadow-md"
            >
              {submitting
                ? "Submitting..."
                : currentIndex + 1 === totalQuestions
                ? " Finish Interview"
                : "Next Question →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;