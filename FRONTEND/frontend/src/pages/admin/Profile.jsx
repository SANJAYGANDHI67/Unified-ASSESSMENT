import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
  const { user: authUser } = useAuth();
  const user = JSON.parse(localStorage.getItem("user")) || authUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ======================
     FETCH PROFILE
  ====================== */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/admin/profile");
        const profile = res.data;
        setName(profile.full_name || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
      } catch {
        setName(user?.full_name || "");
        setEmail(user?.email || "");
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, []);

  /* ======================
     AUTO CLEAR MESSAGES
  ====================== */
  useEffect(() => {
    if (successMessage || errorMessage) {
      const t = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, errorMessage]);

  /* ======================
     SAVE PROFILE
  ====================== */
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await api.put("/admin/profile", {
        full_name: name,
        phone,
      });
      setSuccessMessage("Profile updated successfully");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, full_name: name, phone })
      );
    } catch {
      setErrorMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     CHANGE PASSWORD
  ====================== */
  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await api.put("/auth/change-password", { newPassword });
      setSuccessMessage("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-center py-20">Loading profile...</p>;
  }

  return (
    <>
      {/* HEADER */}
      <h2 className="text-3xl font-bold mb-1">Admin Profile</h2>
      <p className="text-gray-500 mb-6">
        Manage administrator identity and security settings
      </p>

      {/* ALERTS */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
            {getInitials(name)}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-500">{email}</p>

            {/* ADMIN BADGE */}
            <div className="mt-1 flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded w-fit">
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded">
                ADMIN
              </span>
              <span className="text-xs text-red-700">
                Full system access
              </span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 rounded bg-gray-100"
            value={email}
            disabled
          />

          <input
            className="border p-2 rounded"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="border p-2 rounded bg-gray-100"
            value="Administrator"
            disabled
          />
        </div>

        <div className="text-right mt-5">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow disabled:opacity-50"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* PASSWORD CARD */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Change Password
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="password"
            className="border p-2 rounded"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            className="border p-2 rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="text-right">
          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="px-5 py-2 bg-gray-800 hover:bg-black text-white rounded-md font-medium shadow disabled:opacity-50"
          >
            Update Password
          </button>
        </div>
      </div>
    </>
  );
}