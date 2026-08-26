import * as adminService from "../services/admin.service.js";

/* =====================================================
   ADMIN DASHBOARD STATS
===================================================== */
export const getStats = async (req, res) => {
  try {
    const stats = await adminService.getAdminStats();

    res.json(stats);
  } catch (error) {
    console.error("Get admin stats error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


/* =====================================================
   GET USERS
===================================================== */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getUsers(
      page,
      limit
    );

    res.json(result);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


/* =====================================================
   GET SYSTEM LOGS
===================================================== */
export const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { type, date, search } = req.query;

    console.log(req.query);

    const result = await adminService.getLogs(
      page,
      limit,
      type,
      date,
      search
    );

    res.json(result);
  } catch (error) {
    console.error("Get logs error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


/* =====================================================
   GET PLATFORM SETTINGS
===================================================== */
export const getSettings = async (req, res) => {
  try {
    const settings = await adminService.getSettings();

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load platform settings",
    });
  }
};


/* =====================================================
   UPDATE PLATFORM SETTINGS
===================================================== */
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid settings data",
      });
    }

    const updatedSettings =
      await adminService.updateSettings(settings);

    return res.json({
      success: true,
      message: "Platform settings saved successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save platform settings",
    });
  }
};