import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../../lib/api";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ FIXED PATH (THIS WAS THE BUG)
import StatCard from "../../components/common/StatCard";

/* ======================
   INSTRUCTOR DASHBOARD (POLISHED)
====================== */

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalAssessments: 0,
    publishedAssessments: 0,
    pendingReview: 0,
    evaluated: 0,
    recentAssessments: [],
    activityData: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/instructor");
        const d = res?.data || {};

        setStats({
          totalAssessments: d.totalAssessments ?? 0,
          publishedAssessments: d.publishedAssessments ?? 0,
          pendingReview: d.pendingReview ?? 0,
          evaluated: d.evaluated ?? 0,
          recentAssessments: Array.isArray(d.recentAssessments)
            ? d.recentAssessments
            : [],
          activityData: Array.isArray(d.activityData)
            ? d.activityData
            : [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [location.pathname]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Instructor Dashboard
        </h1>

        <button
          onClick={() => navigate("/instructor/profile")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow"
        >
          <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            I
          </div>
          Profile
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Assessments"
          value={stats.totalAssessments}
        />

        <StatCard
          title="Published"
          value={stats.publishedAssessments}
        />

        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          highlight="danger"
          onClick={() => navigate("/instructor/ai-questions")}
        />

        <StatCard
          title="Evaluated"
          value={stats.evaluated}
          highlight="success"
        />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-1">
          Assessment Activity
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          AI-assisted evaluation trends over time
        </p>

        <div className="h-56">
          {stats.activityData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.activityData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No activity data
            </div>
          )}
        </div>
      </div>

      {/* RECENT ASSESSMENTS */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Recent Assessments
          </h2>

          <button
            onClick={() => navigate("/instructor/tests")}
            className="text-blue-600 hover:underline text-sm"
          >
            View All
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2">#</th>
              <th>Title</th>
              <th>Marks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {stats.recentAssessments.map((a, i) => (
              <tr
                key={a.id}
                className="border-b hover:bg-gray-50"
              >
                <td>{i + 1}</td>
                <td className="font-medium">{a.title}</td>
                <td>{a.total_marks}</td>
                <td>
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                    {a.status}
                  </span>
                </td>
                <td>
                  {a.status === "DRAFT" && (
                    <button
                      onClick={() =>
                        navigate(`/instructor/builder/${a.id}`)
                      }
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Continue
                    </button>
                  )}

                  {a.status === "PUBLISHED" && (
                    <button
                      onClick={() =>
                        navigate(`/instructor/analytics/${a.id}`)
                      }
                      className="text-green-600 text-xs hover:underline"
                    >
                      Analytics
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}