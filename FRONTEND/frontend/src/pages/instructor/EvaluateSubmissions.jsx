import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function EvaluateSubmissions() {
  const navigate = useNavigate();
  const { assessmentId } = useParams(); // ✅ REQUIRED

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      if (!assessmentId) {
        throw new Error("Assessment ID missing in route");
      }

      // ✅ CORRECT API CALL
      const res = await api.get(
        `/submissions/evaluate/${assessmentId}`
      );

      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch submissions error:", err);

      if (err.response?.status === 404) {
        setError("No submissions found for this assessment.");
      } else {
        setError("Failed to load submissions.");
      }

      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assessmentId]); // ✅ dependency added

  if (loading) {
    return <div className="p-6">Loading submissions…</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">
        Evaluate Submissions
      </h1>

      {error && (
        <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Student</th>
              <th>Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-gray-500"
                >
                  No submissions available
                </td>
              </tr>
            ) : (
              submissions.map((s) => {
                const status = String(s.status || "SUBMITTED").toUpperCase();

                return (
                  <tr key={s.id} className="border-b">
                    <td className="p-4">
                      {s.student_name || s.student_email || "—"}
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded text-xs ${
                          status === "EVALUATED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/instructor/evaluate/${s.id}`
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}