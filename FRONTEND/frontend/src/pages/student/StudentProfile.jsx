import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const user = JSON.parse(localStorage.getItem("user")) || authUser;

  /* ======================
     STATE
  ====================== */
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ======================
     PROFILE STATS (UI ONLY)
  ====================== */
  const stats = {
    attempted: 12,
    completed: 9,
    avgScore: 78,
  };

  /* ======================
     HELPERS
  ====================== */
  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "S";

  /* ======================
     FETCH PROFILE
  ====================== */
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/student/profile");
        setFullName(res.data.full_name || "");
        setPhone(res.data.phone || "");
        setEmail(res.data.email || "");
      } catch {
        setFullName(user?.full_name || "");
        setEmail(user?.email || "");
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  /* ======================
     SAVE PROFILE
  ====================== */
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      await api.put("/student/profile", {
        full_name: fullName,
        phone,
      });
      setSuccess("Profile updated successfully");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, full_name: fullName })
      );
    } catch (e) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UPDATE PASSWORD
  ====================== */
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await api.put("/auth/change-password", { newPassword });
      setSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Profile</h1>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {initials(fullName)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{fullName}</h2>
            <p className="text-gray-600">{email}</p>
            <span className="inline-block mt-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              Student
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat title="Attempted" value={stats.attempted} />
          <Stat title="Completed" value={stats.completed} />
          <Stat title="Avg Score" value={`${stats.avgScore}%`} />
        </div>

        {/* ALERTS */}
        {success && <Alert type="success" text={success} />}
        {error && <Alert type="error" text={error} />}

        {/* PROFILE FORM */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={fullName} onChange={setFullName} />
            <Input label="Email" value={email} disabled />
            <Input label="Phone" value={phone} onChange={setPhone} />
            <Input label="Role" value="Student" disabled />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ======================
   REUSABLE COMPONENTS
====================== */

function Input({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full mt-1 px-3 py-2 border rounded ${
          disabled ? "bg-gray-100" : "focus:ring-2 focus:ring-blue-500"
        }`}
      />
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Alert({ type, text }) {
  return (
    <div
      className={`p-4 rounded ${
        type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {text}
    </div>
  );
}