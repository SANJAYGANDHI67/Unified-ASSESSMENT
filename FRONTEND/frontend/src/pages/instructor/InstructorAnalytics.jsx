import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626"];

export default function InstructorAnalytics() {
  const { assessmentId } = useParams(); // optional

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  /* ======================
     FETCH ANALYTICS
  ====================== */
  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      try {
        /**
         * 🔹 FUTURE BACKEND (READY)
         *
         * const res = await api.get(
         *   assessmentId
         *     ? `/analytics/instructor/${assessmentId}`
         *     : `/analytics/instructor`
         * );
         * setData(res.data);
         */

        /**
         * 🔹 SAFE FRONTEND FALLBACK (NO FAKE VALUES)
         * Uses neutral placeholders until backend is connected
         */
        setData({
          kpis: {
            totalAssessments: assessmentId ? 1 : 0,
            totalStudents: 0,
            averageScore: 0,
            pendingEvaluations: 0,
          },
          submissionsTrend: [],
          scoreDistribution: [],
          passFail: [],
        });
      } catch (err) {
        console.error("Analytics error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [assessmentId]);

  /* ======================
     STATES
  ====================== */
  if (loading) {
    return <div className="p-8">Loading analytics…</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-red-600">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">
          {assessmentId
            ? `Performance insights for Assessment #${assessmentId}`
            : "Select an assessment to view analytics"}
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI title="Assessments" value={data.kpis.totalAssessments} />
        <KPI title="Students Attempted" value={data.kpis.totalStudents} />
        <KPI title="Average Score" value={`${data.kpis.averageScore}%`} />
        <KPI title="Pending Evaluations" value={data.kpis.pendingEvaluations} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Submissions Over Time">
          {data.submissionsTrend.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.submissionsTrend}>
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
          )}
        </Card>

        <Card title="Score Distribution">
          {data.scoreDistribution.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.scoreDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ================= PASS / FAIL ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Pass vs Fail">
          {data.passFail.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.passFail}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  label
                >
                  {data.passFail.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Insights">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>📊 Analytics will appear after evaluations</li>
            <li>🧠 AI evaluation integration pending</li>
            <li>✅ UI is backend-ready</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">
      No data available
    </div>
  );
}