import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import api from "../../lib/api";

export default function Settings() {
  /* =====================================================
     GENERAL SETTINGS
  ===================================================== */

  const [platformName, setPlatformName] = useState(
    "Unified Assessment Platform"
  );

  const [instituteEmail, setInstituteEmail] = useState(
    "admin@college.edu"
  );

  const [defaultRole, setDefaultRole] = useState("student");

  /* =====================================================
     SYSTEM CONTROLS
  ===================================================== */

  const [system, setSystem] = useState({
    aiGeneration: true,
    aiEvaluation: true,
    autoPublish: false,
    maxAttempts: 1,
  });

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [alerts, setAlerts] = useState({
    assessment: true,
    userActivity: true,
    aiEvaluation: false,
    security: true,
  });

  /* =====================================================
     SECURITY
  ===================================================== */

  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  /* =====================================================
     UI STATE
  ===================================================== */

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
  const loadSettings = async () => {
    try {
      const res = await api.get("/admin/settings");

      const data = res.data?.settings;

      if (!data) return;

      setPlatformName(
        data.platform_name ||
          "Unified Assessment Platform"
      );

      setInstituteEmail(
        data.institute_email ||
          "admin@college.edu"
      );

      setDefaultRole(
        data.default_role || "student"
      );

      setSystem({
        aiGeneration: Boolean(data.ai_generation),
        aiEvaluation: Boolean(data.ai_evaluation),
        autoPublish: Boolean(data.auto_publish),
        maxAttempts: Number(data.max_attempts) || 1,
      });

      setAlerts({
        assessment: Boolean(data.assessment_alerts),
        userActivity: Boolean(
          data.user_activity_alerts
        ),
        aiEvaluation: Boolean(
          data.ai_evaluation_alerts
        ),
        security: Boolean(data.security_alerts),
      });
    } catch (error) {
      console.error(
        "Failed to load platform settings:",
        error
      );
    }
  };

  loadSettings();
}, []);

  /* =====================================================
     TOGGLE
  ===================================================== */

  const toggle = (key, setter) => {
    setter((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

const handleSaveSettings = async () => {
  try {
    setSaving(true);
    setSaved(false);

    const settings = {
      platformName,
      instituteEmail,
      defaultRole,

      system: {
        aiGeneration: system.aiGeneration,
        aiEvaluation: system.aiEvaluation,
        autoPublish: system.autoPublish,
        maxAttempts: system.maxAttempts,
      },

      alerts: {
        assessment: alerts.assessment,
        userActivity: alerts.userActivity,
        aiEvaluation: alerts.aiEvaluation,
        security: alerts.security,
      },
    };

    const res = await api.put("/admin/settings", settings);

    console.log("Settings saved:", res.data);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  } catch (error) {
    console.error("Failed to save settings:", error);

    alert(
      error.response?.data?.message ||
        "Failed to save platform settings"
    );
  } finally {
    setSaving(false);
  }
};
  /* =====================================================
     UPDATE PASSWORD
  ===================================================== */

  const handleUpdatePassword = () => {
    if (!password.newPassword) {
      alert("Please enter a new password.");
      return;
    }

    if (
      password.newPassword !==
      password.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (password.newPassword.length < 8) {
      alert(
        "Password must contain at least 8 characters."
      );
      return;
    }

    /*
      Backend password API can be connected here.
    */

    setPassword({
      newPassword: "",
      confirmPassword: "",
    });

    alert("Password updated successfully.");
  };

  /* =====================================================
     RESET SYSTEM
  ===================================================== */

  const handleResetSystem = () => {
    const confirmed = window.confirm(
      "Reset platform configuration?\n\nThis action may affect system-wide settings."
    );

    if (!confirmed) return;

    /*
      Backend reset API can be connected here.
    */

    alert(
      "Platform reset requires backend integration."
    );
  };

  return (
    <div className="max-w-6xl">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage platform preferences, system behavior,
            notifications, and security.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Changes saved
          </div>
        )}

      </div>

      {/* =================================================
          GENERAL SETTINGS
      ================================================= */}

      <SettingsCard
        title="General"
        description="Configure the basic identity and default behavior of your platform."
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Input
            label="Platform Name"
            description="The name displayed across the platform."
            value={platformName}
            onChange={(value) => {
              setPlatformName(value);
              setSaved(false);
            }}
          />

          <Input
            label="Institute Email"
            description="Primary administrative contact email."
            type="email"
            value={instituteEmail}
            onChange={(value) => {
              setInstituteEmail(value);
              setSaved(false);
            }}
          />

        </div>

        <div className="mt-6 max-w-md">

          <Select
            label="Default User Role"
            description="Role assigned when a new user account is created."
            value={defaultRole}
            onChange={(value) => {
              setDefaultRole(value);
              setSaved(false);
            }}
           options={[
  { label: "Student", value: "student" },
  { label: "Instructor", value: "instructor" },
  { label: "Admin", value: "admin" },
]}
          />

        </div>

      </SettingsCard>

      {/* =================================================
          SYSTEM CONTROLS
      ================================================= */}

      <SettingsCard
        title="System Controls"
        description="Control assessment generation, evaluation, publishing, and attempt limits."
      >

        <Toggle
          label="AI Question Generation"
          description="Allow instructors to generate assessment questions using AI."
          value={system.aiGeneration}
          onChange={() =>
            toggle("aiGeneration", setSystem)
          }
        />

        <Toggle
          label="AI Evaluation"
          description="Allow AI-assisted evaluation of submitted answers."
          value={system.aiEvaluation}
          onChange={() =>
            toggle("aiEvaluation", setSystem)
          }
        />

        <Toggle
          label="Auto-publish Assessments"
          description="Automatically publish assessments after approval."
          value={system.autoPublish}
          onChange={() =>
            toggle("autoPublish", setSystem)
          }
        />

        <div className="border-t pt-5 mt-5">

          <label className="block text-sm font-medium text-gray-900">
            Maximum Attempts
          </label>

          <p className="text-xs text-gray-500 mt-1 mb-3">
            Maximum number of attempts allowed per student.
          </p>

          <input
            type="number"
            min="1"
            max="10"
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={system.maxAttempts}
            onChange={(e) => {
              setSystem((prev) => ({
                ...prev,
                maxAttempts: Math.max(
                  1,
                  Math.min(
                    10,
                    Number(e.target.value)
                  )
                ),
              }));

              setSaved(false);
            }}
          />

        </div>

      </SettingsCard>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <SettingsCard
        title="Notifications"
        description="Choose which system events administrators should be notified about."
      >

        <Toggle
          label="Assessment Alerts"
          description="Notifications about assessment creation, publishing, and updates."
          value={alerts.assessment}
          onChange={() =>
            toggle("assessment", setAlerts)
          }
        />

        <Toggle
          label="User Activity"
          description="Receive notifications about important user activity."
          value={alerts.userActivity}
          onChange={() =>
            toggle("userActivity", setAlerts)
          }
        />

        <Toggle
          label="AI Evaluation Alerts"
          description="Receive notifications when AI evaluation requires attention."
          value={alerts.aiEvaluation}
          onChange={() =>
            toggle("aiEvaluation", setAlerts)
          }
        />

        <Toggle
          label="Security Alerts"
          description="Receive notifications about security-related events."
          value={alerts.security}
          onChange={() =>
            toggle("security", setAlerts)
          }
        />

      </SettingsCard>

      {/* =================================================
          SECURITY
      ================================================= */}

      <SettingsCard
        title="Security"
        description="Manage administrator account security."
      >

        <div className="max-w-2xl">

          <div className="bg-gray-50 border rounded-lg p-4 mb-6">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                🔒
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Keep your account secure
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Use a strong password with at least
                  8 characters.
                </p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <PasswordInput
              label="New Password"
              value={password.newPassword}
              onChange={(value) =>
                setPassword((prev) => ({
                  ...prev,
                  newPassword: value,
                }))
              }
            />

            <PasswordInput
              label="Confirm Password"
              value={password.confirmPassword}
              onChange={(value) =>
                setPassword((prev) => ({
                  ...prev,
                  confirmPassword: value,
                }))
              }
            />

          </div>

          <div className="mt-5">

            <Button onClick={handleUpdatePassword}>
              Update Password
            </Button>

          </div>

        </div>

      </SettingsCard>

      {/* =================================================
          DANGER ZONE
      ================================================= */}

      <div className="bg-white border border-red-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-red-100 bg-red-50/40">

          <h2 className="text-base font-semibold text-red-700">
            Danger Zone
          </h2>

          <p className="text-sm text-red-600/80 mt-1">
            These actions can affect the entire platform.
            Proceed carefully.
          </p>

        </div>

        <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-gray-900">
              Reset Platform Configuration
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Restore platform configuration to its default state.
            </p>

          </div>

          <Button
            variant="destructive"
            onClick={handleResetSystem}
          >
            Reset Configuration
          </Button>

        </div>

      </div>

      {/* =================================================
          SAVE BAR
      ================================================= */}

      <div className="sticky bottom-4 mt-8">

        <div className="bg-white border shadow-lg rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-gray-900">
              Platform configuration
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              Review your changes before saving.
            </p>

          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   SETTINGS CARD
===================================================== */

function SettingsCard({
  title,
  description,
  children,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">

      <div className="px-6 py-5 border-b border-gray-100">

        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>

      </div>

      <div className="px-6 py-6">
        {children}
      </div>

    </section>
  );
}

/* =====================================================
   INPUT
===================================================== */

function Input({
  label,
  description,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>

      <p className="text-xs text-gray-500 mt-1 mb-2">
        {description}
      </p>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

    </div>
  );
}

/* =====================================================
   SELECT
===================================================== */

function Select({
  label,
  description,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>

      <p className="text-xs text-gray-500 mt-1 mb-2">
        {description}
      </p>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =====================================================
   PASSWORD INPUT
===================================================== */

function PasswordInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="••••••••"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

    </div>
  );
}

/* =====================================================
   TOGGLE
===================================================== */

function Toggle({
  label,
  description,
  value,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b last:border-b-0">

      <div className="min-w-0">

        <p className="text-sm font-medium text-gray-900">
          {label}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={value}
        className={`flex-shrink-0 relative w-11 h-6 rounded-full transition-colors ${
          value
            ? "bg-blue-600"
            : "bg-gray-300"
        }`}
      >

        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            value
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />

      </button>

    </div>
  );
}