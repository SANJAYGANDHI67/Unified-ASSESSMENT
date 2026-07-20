import * as adminService from '../services/admin.service.js';

export const getStats = async (req, res) => {
    try {
        const stats = await adminService.getAdminStats();
        res.json(stats);
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getUsers(page, limit);

    res.json(result);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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