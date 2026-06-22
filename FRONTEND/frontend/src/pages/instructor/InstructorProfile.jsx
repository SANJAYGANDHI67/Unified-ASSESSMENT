import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function InstructorProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const user = JSON.parse(localStorage.getItem("user")) || authUser;

  /* ======================
     STATE
  ====================== */
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    experience: "",
  });

  const [stats, setStats] = useState({
    assessmentsCreated: 0,
    submissionsEvaluated: 0,
    activeAssessments: 0,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ======================
     HELPERS
  ====================== */
  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "I";

  /* ======================
     FETCH PROFILE + STATS
  ====================== */
  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get("/instructor/profile"),
          api.get("/dashboard/instructor"),
        ]);

        setProfile({
          full_name: profileRes.data.full_name || "",
          email: profileRes.data.email || user?.email || "",
          phone: profileRes.data.phone || "",
          department: profileRes.data.department || "",
          experience: profileRes.data.experience || "",
        });

        setStats({
          assessmentsCreated: statsRes.data.totalAssessments || 0,
          submissionsEvaluated: statsRes.data.evaluated || 0,
          activeAssessments: statsRes.data.publishedAssessments || 0,
        });
      } catch {
        setProfile({
          full_name: user?.full_name || "",
          email: user?.email || "",
          phone: "",
          department: "",
          experience: "",
        });
      } finally {
        setFetching(false);
      }
    }

    loadProfile();
  }, []);

  /* ======================
     SAVE PROFILE
  ====================== */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      await api.put("/instructor/profile", profile);
      localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));
      setSuccess("Profile updated successfully");
    } catch (e) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     CHANGE PASSWORD
  ====================== */
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      setError("");
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
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Instructor Profile</h1>
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Dashboard
          </button>
        </div>

        {/* SUCCESS / ERROR */}
        {success && <Alert type="success" text={success} />}
        {error && <Alert type="error" text={error} />}

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 text-white flex items-center justify-center rounded-full text-2xl font-bold">
              {initials}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="opacity-90">{profile.department || "Instructor"}</p>
              <p className="text-sm opacity-80">{profile.email}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" value={profile.full_name}
              onChange={(v) => setProfile({ ...profile, full_name: v })} />

            <Input label="Email" value={profile.email} disabled />

            <Input label="Phone" value={profile.phone}
              onChange={(v) => setProfile({ ...profile, phone: v })} />

            <Input label="Department" value={profile.department}
              onChange={(v) => setProfile({ ...profile, department: v })} />

            <Input label="Experience (Years)" type="number"
              value={profile.experience}
              onChange={(v) => setProfile({ ...profile, experience: v })} />
          </div>

          <div className="p-6 text-right">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat label="Assessments Created" value={stats.assessmentsCreated} />
          <Stat label="Submissions Evaluated" value={stats.submissionsEvaluated} />
          <Stat label="Active Assessments" value={stats.activeAssessments} />
        </div>

        {/* PASSWORD */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="New Password" type="password" value={newPassword}
              onChange={setNewPassword} />
            <Input label="Confirm Password" type="password" value={confirmPassword}
              onChange={setConfirmPassword} />
          </div>
          <div className="text-right mt-4">
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="px-6 py-2 bg-gray-800 text-white rounded"
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
   REUSABLE
====================== */
function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full border px-3 py-2 rounded disabled:bg-gray-100"
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Alert({ type, text }) {
  return (
    <div
      className={`p-4 rounded ${
        type === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {text}
    </div>
  );
}