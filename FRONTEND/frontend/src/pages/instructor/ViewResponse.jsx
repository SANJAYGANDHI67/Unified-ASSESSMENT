import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";

export default function ViewResponse() {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [finalScore, setFinalScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/submissions/${submissionId}/details`);

        setQuestions(res.data);

        let total = 0;
        let score = 0;

        res.data.forEach((q) => {
          total += q.marks;

          if (
            q.question_type === "mcq" &&
            q.student_answer === q.correct_option
          ) {
            score += q.marks;
          }
        });

        setFinalScore(score);
      } catch (err) {
        console.error(err);
        setError("Failed to load submission evaluation");
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [submissionId]);

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await api.post(`/evaluations/${submissionId}/submit`, {
        final_score: finalScore,
        feedback,
      });

      alert("Evaluation Submitted");

      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Evaluate Submission
        </h1>

        <Button onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {questions.map((q, index) => {

        const correct =
          q.question_type === "mcq" &&
          q.student_answer === q.correct_option;

        return (
          <div
            key={q.question_id}
            className="border rounded-lg p-5 bg-white shadow"
          >

            <h2 className="font-semibold mb-3">
              Q{index + 1}. {q.question}
            </h2>

            <p>
              <b>Student Answer:</b> {q.student_answer}
            </p>

            {q.question_type === "mcq" && (
              <>
                <p>
                  <b>Correct Answer:</b> {q.correct_option}
                </p>

                <p
                  className={
                    correct
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {correct ? "Correct" : "Wrong"}
                </p>
              </>
            )}

            {q.question_type === "descriptive" && (
  <>
    <div className="mt-4">
      <p className="font-semibold">
        Reference Answer
      </p>

      <p className="mt-1 text-gray-700">
        {q.reference_answer}
      </p>
    </div>

    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">

      <h3 className="font-semibold text-blue-700">
        AI Evaluation
      </h3>

      <p className="mt-2">
        <b>AI Score:</b>{" "}
        {q.ai_score ?? "Not Evaluated"} / {q.marks}
      </p>

      <p className="mt-2">
        <b>AI Feedback:</b>
      </p>

      <p className="mt-1 text-gray-700">
        {q.ai_feedback || "No feedback available"}
      </p>

    </div>
  </>
)}
          </div>
        );
      })}

      <div className="border rounded-lg p-5 bg-gray-50">

        <h2 className="font-semibold text-lg">
          Final Evaluation
        </h2>

        <p className="mt-2">
          Total Marks : {totalMarks}
        </p>

        <div className="mt-4">
          <label className="block mb-2">
            Final Score
          </label>

          <input
            type="number"
            min={0}
            max={totalMarks}
            value={finalScore}
            onChange={(e) =>
              setFinalScore(Number(e.target.value))
            }
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            Instructor Feedback
          </label>

          <textarea
            rows={4}
            value={feedback}
            onChange={(e) =>
              setFeedback(e.target.value)
            }
            className="border rounded w-full p-3"
          />
        </div>

        <div className="mt-5">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Final Evaluation"}
          </Button>
        </div>

      </div>

    </div>
  );
}