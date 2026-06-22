import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function AttemptAssessment() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submissionIdState, setSubmissionIdState] = useState(submissionId || null);
  const [assessmentIdState, setAssessmentIdState] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===============================
     INIT ATTEMPT
  =============================== */
  useEffect(() => {
    async function init() {
      try {
        const res = await api.get(`/submissions/${submissionId}/answers`);
        const data = res.data;
        
        if (!data || !data.submission) {
          throw new Error("Submission not found");
        }

        const sub = data.submission;
        const aid = sub.assessment_id;
        
        if (!aid) {
          throw new Error("Assessment ID not found");
        }

        setSubmissionIdState(submissionId);
        setAssessmentIdState(aid);

        const qRes = await api.get(`/assessments/${aid}/questions`);
        setQuestions(qRes.data || []);

        const savedAnswers = (data.answers || []).reduce((acc, a) => {
          if (a.question_id) {
            acc[a.question_id] = a.answer || "";
          }
          return acc;
        }, {});
        setAnswers(savedAnswers);
      } catch (e) {
        console.error("INIT ATTEMPT ERROR:", e);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [submissionId]);

  const currentQuestion = questions[currentIndex];
  const questionType = currentQuestion?.question_type?.toLowerCase();

  const handleAnswerChange = async (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));

    if (submissionIdState) {
      try {
        await api.post(`/submissions/${submissionIdState}/answers`, {
          question_id: qid,
          answer: value,
        });
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    }
  };

  const isSubmitDisabled = questions.some((q) => !answers[q.id]);

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? This cannot be undone.")) {
      return;
    }

    try {
      await api.post(`/submissions/${submissionIdState}/submit`);

      navigate("/student/success");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert(err.response?.data?.error || "Failed to submit assessment");
    }
  };

  if (loading) return <p className="p-8">Loading assessment…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!questions.length) return <p className="p-8">No questions found</p>;

  /* ===============================
     MCQ OPTIONS PARSE
  =============================== */
  function parseOptions(optionsRaw) {
    if (!optionsRaw) return [];

    if (Array.isArray(optionsRaw)) {
      return optionsRaw.map((o, i) => ({
        value: String.fromCharCode(65 + i),
        label: String(o),
      }));
    }

    try {
      const parsed = JSON.parse(optionsRaw);
      if (Array.isArray(parsed)) {
        return parsed.map((o, i) => ({
          value: String.fromCharCode(65 + i),
          label: String(o),
        }));
      }
    } catch {}

    return String(optionsRaw)
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line, i) => ({
        value: String.fromCharCode(65 + i),
        label: line.replace(/^[A-D][.)]\s*/, ""),
      }));
  }

  const parsedOptions =
    questionType === "mcq" ? parseOptions(currentQuestion.options) : [];

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* MAIN */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-5">
              {currentQuestion.question}
            </h2>

            {/* MCQ */}
            {questionType === "mcq" && (
              <div className="space-y-3 mb-6">
                {parsedOptions.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition
                      ${
                        answers[currentQuestion.id] === opt.value
                          ? "border-blue-600 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`q_${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === opt.value}
                      onChange={() =>
                        handleAnswerChange(currentQuestion.id, opt.value)
                      }
                    />
                    <span className="font-medium">
                      {opt.value}. {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* DESCRIPTIVE */}
            {questionType === "descriptive" && (
              <textarea
                className="w-full border rounded-lg p-4 mb-6 focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Write your answer here…"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
              />
            )}

            {/* NAV */}
            <div className="flex justify-between items-center">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
                className="px-5 py-2 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-md text-white font-medium
                    ${
                      isSubmitDisabled
                        ? "bg-gray-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Next
                </button>
              )}
            </div>

            {isSubmitDisabled && (
              <p className="mt-4 text-sm text-red-600">
                ⚠ Please answer all questions before submitting.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-l p-6 hidden lg:block">
        <h3 className="font-semibold mb-4">Question Palette</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`py-2 rounded text-sm font-medium
                ${
                  i === currentIndex
                    ? "bg-blue-600 text-white"
                    : answers[q.id]
                    ? "bg-green-200"
                    : "bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}