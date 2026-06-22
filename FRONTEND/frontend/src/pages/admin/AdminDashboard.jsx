import { useState, useEffect } from "react";
import api from "../../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalAssessments: 0,
    activeAssessments: 0,
    userGrowth: [],
  });

  const [loading, setLoading] = useState(true);

  /* ======================
     FETCH DASHBOARD STATS
  ====================== */
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/dashboard/admin");
        setStats(res.data || {});
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Platform overview and system insights
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Total Students"
          value={loading ? "—" : stats.totalStudents}
          color="blue"
        />
        <KpiCard
          title="Total Instructors"
          value={loading ? "—" : stats.totalInstructors}
          color="purple"
        />
        <KpiCard
          title="Total Assessments"
          value={loading ? "—" : stats.totalAssessments}
          color="green"
        />
        <KpiCard
          title="Active Assessments"
          value={loading ? "—" : stats.activeAssessments}
          color="orange"
        />
      </div>

      {/* ANALYTICS + ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* USER GROWTH */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-1">
            User Growth Analytics
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly platform usage trend
          </p>

          <div className="h-60">
            {stats.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No analytics data available
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Recent System Activity
          </h3>

          <ul className="space-y-3 text-sm">
            <ActivityItem label="New instructor added" type="info" />
            <ActivityItem label="Assessment published" type="success" />
            <ActivityItem label="User suspended" type="warning" />
            <ActivityItem label="Assessment flagged" type="danger" />
            <ActivityItem
              label="AI pre-evaluation completed"
              type="success"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ======================
   COMPONENTS
====================== */

function KpiCard({ title, value, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}

function ActivityItem({ label, type }) {
  const typeStyle = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span
        className={`px-2 py-1 rounded-full text-xs ${typeStyle[type]}`}
      >
        {type.toUpperCase()}
      </span>
    </li>
  );
}