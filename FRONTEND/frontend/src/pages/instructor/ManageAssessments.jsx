import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";

export default function ManageTests() {
  const navigate = useNavigate();

  /* =========================
     STATE
  ========================= */
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH ASSESSMENTS
     ✅ FIXED ENDPOINT
     GET /api/assessments/instructor/manage
  ========================= */
  useEffect(() => {
    async function fetchAssessments() {
      try {
        setLoading(true);
        setError("");

        // ✅ THIS IS THE ONLY REQUIRED FIX
        const res = await api.get("/assessments/instructor/manage");

        setAssessments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load assessments"
        );
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []);

  /* =========================
     VIEW ASSESSMENT
  ========================= */
  const handleView = (id) => {
    navigate(`/instructor/builder/${id}`);
  };

  /* =========================
     DELETE ASSESSMENT
  ========================= */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this assessment?"
    );
    if (!confirm) return;

    try {
      await api.delete(`/assessments/${id}`);

      // Remove from UI
      setAssessments((prev) =>
        prev.filter((a) => a.id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Delete failed due to server error"
      );
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return <p className="p-6">Loading assessments...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Manage Assessments
      </h1>

      {error && (
        <div className="bg-yellow-50 border p-4 mb-4 rounded">
          {error}
        </div>
      )}

      {assessments.length === 0 ? (
        <div className="bg-white border rounded-md p-6">
          <p>No assessments found.</p>
          <button
            onClick={() => navigate("/instructor/builder")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create Your First Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="border p-4 bg-white rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">
                  {a.title}
                </h3>

                <p className="text-sm text-gray-600">
                  Status: {a.status}
                </p>

                <p className="text-sm text-gray-600">
                  Questions: {a.question_count} |{" "}
                  Submissions: {a.submission_count}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleView(a.id)}
                >
                  View
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}