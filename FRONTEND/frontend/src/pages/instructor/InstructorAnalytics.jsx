import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


  
  export default function AssessmentAnalytics() {

  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    assessment: null,
    metrics: {
      totalAttempts: 0,
      evaluated: 0,
      averageScore: 0,
      completionRate: 0,
    },
    scoreDistribution: [],
    questionTypes: [],
    students: [],
    questions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/analytics/${assessmentId}`);

      setData({
        assessment: res.data?.assessment || null,
        metrics: res.data?.metrics || {
          totalAttempts: 0,
          evaluated: 0,
          averageScore: 0,
          completionRate: 0,
        },
        scoreDistribution: res.data?.scoreDistribution || [],
        questionTypes: res.data?.questionTypes || [],
        students: res.data?.students || [],
        questions: res.data?.questions || [],
      });
    } catch (err) {
      console.error("ANALYTICS ERROR:", err);
      setError("Failed to load assessment analytics");
    } finally {
      setLoading(false);
    }
  };

  if (assessmentId) {
    fetchAnalytics();
  }
}, [assessmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl border p-8 text-center">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => navigate("/instructor/tests")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
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

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Export Report
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ================= ASSESSMENT INFO ================= */}
        <div className="bg-white border rounded-xl p-5">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">

            <InfoItem
              label="Assessment"
              value={data.assessment?.title || "—"}
            />

            <InfoItem
              label="Questions"
              value={data.assessment?.questions ?? "—"}
            />

            <InfoItem
              label="Total Marks"
              value={data.assessment?.total_marks ?? "—"}
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
              value={data.assessment?.status || "—"}
            />

          </div>

        </div>

        {/* ================= KEY METRICS ================= */}
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
              title="Total Attempts"
              value={data.metrics.totalAttempts}
              description="Student submissions"
              icon="👥"
              iconStyle="bg-blue-50 text-blue-600"
            />

            <MetricCard
              title="Evaluated"
              value={data.metrics.evaluated}
              description="Completed evaluations"
              icon="✓"
              iconStyle="bg-green-50 text-green-600"
            />

            <MetricCard
              title="Average Score"
              value={`${data.metrics.averageScore}%`}
              description="Overall performance"
              icon="★"
              iconStyle="bg-purple-50 text-purple-600"
            />

            <MetricCard
              title="Completion Rate"
              value={`${data.metrics.completionRate}%`}
              description="Assessment completion"
              icon="↗"
              iconStyle="bg-orange-50 text-orange-600"
            />

          </div>
        </div>

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SCORE DISTRIBUTION */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Score Distribution
              </h2>

              <p className="text-sm text-gray-500">
                Student performance across score ranges
              </p>
            </div>

            <div className="h-72">

              {data.scoreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.scoreDistribution}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No score distribution data available" />
              )}

            </div>
          </div>

          {/* QUESTION TYPES */}
          <div className="bg-white border rounded-xl p-6">

            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Types
              </h2>

              <p className="text-sm text-gray-500">
                Question distribution
              </p>
            </div>

            <div className="h-72">

              {data.questionTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>

                    <Pie
                      data={data.questionTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.questionTypes.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />

                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No question type data available" />
              )}

            </div>
          </div>

        </div>

        {/* ================= STUDENT PERFORMANCE ================= */}
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

                {data.students.length > 0 ? (
                  data.students.map((student) => (

                    <tr
                      key={student.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

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

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={student.status}
                        />
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {student.score !== null &&
                        student.score !== undefined
                          ? student.score
                          : "—"}
                      </td>

                      <td className="px-6 py-4">

                        {student.percentage !== null &&
                        student.percentage !== undefined
                          ? `${student.percentage}%`
                          : "—"}

                      </td>

                      <td className="px-6 py-4 text-right">

                        {student.id && (
                          <button
                            onClick={() =>
                              
                              navigate(`/instructor/evaluate/submission/${student.id}`)
                            }
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                        )}

                      </td>

                    </tr>

                  ))
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

        {/* ================= QUESTION PERFORMANCE ================= */}
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

                {data.questions.length > 0 ? (
                  data.questions.map((question, index) => (

                    <tr
                      key={question.id || index}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-medium text-gray-900">
                          {question.title ||
                            question.question ||
                            `Question ${index + 1}`}
                        </div>

                      </td>

                      <td className="px-6 py-4">
                        {question.attempts ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        {question.correct ?? "—"}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {question.accuracy !== null &&
                        question.accuracy !== undefined
                          ? `${question.accuracy}%`
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <DifficultyBadge
                          value={question.difficulty}
                        />
                      </td>

                    </tr>

                  ))
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
   SMALL COMPONENTS
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

function SectionHeader({ title, subtitle }) {
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

function DifficultyBadge({ value }) {
  if (!value) {
    return <span className="text-gray-400">—</span>;
  }

  const difficulty = String(value).toLowerCase();

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

function EmptyState({ text }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-gray-400">
      {text}
    </div>
  );
}

/* ================= COLORS ================= */

const PIE_COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
];