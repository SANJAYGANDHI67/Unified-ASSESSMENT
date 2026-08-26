import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../../lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ======================
   INSTRUCTOR DASHBOARD
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

  /* ======================
     FETCH DATA
  ====================== */

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
      } catch (err) {
        console.error("INSTRUCTOR DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [location.pathname]);

  /* ======================
     ASSESSMENT STATUS
  ====================== */

  const draftAssessments = Math.max(
    stats.totalAssessments - stats.publishedAssessments,
    0
  );

  const statusData = [
    {
      name: "Published",
      value: stats.publishedAssessments,
    },
    {
      name: "Draft",
      value: draftAssessments,
    },
  ];

  const COLORS = ["#2563eb", "#9333ea"];

  return (
    <div className="space-y-8">

      {/* ======================
          HEADER
      ====================== */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Instructor Dashboard
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Manage assessments, evaluations and student performance
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/profile")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            I
          </div>

          <span className="text-sm font-medium">
            Profile
          </span>
        </button>

      </div>

      {/* ======================
          KPI CARDS
      ====================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <KpiCard
          title="Total Assessments"
          value={loading ? "—" : stats.totalAssessments}
          subtitle="Created assessments"
          color="blue"
        />

        <KpiCard
          title="Published"
          value={loading ? "—" : stats.publishedAssessments}
          subtitle="Currently available"
          color="green"
        />

        <KpiCard
          title="Pending Review"
          value={loading ? "—" : stats.pendingReview}
          subtitle="Draft assessments"
          color="purple"
          onClick={() =>
            navigate("/instructor/ai-questions")
          }
        />

        <KpiCard
          title="Evaluated"
          value={loading ? "—" : stats.evaluated}
          subtitle="Student submissions"
          color="orange"
        />

      </div>

      {/* ======================
          CHART SECTION
      ====================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================
            ASSESSMENT ACTIVITY
        ====================== */}

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Assessment Activity
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Monthly student submission activity
          </p>

          <div className="h-64">

            {stats.activityData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={stats.activityData}>

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Submissions"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex items-center justify-center h-full text-gray-400">
                No activity data available
              </div>

            )}

          </div>

        </div>

        {/* ======================
            ASSESSMENT STATUS
        ====================== */}

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Assessment Status
          </h3>

          <p className="text-sm text-gray-500">
            Current assessment distribution
          </p>

          <div className="h-64">

            {stats.totalAssessments > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                      />
                    ))}

                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                  />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex items-center justify-center h-full text-gray-400">
                No assessment data
              </div>

            )}

          </div>

        </div>

      </div>

      {/* ======================
          LOWER SECTION
      ====================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ======================
            EVALUATION OVERVIEW
        ====================== */}

        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Evaluation Overview
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            Current assessment and evaluation statistics
          </p>

          <ProgressRow
            label="Published Assessments"
            value={stats.publishedAssessments}
            total={stats.totalAssessments}
          />

          <ProgressRow
            label="Draft Assessments"
            value={draftAssessments}
            total={stats.totalAssessments}
          />

          <ProgressRow
            label="Evaluated Submissions"
            value={stats.evaluated}
            total={stats.evaluated}
          />

        </div>

        {/* ======================
            RECENT ASSESSMENTS
        ====================== */}

        <div className="bg-white rounded-lg shadow p-6">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-lg font-semibold text-gray-900">
                Recent Assessments
              </h3>

              <p className="text-sm text-gray-500">
                Recently created assessments
              </p>

            </div>

            <button
              onClick={() => navigate("/instructor/tests")}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>

          </div>

          {stats.recentAssessments.length > 0 ? (

            <div className="space-y-4">

              {stats.recentAssessments
                .slice(0, 5)
                .map((a) => (

                  <div
                    key={a.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >

                    <div>

                      <p className="font-medium text-gray-800">
                        {a.title}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {a.total_marks} marks
                      </p>

                    </div>

                    <div className="flex items-center gap-4">

                      <StatusBadge
                        status={a.status}
                      />

                      {/* DATABASE USES LOWERCASE */}

                      {a.status === "draft" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/instructor/builder/${a.id}`
                            )
                          }
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Continue
                        </button>
                      )}

                      {a.status === "published" && (
                        <button
                          onClick={() =>
                            
                               navigate(`/instructor/analytics/${a.id}`)
                            
                          }
                          className="text-xs text-green-600 hover:underline"
                        >
                          Analytics
                        </button>
                      )}

                    </div>

                  </div>

                ))}

            </div>

          ) : (

            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No assessments available
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

/* =================================================
   KPI CARD
================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  color,
  onClick,
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-5 ${
        onClick
          ? "cursor-pointer hover:shadow-md transition"
          : ""
      }`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p
            className={`text-3xl font-bold mt-2 px-2 inline-block ${colorMap[color]}`}
          >
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {subtitle}
          </p>

        </div>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          •
        </div>

      </div>

    </div>
  );
}

/* =================================================
   PROGRESS ROW
================================================= */

function ProgressRow({ label, value, total }) {

  const percentage =
    total > 0
      ? Math.min((Number(value) / Number(total)) * 100, 100)
      : 0;

  return (
    <div className="mb-6">

      <div className="flex justify-between text-sm mb-2">

        <span className="text-gray-700">
          {label}
        </span>

        <span className="font-semibold text-gray-800">
          {value}
        </span>

      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="text-xs text-gray-400 mt-1">
        {Math.round(percentage)}% of total
      </p>

    </div>
  );
}

/* =================================================
   STATUS BADGE
================================================= */

function StatusBadge({ status }) {

  const styles = {
    published:
      "bg-green-100 text-green-700",

    draft:
      "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status?.toUpperCase()}
    </span>
  );
}