import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });

      // 🔒 DEFENSIVE EXTRACTION
      const user = res.data?.user || res.data?.data?.user;
      const token = res.data?.token || res.data?.accessToken || res.data?.data?.token;

      if (!user || !token) {
        throw new Error("Invalid login response");
      }

      login(user, token);

      const role = user.role?.toLowerCase();
      if (!role) throw new Error("Role missing");

      // ✅ SAFE REDIRECT
      if (role === "student") navigate("/student/dashboard", { replace: true });
      else if (role === "instructor") navigate("/instructor/dashboard", { replace: true });
      else if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else throw new Error("Invalid role");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-[400px]"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}