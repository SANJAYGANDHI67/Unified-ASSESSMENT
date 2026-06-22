import * as dashboardService from "../services/dashboard.service.js";

/* ======================
   STUDENT
====================== */
export const getStudentDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getStudentDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("STUDENT DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

/* ======================
   INSTRUCTOR
====================== */
export const getInstructorDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getInstructorDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("INSTRUCTOR DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

/* ======================
   ADMIN
====================== */
export const getAdminDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json(data);
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};