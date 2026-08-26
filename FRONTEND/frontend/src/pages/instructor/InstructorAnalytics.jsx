import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function InstructorAnalytics() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [data, setData] = useState({
    assessment: null,

    kpis: {
      studentsAttempted: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passPercentage: 0,
      failPercentage: 0,
      pendingEvaluations: 0,
    },

    questionAnalytics: [],
    topStudents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH ANALYTICS
  ===================================================== */

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      if (!assessmentId) {
        setError("Assessment ID is missing.");
        return;
      }

      const res = await api.get(`/analytics/${assessmentId}`);

      const d = res?.data || {};

      setData({
        assessment: d.assessment || null,

        kpis: {
          studentsAttempted:
            d.kpis?.studentsAttempted ?? 0,

          averageScore:
            d.kpis?.averageScore ?? 0,

          highestScore:
            d.kpis?.highestScore ?? 0,

          lowestScore:
            d.kpis?.lowestScore ?? 0,

          passPercentage:
            d.kpis?.passPercentage ?? 0,

          failPercentage:
            d.kpis?.failPercentage ?? 0,

          pendingEvaluations:
            d.kpis?.pendingEvaluations ?? 0,
        },

        questionAnalytics: Array.isArray(
          d.questionAnalytics
        )
          ? d.questionAnalytics
          : [],

        topStudents: Array.isArray(d.topStudents)
          ? d.topStudents
          : [],
      });
    } catch (err) {
      console.error(
        "ASSESSMENT ANALYTICS ERROR:",
        err
      );

      console.error(
        "API RESPONSE:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load assessment analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    fetchAnalytics();
  }, [assessmentId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border rounded-xl px-8 py-6 text-center shadow-sm">

          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm font-medium text-gray-700">
            Loading assessment analytics...
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Please wait
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">

        <div className="max-w-5xl mx-auto">

          <div className="bg-white border border-red-100 rounded-xl p-10 text-center shadow-sm">

            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl">
              !
            </div>

            <h1 className="text-lg font-semibold text-gray-900">
              Unable to load analytics
            </h1>

            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <button
                onClick={fetchAnalytics}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Retry
              </button>

              <button
                onClick={() =>
                  navigate("/instructor/tests")
                }
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Back to Assessments
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">

                <button
                  onClick={() =>
                    navigate("/instructor/tests")
                  }
                  className="hover:text-blue-600"
                >
                  Assessments
                </button>

                <span>/</span>

                <span>Analytics</span>

              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Assessment Analytics
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {data.assessment?.title ||
                  "Assessment performance overview"}
              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  navigate("/instructor/tests")
                }
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* =================================================
            ASSESSMENT OVERVIEW
        ================================================= */}

        <div className="bg-white border rounded-xl">

          <SectionHeader
            title="Assessment Overview"
            subtitle="Basic assessment information"
          />

          <div className="px-6 pb-6">

            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">

              <InfoItem
                label="Assessment"
                value={
                  data.assessment?.title || "—"
                }
              />

              <InfoItem
                label="Questions"
                value={
                  data.assessment?.questions ?? "—"
                }
              />

              <InfoItem
                label="Total Marks"
                value={
                  data.assessment?.total_marks ?? "—"
                }
              />

              <InfoItem
                label="Duration"
                value={
                  data.assessment?.duration
                    ? `${data.assessment.duration} min`
                    : "—"
                }
              />

              <InfoItem
                label="Status"
                value={
                  data.assessment?.status || "—"
                }
              />

            </div>

          </div>

        </div>

        {/* =================================================
            KEY METRICS
        ================================================= */}

        <div>

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-gray-900">
              Key Metrics
            </h2>

            <p className="text-sm text-gray-500">
              Current assessment performance
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <MetricCard
              title="Students Attempted"
              value={data.kpis.studentsAttempted}
              description="Students who attempted"
              icon="👥"
              iconStyle="bg-blue-50 text-blue-600"
            />

            <MetricCard
              title="Average Score"
              value={`${data.kpis.averageScore}%`}
              description="Overall performance"
              icon="★"
              iconStyle="bg-purple-50 text-purple-600"
            />

            <MetricCard
              title="Pass Rate"
              value={`${data.kpis.passPercentage}%`}
              description="Students who passed"
              icon="✓"
              iconStyle="bg-green-50 text-green-600"
            />

            <MetricCard
              title="Pending Evaluations"
              value={data.kpis.pendingEvaluations}
              description="Awaiting evaluation"
              icon="⏳"
              iconStyle="bg-orange-50 text-orange-600"
            />

          </div>

        </div>

        {/* =================================================
            STUDENT PERFORMANCE
        ================================================= */}

        <div className="bg-white border rounded-xl">

          <SectionHeader
            title="Student Performance"
            subtitle="Individual student assessment results"
          />

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-t border-b bg-gray-50 text-gray-500">

                  <th className="text-left px-6 py-3 font-medium">
                    Student
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Status
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Score
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Percentage
                  </th>

                  <th className="text-right px-6 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.topStudents.length > 0 ? (

                  data.topStudents.map(
                    (student, index) => (

                      <tr
                        key={
                          student.id ||
                          student.submission_id ||
                          index
                        }
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        {/* STUDENT */}

                        <td className="px-6 py-4">

                          <div className="font-medium text-gray-900">
                            {student.name ||
                              student.student_name ||
                              "Unknown Student"}
                          </div>

                          {student.email && (
                            <div className="text-xs text-gray-500 mt-1">
                              {student.email}
                            </div>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={student.status}
                          />

                        </td>

                        {/* SCORE */}

                        <td className="px-6 py-4 font-medium">

                          {student.score !== null &&
                          student.score !== undefined
                            ? student.score
                            : "—"}

                        </td>

                        {/* PERCENTAGE */}

                        <td className="px-6 py-4">

                          {student.percentage !== null &&
                          student.percentage !== undefined
                            ? `${student.percentage}%`
                            : "—"}

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4 text-right">

                          {(student.id ||
                            student.submission_id) && (

                            <button
                              onClick={() =>
                                navigate(
                                  `/instructor/evaluate/submission/${
                                    student.submission_id ||
                                    student.id
                                  }`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No student performance data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            QUESTION PERFORMANCE
        ================================================= */}

        <div className="bg-white border rounded-xl">

          <SectionHeader
            title="Question Performance"
            subtitle="Identify difficult and high-performing questions"
          />

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-t border-b bg-gray-50 text-gray-500">

                  <th className="text-left px-6 py-3 font-medium">
                    Question
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Attempts
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Correct
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Accuracy
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Difficulty
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.questionAnalytics.length > 0 ? (

                  data.questionAnalytics.map(
                    (question, index) => (

                      <tr
                        key={
                          question.id || index
                        }
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        {/* QUESTION */}

                        <td className="px-6 py-4">

                          <div className="font-medium text-gray-900">

                            {question.title ||
                              question.question ||
                              `Question ${index + 1}`}

                          </div>

                        </td>

                        {/* ATTEMPTS */}

                        <td className="px-6 py-4">

                          {question.attempts ?? "—"}

                        </td>

                        {/* CORRECT */}

                        <td className="px-6 py-4">

                          {question.correct ?? "—"}

                        </td>

                        {/* ACCURACY */}

                        <td className="px-6 py-4 font-medium">

                          {question.accuracy !== null &&
                          question.accuracy !== undefined
                            ? `${question.accuracy}%`
                            : "—"}

                        </td>

                        {/* DIFFICULTY */}

                        <td className="px-6 py-4">

                          <DifficultyBadge
                            value={
                              question.difficulty
                            }
                          />

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No question performance data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({ label, value }) {
  return (
    <div>

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-900 truncate">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({
  title,
  value,
  description,
  icon,
  iconStyle,
}) {
  return (
    <div className="bg-white border rounded-xl p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${iconStyle}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="px-6 py-5">

      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const normalized = String(status || "")
    .toLowerCase();

  if (normalized === "evaluated") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
        Evaluated
      </span>
    );
  }

  if (
    normalized === "submitted" ||
    normalized === "completed"
  ) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        Submitted
      </span>
    );
  }

  if (
    normalized === "in_progress" ||
    normalized === "in progress"
  ) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
        In Progress
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      {status || "Unknown"}
    </span>
  );
}

/* =====================================================
   DIFFICULTY BADGE
===================================================== */

function DifficultyBadge({ value }) {
  if (!value) {
    return (
      <span className="text-gray-400">
        —
      </span>
    );
  }

  const difficulty =
    String(value).toLowerCase();

  if (difficulty === "easy") {
    return (
      <span className="text-green-600 font-medium">
        Easy
      </span>
    );
  }

  if (difficulty === "hard") {
    return (
      <span className="text-red-600 font-medium">
        Hard
      </span>
    );
  }

  return (
    <span className="text-yellow-600 font-medium">
      Medium
    </span>
  );
}