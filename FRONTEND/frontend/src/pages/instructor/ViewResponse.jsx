import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";

export default function ViewResponse() {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  /* ======================
     DATA
  ====================== */
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");

  const [aiScore, setAiScore] = useState(0);
  const [maxMarks, setMaxMarks] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("");

  const [finalScore, setFinalScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  /* ======================
     FETCH RESPONSE + AI EVAL
  ====================== */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/evaluations/${submissionId}`);

        setQuestion(res.data.question);
        setStudentAnswer(res.data.answer);

        setAiScore(res.data.ai_score);
        setMaxMarks(res.data.max_marks);
        setAiFeedback(res.data.ai_feedback || "");

        // default instructor score = AI score
        setFinalScore(res.data.ai_score);
      } catch (e) {
        console.error(e);
        setError("Failed to load submission evaluation");
      } finally {
        setFetching(false);
      }
    }

    if (submissionId) load();
  }, [submissionId]);

  /* ======================
     SUBMIT FINAL EVAL
  ====================== */
  const handleSubmitEvaluation = async () => {
    if (finalScore < 0 || finalScore > maxMarks) {
      alert(`Score must be between 0 and ${maxMarks}`);
      return;
    }

    try {
      setLoading(true);

      await api.post(`/evaluations/${submissionId}/submit`, {
        final_score: Number(finalScore),
        feedback: feedback.trim(),
      });

      navigate("/instructor/tests", { replace: true });
    } catch (err) {
      console.error("SUBMIT EVALUATION ERROR:", err);
      alert("Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Loading evaluation...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Evaluate Student Response
          </h1>
          <p className="text-sm text-gray-500">
            AI provides suggestions · Instructor makes final decision
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* QUESTION */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Question</h3>
        <p>{question}</p>
      </section>

      {/* STUDENT ANSWER */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Student Answer</h3>
        <p>{studentAnswer}</p>
      </section>

      {/* AI EVALUATION */}
      <section className="rounded-lg border bg-blue-50 p-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          AI Evaluation
        </h3>
        <p className="text-sm mb-3">{aiFeedback || "No AI feedback provided."}</p>
        <p className="text-sm font-medium">
          Suggested Score: {aiScore} / {maxMarks}
        </p>
      </section>

      {/* FINAL SCORE */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Maximum Marks</p>
          <p className="text-lg font-semibold">{maxMarks}</p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <label className="text-sm text-gray-500 mb-1 block">
            Instructor Final Score
          </label>
          <input
            type="number"
            min={0}
            max={maxMarks}
            value={finalScore}
            onChange={(e) => setFinalScore(e.target.value)}
            className="w-28 rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">
          Instructor Feedback (Optional)
        </h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full min-h-[120px] rounded-md border px-3 py-2 text-sm"
          placeholder="Add qualitative feedback for the student…"
        />
      </section>

      {/* ACTION */}
      <div className="flex justify-end">
        <Button onClick={handleSubmitEvaluation} disabled={loading}>
          {loading ? "Submitting..." : "Submit Final Evaluation"}
        </Button>
      </div>
    </div>
  );
}