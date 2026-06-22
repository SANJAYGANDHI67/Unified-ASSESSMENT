import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";

export default function UserManagement() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  /* ======================
     STATE
  ====================== */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const currentPage = Number(params.get("page") || 1);

  /* ======================
     FETCH USERS
  ====================== */
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        const res = await api.get("/admin/users", {
          params: {
            page: currentPage,
            limit: 10,
            role: roleFilter !== "ALL" ? roleFilter : null,
            search: search.trim() || null,
          },
        });

        setUsers(res.data.users || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        console.error("FETCH USERS ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentPage, roleFilter, search]);

  /* ======================
     HANDLERS
  ====================== */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    navigate("/admin/users?page=1");
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    navigate("/admin/users?page=1");
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-6">User Management</h2>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border rounded px-3 py-2 text-sm w-64"
          value={search}
          onChange={handleSearchChange}
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          value={roleFilter}
          onChange={handleRoleChange}
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {user.userName || user.full_name || "—"}
                  </td>

                  <td className="px-4 py-3 text-blue-600">
                    {user.email}
                  </td>

                  <td className="px-4 py-3">
                    {user.role}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="px-4 py-3 flex gap-4">
                    <button
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </button>

                    {user.status === "ACTIVE" ? (
                      <button className="text-red-600 text-sm hover:underline">
                        Suspend
                      </button>
                    ) : (
                      <button className="text-green-600 text-sm hover:underline">
                        Activate
                      </button>
                    )}
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
          ).map((page) => (
            <PageButton
              key={page}
              active={currentPage === page}
              onClick={() => navigate(`/admin/users?page=${page}`)}
            >
              {page}
            </PageButton>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================
   HELPERS
====================== */

function StatusBadge({ status }) {
  const style =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : status === "SUSPENDED"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function PageButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border text-sm transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}