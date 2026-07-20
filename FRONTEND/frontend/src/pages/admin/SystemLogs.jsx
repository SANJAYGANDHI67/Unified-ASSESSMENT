import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function SystemLogs() {
  /* ======================
     STATE
  ====================== */
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  /* ======================
     FETCH LOGS
  ====================== */
  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        console.log({
  page,
  typeFilter,
  dateFilter,
  search,
});

        const res = await api.get("/admin/logs", {
          params: {
            page,
            limit: 10,
            type: typeFilter !== "ALL" ? typeFilter : undefined,
            date: dateFilter || undefined,
            search: search.trim() || undefined,
          },
        });

        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        console.error("FETCH LOGS ERROR:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [page, typeFilter, dateFilter, search]);

  /* ======================
     HELPERS
  ====================== */
  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">System Logs</h2>
        <p className="text-sm text-gray-500">
          Track platform activities, errors, and important events
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by event or user"
          className="border rounded px-3 py-2 text-sm w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Types</option>
          <option value="Info">Info</option>
          <option value="Success">Success</option>
          <option value="Warning">Warning</option>
          <option value="Error">Error</option>
        </select>

        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading system logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{log.event}</div>
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {log.user || "System"}
                  </td>

                  <td className="px-4 py-3">
                    <LogBadge type={log.type} />
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(log.datetime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from(
            { length: pagination.totalPages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border text-sm transition ${
                page === p
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================
   BADGE
====================== */
function LogBadge({ type }) {
  const style =
    type === "Info"
      ? "bg-blue-100 text-blue-700"
      : type === "Success"
      ? "bg-green-100 text-green-700"
      : type === "Warning"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
      {type}
    </span>
  );
}