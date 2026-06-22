import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-xl font-bold text-gray-900">
                Admin Portal
              </Link>
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/admin/users" className="text-gray-600 hover:text-gray-900">
                Users
              </Link>
              <Link to="/admin/logs" className="text-gray-600 hover:text-gray-900">
                Logs
              </Link>
              <Link to="/admin/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
