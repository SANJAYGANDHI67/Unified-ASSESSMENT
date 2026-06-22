import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function MyAssessments() {
  const navigate = useNavigate();

  /* ======================
     STATE
  ====================== */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ======================
     FETCH DATA
  ====================== */
  useEffect(() => {
    async function fetchAssessments() {
      try {
        setLoading(true);
        setError("");

        const [assRes, subRes] = await Promise.all([
          api.get("/assessments/published"),
          api.get("/submissions/my-submissions"),
        ]);

        /* ----------------------
           MAP SUBMISSIONS
        ---------------------- */
        const submissionsByAssessment = (subRes.data || []).reduce(
          (acc, s) => {
            acc[s.assessment_id] = s;
            return acc;
          },
          {}
        );

        /* ----------------------
           MERGE + NORMALIZE STATUS
        ---------------------- */
        const merged = (assRes.data || []).map((assessment) => {
          const sub = submissionsByAssessment[assessment.id];

          let attemptStatus = "NOT STARTED";

          if (sub) {
            if (sub.status === "in_progress") attemptStatus = "IN_PROGRESS";
            if (sub.status === "submitted") attemptStatus = "SUBMITTED";
            if (sub.status === "evaluated") attemptStatus = "EVALUATED";
          }

          return {
            ...assessment,
            attemptStatus,
            submissionId: sub ? sub.id : null,
          };
        });

        setAssessments(merged);
      } catch (err) {
        console.error("MY ASSESSMENTS ERROR:", err);
        setError("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []);

  /* ======================
     FILTERING
  ====================== */
  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      !search || a.title?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || a.attemptStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <p className="p-8">Loading assessments…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  /* ======================
     UI
  ====================== */
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Assessments</h1>
        <p className="text-sm text-gray-500 mt-1">
          View, start, or resume your assigned assessments
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessment…"
          className="border px-4 py-2 rounded-md w-full md:w-72 focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-48"
        >
          <option value="ALL">All Status</option>
          <option value="NOT STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="EVALUATED">Evaluated</option>
        </select>
      </div>

      {/* LIST */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
          No assessments available for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssessments.map((a) => {
            const isSubmittedOrEvaluated =
              a.attemptStatus === "SUBMITTED" ||
              a.attemptStatus === "EVALUATED";

            const isInProgress = a.attemptStatus === "IN_PROGRESS";
            const isStartable = a.attemptStatus === "NOT STARTED";

            return (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* CONTENT */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {a.title}
                    </h2>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {a.description}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between mt-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          a.attemptStatus === "NOT STARTED"
                            ? "bg-blue-100 text-blue-700"
                            : a.attemptStatus === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {a.attemptStatus}
                    </span>

                    <button
                      disabled={isSubmittedOrEvaluated}
                      onClick={() => {
                        if (isStartable) {
                          navigate(`/student/assessments/${a.id}`);
                        } else if (isInProgress && a.submissionId) {
                          navigate(`/student/attempt/${a.submissionId}`);
                        }
                      }}
                      className={`px-5 py-2 text-sm font-medium rounded-md transition
                        ${
                          isSubmittedOrEvaluated
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : isInProgress
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                      {isSubmittedOrEvaluated
                        ? "Completed"
                        : isInProgress
                        ? "Resume"
                        : "Start"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}