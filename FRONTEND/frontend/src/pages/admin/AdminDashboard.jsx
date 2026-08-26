import { useState, useEffect } from "react";
import api from "../../lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalAssessments: 0,
    activeAssessments: 0,
    userGrowth: [],
    userDistribution: [],
    assessmentStatus: [],
  });

  const [loading, setLoading] = useState(true);

  /* ======================
     FETCH DASHBOARD STATS
  ====================== */

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/dashboard/admin");

        setStats({
          totalStudents: res.data?.totalStudents ?? 0,
          totalInstructors: res.data?.totalInstructors ?? 0,
          totalAssessments: res.data?.totalAssessments ?? 0,
          activeAssessments: res.data?.activeAssessments ?? 0,

          userGrowth: Array.isArray(res.data?.userGrowth)
            ? res.data.userGrowth
            : [],

          userDistribution: Array.isArray(
            res.data?.userDistribution
          )
            ? res.data.userDistribution
            : [],

          assessmentStatus: Array.isArray(
            res.data?.assessmentStatus
          )
            ? res.data.assessmentStatus
            : [],
        });
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">

      {/* ======================
          HEADER
      ====================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Platform overview and system insights
          </p>
        </div>

        <div className="hidden sm:block text-sm text-gray-500">
          Platform Analytics
        </div>
      </div>

      {/* ======================
          KPI CARDS
      ====================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KpiCard
          title="Total Students"
          value={loading ? "—" : stats.totalStudents}
          description="Registered students"
          color="blue"
        />

        <KpiCard
          title="Total Instructors"
          value={loading ? "—" : stats.totalInstructors}
          description="Registered instructors"
          color="purple"
        />

        <KpiCard
          title="Total Assessments"
          value={loading ? "—" : stats.totalAssessments}
          description="Created assessments"
          color="green"
        />

        <KpiCard
          title="Active Assessments"
          value={loading ? "—" : stats.activeAssessments}
          description="Currently published"
          color="orange"
        />

      </div>

      {/* ======================
          GROWTH + USER PIE
      ====================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ======================
            PLATFORM GROWTH
        ====================== */}

        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-6">

          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-900">
              Platform Growth
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Monthly users and assessment activity
            </p>
          </div>

          <div className="h-80">

            {stats.userGrowth.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={stats.userGrowth}
                  barGap={6}
                >

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="instructors"
                    name="Instructors"
                    fill="#9333ea"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="assessments"
                    name="Assessments"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            ) : (

              <EmptyState text="No growth data available" />

            )}

          </div>
        </div>

        {/* ======================
            USER DISTRIBUTION
        ====================== */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              User Distribution
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Students vs instructors
            </p>
          </div>

          <div className="h-80">

            {stats.userDistribution.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={stats.userDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >

                    {stats.userDistribution.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#2563eb"
                              : "#9333ea"
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            ) : (

              <EmptyState text="No user data available" />

            )}

          </div>
        </div>

      </div>

      {/* ======================
          LOWER ANALYTICS
      ====================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ======================
            ASSESSMENT STATUS
        ====================== */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Assessment Status
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Current assessment distribution
            </p>
          </div>

          <div className="space-y-5">

            {stats.assessmentStatus.length > 0 ? (

              stats.assessmentStatus.map((item) => (
                <StatusRow
                  key={item.name}
                  name={item.name}
                  value={item.value}
                  total={stats.totalAssessments}
                />
              ))

            ) : (

              <EmptyState text="No assessment data available" />

            )}

          </div>

        </div>

        {/* ======================
            SYSTEM SUMMARY
        ====================== */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              System Overview
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Current platform statistics
            </p>
          </div>

          <div className="space-y-5">

            <SummaryRow
              title="Students"
              value={stats.totalStudents}
              description="Registered student accounts"
            />

            <SummaryRow
              title="Instructors"
              value={stats.totalInstructors}
              description="Registered instructor accounts"
            />

            <SummaryRow
              title="Assessments"
              value={stats.totalAssessments}
              description="Total assessments created"
            />

            <SummaryRow
              title="Active"
              value={stats.activeAssessments}
              description="Currently published assessments"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* ======================
   KPI CARD
====================== */

function KpiCard({
  title,
  value,
  description,
  color,
}) {
  const styles = {
    blue: {
      background: "bg-blue-50",
      text: "text-blue-700",
      icon: "text-blue-600",
    },

    purple: {
      background: "bg-purple-50",
      text: "text-purple-700",
      icon: "text-purple-600",
    },

    green: {
      background: "bg-green-50",
      text: "text-green-700",
      icon: "text-green-600",
    },

    orange: {
      background: "bg-orange-50",
      text: "text-orange-700",
      icon: "text-orange-600",
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={`text-3xl font-bold mt-3 ${styles[color].text}`}
          >
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles[color].background} ${styles[color].icon}`}
        >
          ●
        </div>

      </div>

    </div>
  );
}

/* ======================
   ASSESSMENT STATUS
====================== */

function StatusRow({
  name,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <span className="text-sm font-medium text-gray-700 capitalize">
          {name}
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {value}
        </span>

      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">

        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
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

/* ======================
   SYSTEM SUMMARY
====================== */

function SummaryRow({
  title,
  value,
  description,
}) {
  return (
    <div className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0">

      <div>
        <p className="text-sm font-medium text-gray-800">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <p className="text-xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* ======================
   EMPTY STATE
====================== */

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      {text}
    </div>
  );
}