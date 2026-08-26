import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StudentDashboard() {
  const navigate = useNavigate();

  /* ======================
     STATE
  ====================== */

  const [stats, setStats] = useState({
    totalAssessments: 0,
    completed: 0,
    inProgress: 0,
    averageScore: 0,
    performanceData: [],
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ======================
     FETCH DASHBOARD DATA
  ====================== */

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        const res = await api.get("/dashboard/student");
        const d = res?.data || {};

        setStats({
          totalAssessments: d.totalAssessments ?? 0,
          completed: d.completed ?? 0,
          inProgress: d.inProgress ?? 0,
          averageScore: d.averageScore ?? 0,

          performanceData: Array.isArray(d.performanceData)
            ? d.performanceData
            : [],

          recentActivity: Array.isArray(d.recentActivity)
            ? d.recentActivity
            : [],
        });
      } catch (err) {
        console.error("STUDENT DASHBOARD ERROR:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  /* ======================
     LOADING / ERROR
  ====================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 text-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ======================
         HEADER
      ====================== */}

      <header className="bg-white border-b">
        <div className="px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Track your assessments and learning progress
            </p>
          </div>

          <button
            onClick={() => navigate("/student/profile")}
            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              S
            </div>

            <span className="text-sm font-medium text-gray-700">
              Profile
            </span>
          </button>

        </div>
      </header>

      {/* ======================
         MAIN
      ====================== */}

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ======================
           WELCOME
        ====================== */}

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Your Progress
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            A quick overview of your assessment performance.
          </p>
        </div>

        {/* ======================
           STAT CARDS
        ====================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <StudentStat
            title="Total Assessments"
            value={stats.totalAssessments}
            description="Available assessments"
            icon="📚"
          />

          <StudentStat
            title="Completed"
            value={stats.completed}
            description="Evaluated assessments"
            icon="✓"
          />

          <StudentStat
            title="In Progress"
            value={stats.inProgress}
            description="Assessments to finish"
            icon="⏳"
          />

          <StudentStat
            title="Average Score"
            value={`${stats.averageScore}%`}
            description="Overall performance"
            icon="★"
          />

        </div>

        {/* ======================
           PERFORMANCE + PROGRESS
        ====================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PERFORMANCE */}

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Performance
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your scores across evaluated assessments
              </p>
            </div>

            <div className="h-64">

              {stats.performanceData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={stats.performanceData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="assessment"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Score",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty
                  text="Complete an assessment to see your performance."
                />
              )}

            </div>
          </div>

          {/* PROGRESS SUMMARY */}

          <div className="bg-white rounded-xl border border-gray-200 p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Assessment Progress
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your current assessment status
              </p>
            </div>

            <ProgressRow
              label="Completed"
              value={stats.completed}
              total={stats.totalAssessments}
              type="success"
            />

            <ProgressRow
              label="In Progress"
              value={stats.inProgress}
              total={stats.totalAssessments}
              type="warning"
            />

            <ProgressRow
              label="Remaining"
              value={Math.max(
                stats.totalAssessments -
                  stats.completed -
                  stats.inProgress,
                0
              )}
              total={stats.totalAssessments}
              type="neutral"
            />

          </div>

        </div>

        {/* ======================
           MY ASSESSMENTS
        ====================== */}

        <div className="bg-white rounded-xl border border-gray-200">

          <div className="px-6 py-5 border-b flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                My Assessments
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your recent assessment activity
              </p>
            </div>

            <button
              onClick={() => navigate("/student/assessments")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>

          </div>

          <div className="divide-y">

            {stats.recentActivity.length > 0 ? (

              stats.recentActivity
                .slice(0, 5)
                .map((assessment) => (

                  <AssessmentRow
                    key={assessment.id}
                    assessment={assessment}
                    navigate={navigate}
                  />

                ))

            ) : (

              <div className="px-6 py-12">
                <Empty text="No assessments available yet." />
              </div>

            )}

          </div>

        </div>

      </main>
    </div>
  );
}

/* =========================================================
   STUDENT STAT
========================================================= */

function StudentStat({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {description}
          </p>

        </div>

        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({
  label,
  value,
  total,
  type,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  const colors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    neutral: "bg-gray-400",
  };

  return (
    <div className="mb-6">

      <div className="flex justify-between text-sm mb-2">

        <span className="text-gray-600">
          {label}
        </span>

        <span className="font-medium text-gray-800">
          {value}
        </span>

      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${colors[type]}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="text-xs text-gray-400 mt-1">
        {percentage}% of assessments
      </p>

    </div>
  );
}

/* =========================================================
   ASSESSMENT ROW
========================================================= */

function AssessmentRow({
  assessment,
  navigate,
}) {
  const isEvaluated =
    assessment.status === "evaluated";

  const isInProgress =
    assessment.status === "in_progress";

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">

      <div className="flex items-center gap-4">

        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
          {assessment.title
            ?.charAt(0)
            ?.toUpperCase() || "A"}
        </div>

        <div>

          <h3 className="text-sm font-medium text-gray-800">
            {assessment.title}
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            {isEvaluated
              ? "Assessment evaluated"
              : isInProgress
              ? "Assessment in progress"
              : "Assessment activity"}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-4">

        <StatusBadge status={assessment.status} />

        {isInProgress && (
          <button
            onClick={() =>
              navigate("/student/assessments")
            }
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Continue
          </button>
        )}

        {isEvaluated && (
          <span className="text-xs text-gray-400">
            Completed
          </span>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    evaluated:
      "bg-green-50 text-green-700 border-green-100",

    in_progress:
      "bg-yellow-50 text-yellow-700 border-yellow-100",

    submitted:
      "bg-blue-50 text-blue-700 border-blue-100",
  };

  const labels = {
    evaluated: "Evaluated",
    in_progress: "In Progress",
    submitted: "Submitted",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-medium ${
        styles[status] ||
        "bg-gray-50 text-gray-600 border-gray-100"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function Empty({ text }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center">
      {text}
    </div>
  );
}