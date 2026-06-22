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
     (FIXED ROUTES + FIELDS)
  ====================== */
  useEffect(() => {
    async function fetchStats() {
      try {
        const [assessmentsRes, submissionsRes] = await Promise.all([
          api.get("/assessments/published"),
          api.get("/submissions/my-submissions"),
        ]);

        const assessments = Array.isArray(assessmentsRes.data)
          ? assessmentsRes.data
          : [];

        const submissions = Array.isArray(submissionsRes.data)
          ? submissionsRes.data
          : [];

        const completed = submissions.filter(
          (s) => s.status === "submitted"
        ).length;

        const inProgress = submissions.filter(
          (s) => s.status === "in_progress"
        ).length;

        const averageScore = 0;

        setStats({
          totalAssessments: assessments.length,
          completed,
          inProgress,
          averageScore,
          performanceData: [], // intentionally empty
          recentActivity: submissions,
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

  if (loading) return <p className="p-8">Loading dashboard…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your assessments and performance
          </p>
        </div>

        <button
          onClick={() => navigate("/student/profile")}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            S
          </div>
          <span className="text-sm font-medium text-gray-700">
            Profile
          </span>
        </button>
      </header>

      {/* ================= MAIN ================= */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Assessments" value={stats.totalAssessments} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="In Progress" value={stats.inProgress} />
          <StatCard title="Average Score" value={`${stats.averageScore}%`} />
        </div>

        {/* ================= ANALYTICS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card
            title="Performance Trend"
            subtitle="Based on evaluated assessments"
          >
            {stats.performanceData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.performanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="No performance data available" />
            )}
          </Card>

          <Card title="Recent Submissions">
            {stats.recentActivity.length ? (
              <ul className="space-y-3 text-sm">
                {stats.recentActivity.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <span className="text-gray-700">
                      {a.assessment_title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="No recent submissions" />
            )}
          </Card>
        </div>

        {/* ================= ACTIVITY ================= */}
        <Card title="Recent Activity">
          {stats.recentActivity.length ? (
            <ul className="space-y-3 text-sm text-gray-600">
              {stats.recentActivity.slice(0, 4).map((a) => (
                <li key={a.id}>
                  {a.status === "submitted"
                    ? "📝"
                    : "⏰"}{" "}
                  {a.assessment_title}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No recent activity" />
          )}
        </Card>
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">
        {value}
      </p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      {subtitle && (
        <p className="text-xs text-blue-500 mb-4">{subtitle}</p>
      )}
      <div className="h-56">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
      {text}
    </div>
  );
}