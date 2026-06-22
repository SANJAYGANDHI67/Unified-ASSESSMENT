import { useState } from "react";
import { Button } from "../../components/ui/button";

export default function Settings() {
  /* ======================
     GENERAL SETTINGS
  ====================== */
  const [platformName, setPlatformName] = useState(
    "Unified Assessment Platform"
  );
  const [instituteEmail, setInstituteEmail] = useState(
    "admin@college.edu"
  );

  // MUST MATCH DB ENUM
  const [defaultRole, setDefaultRole] = useState("STUDENT");

  /* ======================
     SYSTEM CONTROLS
  ====================== */
  const [system, setSystem] = useState({
    aiGeneration: true,
    aiEvaluation: true,
    autoPublish: false,
    maxAttempts: 1,
  });

  /* ======================
     NOTIFICATIONS
  ====================== */
  const [alerts, setAlerts] = useState({
    assessment: true,
    userActivity: true,
    aiEvaluation: false,
    security: true,
  });

  const toggle = (key, setter) => {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ======================
     ACTIONS
  ====================== */
  const handleSaveSettings = () => {
    console.log({
      platformName,
      instituteEmail,
      defaultRole,
      system,
      alerts,
    });
    alert("Settings saved successfully");
  };

  const handleUpdatePassword = () => {
    alert("Password updated successfully");
  };

  const handleResetSystem = () => {
    if (
      window.confirm(
        "This will reset platform configurations. Continue?"
      )
    ) {
      alert("System reset simulated");
    }
  };

  return (
    <>
      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-1">Platform Settings</h2>
      <p className="text-gray-500 mb-6">
        Control system behavior, security, and platform defaults
      </p>

      {/* ======================
         GENERAL SETTINGS
      ====================== */}
      <Section title="General Settings">
        <Input
          label="Platform Name"
          value={platformName}
          onChange={setPlatformName}
        />
        <Input
          label="Institute Email"
          type="email"
          value={instituteEmail}
          onChange={setInstituteEmail}
        />

        <Select
          label="Default User Role"
          value={defaultRole}
          onChange={setDefaultRole}
          options={[
            { label: "Student", value: "STUDENT" },
            { label: "Instructor", value: "INSTRUCTOR" },
            { label: "Admin", value: "ADMIN" },
          ]}
        />
      </Section>

      {/* ======================
         SYSTEM CONTROLS
      ====================== */}
      <Section title="System Controls">
        <Toggle
          label="Enable AI Question Generation"
          value={system.aiGeneration}
          onChange={() => toggle("aiGeneration", setSystem)}
        />
        <Toggle
          label="Enable AI Evaluation"
          value={system.aiEvaluation}
          onChange={() => toggle("aiEvaluation", setSystem)}
        />
        <Toggle
          label="Auto-publish Approved Assessments"
          value={system.autoPublish}
          onChange={() => toggle("autoPublish", setSystem)}
        />

        <div className="mt-4">
          <label className="block text-sm mb-1">
            Maximum Attempts per Student
          </label>
          <input
            type="number"
            min={1}
            className="border rounded px-3 py-2 text-sm w-40"
            value={system.maxAttempts}
            onChange={(e) =>
              setSystem((p) => ({
                ...p,
                maxAttempts: Number(e.target.value),
              }))
            }
          />
        </div>
      </Section>

      {/* ======================
         NOTIFICATIONS
      ====================== */}
      <Section title="Notifications">
        <Toggle
          label="Assessment alerts"
          value={alerts.assessment}
          onChange={() => toggle("assessment", setAlerts)}
        />
        <Toggle
          label="User activity alerts"
          value={alerts.userActivity}
          onChange={() => toggle("userActivity", setAlerts)}
        />
        <Toggle
          label="AI evaluation alerts"
          value={alerts.aiEvaluation}
          onChange={() => toggle("aiEvaluation", setAlerts)}
        />
        <Toggle
          label="Security alerts"
          value={alerts.security}
          onChange={() => toggle("security", setAlerts)}
        />
      </Section>

      {/* ======================
         SECURITY
      ====================== */}
      <Section title="Security">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="password"
            placeholder="New password"
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={handleUpdatePassword}>
          Update Password
        </Button>
      </Section>

      {/* ======================
         DANGER ZONE
      ====================== */}
      <Section title="Danger Zone" danger>
        <p className="text-sm text-red-600 mb-3">
          These actions affect the entire system.
        </p>
        <Button
          variant="destructive"
          onClick={handleResetSystem}
        >
          Reset Platform Configuration
        </Button>
      </Section>

      {/* SAVE */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings}>
          Save Changes
        </Button>
      </div>
    </>
  );
}

/* ======================
   REUSABLE COMPONENTS
====================== */

function Section({ title, children, danger }) {
  return (
    <div
      className={`bg-white border rounded-lg p-5 mb-6 ${
        danger ? "border-red-300" : ""
      }`}
    >
      <h3
        className={`font-medium mb-4 ${
          danger ? "text-red-600" : ""
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        className="w-full border rounded px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="w-64">
      <label className="block text-sm mb-1">{label}</label>
      <select
        className="w-full border rounded px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm">{label}</span>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative transition ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition ${
            value ? "left-5" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}