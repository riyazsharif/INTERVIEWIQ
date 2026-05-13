import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";

function InterviewReport() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await api.get("/api/interview/history");
      setInterviews(result.data.interviews || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return "text-emerald-600";
    if (score >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 7) return "bg-emerald-100";
    if (score >= 4) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Improvement";
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your interviews...</p>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (selected) {
    const {
      finalScore = 0,
      confidence = 0,
      communication = 0,
      correctness = 0,
      questionWiseScore = [],
      role,
      experience,
      mode,
      createdAt,
    } = selected;

    const CircleScore = ({ value, label, color }) => {
      const r = 36;
      const circ = 2 * Math.PI * r;
      const dash = (Math.min(value / 10, 1)) * circ;
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={r}
                fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{value}</span>
            </div>
          </div>
          <span className="text-xs font-medium text-gray-500 text-center">{label}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Back button */}
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium text-sm"
          >
            ← Back to History
          </button>

          {/* Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 capitalize">{role}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {experience} experience • {mode} Interview • {formatDate(createdAt)}
                </p>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(finalScore)}`}>
                {finalScore}
                <span className="text-xl text-gray-300">/10</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">Performance Breakdown</h3>
            <div className="grid grid-cols-3 gap-6 justify-items-center">
              <CircleScore value={confidence} label="Confidence" color="#10b981" />
              <CircleScore value={communication} label="Communication" color="#3b82f6" />
              <CircleScore value={correctness} label="Correctness" color="#f59e0b" />
            </div>
          </div>

          {/* Question wise */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Question-wise Breakdown</h3>
            <div className="space-y-5">
              {questionWiseScore.map((q, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 bg-gray-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed">{q.question}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-10">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getScoreBg(q.score)} ${getScoreColor(q.score)}`}>
                      Score: {q.score}/10
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                      Confidence: {q.confidence}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
                      Communication: {q.communication}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 font-medium">
                      Correctness: {q.correctness}
                    </span>
                  </div>
                  {q.feedback && (
                    <div className="pl-10">
                      <p className="text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2">
                        💬 {q.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center pb-8">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-emerald-500 text-emerald-600 font-semibold rounded-full hover:bg-emerald-50 transition"
            >
              🏠 Go Home
            </button>
            <button
              onClick={() => navigate("/interview")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition shadow-md"
            >
              🔄 New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600">Interview History</h1>
            <p className="text-gray-400 text-sm mt-1">Your past AI interviews</p>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-full transition shadow-md text-sm"
          >
            + New Interview
          </button>
        </div>

        {/* Empty state */}
        {interviews.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No interviews yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start your first AI interview to see your history here</p>
            <button
              onClick={() => navigate("/interview")}
              className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-emerald-700 transition"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview, i) => (
              <div
                key={interview._id || i}
                onClick={() => setSelected(interview)}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    {/* Score badge */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${getScoreBg(interview.finalScore)} ${getScoreColor(interview.finalScore)}`}>
                      {interview.finalScore ?? "—"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 capitalize text-base">
                        {interview.role || "Unknown Role"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {interview.experience} • {interview.mode} Interview
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {formatDate(interview.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getScoreBg(interview.finalScore)} ${getScoreColor(interview.finalScore)}`}>
                      {getScoreLabel(interview.finalScore)}
                    </span>
                    <span className="text-xs text-gray-300">
                      {interview.questions?.length || 0} questions →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewReport;