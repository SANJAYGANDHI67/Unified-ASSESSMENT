import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function AssessmentDetails() {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();

  /* ======================
     STATE
  ====================== */
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  /* ======================
     FETCH ASSESSMENT
  ====================== */
  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        setAssessment(res.data);
      } catch (err) {
        console.error("FETCH ASSESSMENT ERROR:", err);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [assessmentId]);

  /* ======================
     START ASSESSMENT
  ====================== */
  const handleStartAssessment = async () => {
    try {
      setStarting(true);

      const res = await api.post(`/submissions/start/${assessment.id}`);

      const submissionId = res.data?.id;
      if (!submissionId) throw new Error("submissionId not returned");

      navigate(`/student/attempt/${submissionId}`, { replace: true });
    } catch (err) {
      console.error("START ASSESSMENT ERROR:", err);
      alert(err.response?.data?.error || "Failed to start assessment");
    } finally {
      setStarting(false);
    }
  };

  /* ======================
     RENDER STATES
  ====================== */
  if (loading) return <div className="p-8">Loading assessment…</div>;
  if (error || !assessment)
    return <div className="p-8 text-red-600">{error}</div>;

  

console.log("Assessment Object:", assessment);
console.log("Assessment Status:", assessment.status);


    const isStartDisabled =
  assessment.status?.toLowerCase() !== "published" || starting;

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {assessment.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Read the instructions carefully before starting
            </p>
          </div>

          <span className="mt-3 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {assessment.status?.toUpperCase()}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-700 mb-6">
          {assessment.description}
        </p>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <InfoCard label="Total Marks" value={assessment.total_marks} />
          <InfoCard label="Assessment Status" value={assessment.status?.toUpperCase()} />
        </div>

        {/* INSTRUCTIONS */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-800">
            Instructions
          </h3>

          <ul className="space-y-2 text-sm text-gray-700">
            <Instruction>Do not refresh the page during the assessment.</Instruction>
            <Instruction>The timer starts once you click Start.</Instruction>
            <Instruction>All questions are mandatory.</Instruction>
            <Instruction>No reattempt after submission.</Instruction>
          </ul>
        </div>

        {/* WARNING */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          ⚠️ This assessment must be completed in one continuous session.
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <button
            disabled={isStartDisabled}
            onClick={handleStartAssessment}
            className={`px-8 py-3 rounded-md text-white text-sm font-medium transition
              ${
                isStartDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {starting ? "Starting…" : "Start Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================
   REUSABLE
====================== */
function InfoCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

function Instruction({ children }) {
  return (
    <li className="flex gap-2">
      <span className="text-blue-600 font-bold">•</span>
      <span>{children}</span>
    </li>
  );
}