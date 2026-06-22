import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ======================
     FETCH SUBMISSIONS
  ====================== */
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await api.get("/submissions/my-submissions");
        setSubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("FETCH SUBMISSIONS ERROR:", err);
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  /* ======================
     STATES
  ====================== */
  if (loading) {
    return <p className="p-8">Loading submissions...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">My Submissions</h1>
      <p className="text-gray-600 mb-6">
        Track your assessment progress and evaluation status
      </p>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="px-6 py-3">Assessment</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No submissions found
                </td>
              </tr>
            ) : (
              submissions.map((item) => {
                const status = String(item.status || "").toUpperCase();

                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4 font-medium">
                      {item.assessment_title || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          status === "SUBMITTED"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {status || "IN_PROGRESS"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {/* ✅ PASS submission id */}
                      <button
                        onClick={() =>
                          navigate(
                            `/student/attempt/${item.id}`
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        View
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