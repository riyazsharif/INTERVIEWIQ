import React from "react";
import { useNavigate } from "react-router-dom";

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No report data found.</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

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

  const CircleScore = ({ value, label, color }) => {
    const pct = Math.min((value / 10) * 100, 100);
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke={color}
              strokeWidth="8"
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

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-600 mb-1">
            Interview Report
          </h1>
          <p className="text-gray-400 text-sm">
            Here's how you performed in your AI interview
          </p>
        </div>

        {/* Final Score Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400 font-medium mb-2 uppercase tracking-widest">
            Final Score
          </p>
          <div
            className={`text-7xl font-bold mb-3 ${getScoreColor(finalScore)}`}
          >
            {finalScore}
            <span className="text-3xl text-gray-300">/10</span>
          </div>
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getScoreBg(finalScore)} ${getScoreColor(finalScore)}`}
          >
            {getScoreLabel(finalScore)}
          </span>
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">
            Performance Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            <CircleScore value={confidence} label="Confidence" color="#10b981" />
            <CircleScore value={communication} label="Communication" color="#3b82f6" />
            <CircleScore value={correctness} label="Correctness" color="#f59e0b" />
          </div>
        </div>

        {/* Question Wise Score */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6">
            Question-wise Breakdown
          </h2>
          <div className="space-y-5">
            {questionWiseScore.map((q, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl p-5 bg-gray-50 space-y-3"
              >
                {/* Question */}
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 font-medium text-sm leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Score + metrics */}
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

                {/* Feedback */}
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
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition shadow-md"
          >
            🔄 New Interview
          </button>
        </div>

      </div>
    </div>
  );
}

export default Step3Report;