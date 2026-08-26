import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function InstructorProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  /* =========================
     USER
  ========================= */
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || authUser;
    } catch {
      return authUser;
    }
  };

  const user = getStoredUser();

  /* =========================
     PROFILE STATE
  ========================= */
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    experience: "",
  });

  /* =========================
     STATISTICS
  ========================= */
  const [stats, setStats] = useState({
    assessmentsCreated: 0,
    submissionsEvaluated: 0,
    activeAssessments: 0,
  });

  /* =========================
     SECURITY
  ========================= */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =========================
     UI STATE
  ========================= */
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =========================
     INITIALS
  ========================= */
  const initials =
    profile.full_name
      ?.trim()
      .split(/\s+/)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IN";

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get("/instructor/profile"),
          api.get("/dashboard/instructor"),
        ]);

        setProfile({
          full_name:
            profileRes.data?.full_name ||
            user?.full_name ||
            user?.name ||
            "",
          email:
            profileRes.data?.email ||
            user?.email ||
            "",
          phone:
            profileRes.data?.phone ||
            "",
          department:
            profileRes.data?.department ||
            "",
          experience:
            profileRes.data?.experience ||
            "",
        });

        setStats({
          assessmentsCreated:
            statsRes.data?.totalAssessments || 0,

          submissionsEvaluated:
            statsRes.data?.evaluated || 0,

          activeAssessments:
            statsRes.data?.publishedAssessments || 0,
        });
      } catch (err) {
        console.error("Failed to load instructor settings:", err);

        setProfile({
          full_name:
            user?.full_name ||
            user?.name ||
            "",
          email:
            user?.email ||
            "",
          phone: "",
          department: "",
          experience: "",
        });
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================
     CLEAR MESSAGES
  ========================= */
  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    clearMessages();

    if (!profile.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!profile.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!profile.department.trim()) {
      setError("Department is required.");
      return;
    }

    try {
      setLoading(true);

      await api.put("/instructor/profile", profile);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          ...profile,
        })
      );

      setSuccess("Profile settings saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save profile settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */
  const handlePasswordChange = async () => {
    clearMessages();

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      await api.put("/auth/change-password", {
        newPassword,
      });

      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Password update failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">
            Loading instructor settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* =========================
            HEADER
        ========================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Instructor Settings
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your profile, account information and security preferences.
            </p>
          </div>

          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="px-5 py-2.5 border border-gray-300 bg-white rounded-lg
                       text-gray-700 font-medium hover:bg-gray-50
                       transition"
          >
            ← Dashboard
          </button>
        </div>

        {/* =========================
            ALERTS
        ========================= */}
        {success && (
          <Alert
            type="success"
            text={success}
          />
        )}

        {error && (
          <Alert
            type="error"
            text={error}
          />
        )}

        {/* =========================
            PROFILE SETTINGS
        ========================= */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* PROFILE HEADER */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-white/20 border border-white/30
                              flex items-center justify-center
                              text-white text-2xl font-bold">
                {initials}
              </div>

              <div className="text-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">
                    {profile.full_name || "Instructor"}
                  </h2>

                  <span className="px-3 py-1 rounded-full bg-white/20
                                   text-xs font-semibold">
                    INSTRUCTOR
                  </span>
                </div>

                <p className="mt-1 text-white/80">
                  {profile.department || "Academic Department"}
                </p>

                <p className="text-sm text-white/70 mt-1">
                  {profile.email}
                </p>
              </div>

            </div>
          </div>

          {/* PROFILE FORM */}
          <div className="p-6">

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Update your professional information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Input
                label="Full Name"
                value={profile.full_name}
                onChange={(value) =>
                  setProfile({
                    ...profile,
                    full_name: value,
                  })
                }
                required
              />

              <Input
                label="Email Address"
                value={profile.email}
                disabled
                helper="Email address cannot be changed."
              />

              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(value) =>
                  setProfile({
                    ...profile,
                    phone: value,
                  })
                }
                required
              />

              <Input
                label="Department"
                value={profile.department}
                onChange={(value) =>
                  setProfile({
                    ...profile,
                    department: value,
                  })
                }
                required
              />

              <Input
                label="Experience"
                type="number"
                min="0"
                value={profile.experience}
                onChange={(value) =>
                  setProfile({
                    ...profile,
                    experience: value,
                  })
                }
                suffix="Years"
              />

            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg
                           bg-purple-600 text-white font-medium
                           hover:bg-purple-700
                           disabled:opacity-60
                           disabled:cursor-not-allowed
                           transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </section>

        {/* =========================
            INSTRUCTOR OVERVIEW
        ========================= */}
        <section>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Instructor Overview
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Summary of your assessment activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Stat
              label="Assessments Created"
              value={stats.assessmentsCreated}
              icon="📝"
            />

            <Stat
              label="Submissions Evaluated"
              value={stats.submissionsEvaluated}
              icon="✓"
            />

            <Stat
              label="Active Assessments"
              value={stats.activeAssessments}
              icon="●"
            />

          </div>
        </section>

        {/* =========================
            SECURITY SETTINGS
        ========================= */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Security
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
            />

          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="px-6 py-2.5 rounded-lg
                         bg-gray-900 text-white font-medium
                         hover:bg-gray-800
                         disabled:opacity-60
                         disabled:cursor-not-allowed
                         transition"
            >
              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>

        </section>

      </div>
    </div>
  );
}

/* =====================================================
   INPUT COMPONENT
===================================================== */
function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  helper,
  placeholder,
  min,
  suffix,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative mt-1.5">
        <input
          type={type}
          value={value}
          disabled={disabled}
          min={min}
          placeholder={placeholder}
          onChange={(e) =>
            onChange?.(e.target.value)
          }
          className={`w-full border rounded-lg px-3.5 py-2.5
                     text-gray-900 outline-none transition
                     ${
                       disabled
                         ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                         : "bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                     }
                     ${suffix ? "pr-16" : ""}`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2
                           text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-1 text-xs text-gray-400">
          {helper}
        </p>
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */
function Stat({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200
                    shadow-sm p-6">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-purple-50
                        flex items-center justify-center
                        text-xl text-purple-600">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   ALERT
===================================================== */
function Alert({ type, text }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        isSuccess
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      <span className="font-semibold">
        {isSuccess ? "✓" : "!"}
      </span>

      <span className="text-sm font-medium">
        {text}
      </span>
    </div>
  );
}