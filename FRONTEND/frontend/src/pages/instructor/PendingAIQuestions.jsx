import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function PendingAIQuestions() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const hasGeneratedRef = useRef(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ======================
     LOAD + GENERATE AI
  ====================== */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 🔒 Generate only once
        if (!hasGeneratedRef.current) {
          hasGeneratedRef.current = true;
          await api.post(`/ai/generate/${assessmentId}`);
        }

        // ✅ FIXED — ALWAYS USE AI ROUTER
        const qRes = await api.get(`/ai/questions/${assessmentId}`);
        const raw = Array.isArray(qRes.data) ? qRes.data : [];

        const normalized = raw.map((q) => ({
          ...q,
          _marks: q.marks,
        }));

        setQuestions(normalized);
      } catch (err) {
        console.error("AI LOAD ERROR:", err);
        setError("Failed to load AI questions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [assessmentId]);

  /* ======================
     APPROVE QUESTION
  ====================== */
  const approve = async (q) => {
    try {
      await api.post(`/ai/approve/${q.id}`, {
        question_type: q.question_type,
        marks: q.question_type === "mcq" ? q.marks : q._marks,
        options: q.question_type === "mcq" ? q.options : null,
        correct_option:
          q.question_type === "mcq" ? q.correct_option : null,
      });

      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  /* ======================
     REJECT QUESTION
  ====================== */
  const reject = async (id) => {
    try {
      await api.post(`/ai/reject/${id}`);
      setQuestions((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  /* ======================
     UI STATES
  ====================== */
  if (loading) return <p className="p-6">Generating AI questions…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Pending AI Questions</h1>
        <button
          onClick={() => navigate(`/instructor/builder/${assessmentId}`)}
          className="text-blue-600 underline"
        >
          Back to Builder
        </button>
      </div>

      {questions.length === 0 ? (
        <p>No pending AI questions.</p>
      ) : (
        questions.map((q, i) => {
          let options = [];
          try {
            options =
              typeof q.options === "string"
                ? JSON.parse(q.options)
                : Array.isArray(q.options)
                ? q.options
                : [];
          } catch {}

          return (
            <div key={q.id} className="border rounded p-5 mb-4 bg-white">
              <p className="font-medium mb-2">
                {i + 1}. {q.question}
              </p>

              {q.question_type === "mcq" && options.length > 0 && (
                <ul className="list-disc pl-6 mb-3 text-sm">
                  {options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={
                        String.fromCharCode(65 + idx) === q.correct_option
                          ? "font-semibold text-green-700"
                          : ""
                      }
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <label className="block mb-1">Question Type</label>
                  <input
                    className="border p-1 bg-gray-100"
                    value={q.question_type.toUpperCase()}
                    disabled
                  />
                </div>

                {q.question_type === "descriptive" && (
                  <div>
                    <label className="block mb-1">Marks</label>
                    <select
                      className="border p-1"
                      value={q._marks}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((x) =>
                            x.id === q.id
                              ? { ...x, _marks: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    >
                      {[2, 5, 10, 15].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => approve(q)}
                >
                  Approve
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  onClick={() => reject(q.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}