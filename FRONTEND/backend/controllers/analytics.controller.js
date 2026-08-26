import * as analyticsService from "../services/analytics.service.js";

/* =====================================================
   OVERALL INSTRUCTOR ANALYTICS
===================================================== */
export const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const analytics =
      await analyticsService.getInstructorAnalytics(instructorId);

    return res.json(analytics);

  } catch (error) {
    console.error("INSTRUCTOR ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor analytics",
    });
  }
};

/* =====================================================
   SINGLE ASSESSMENT ANALYTICS
===================================================== */
export const getAssessmentAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const assessmentId = Number(req.params.assessmentId);

    if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    const analytics =
      await analyticsService.getAssessmentAnalytics(
        assessmentId,
        instructorId
      );

    return res.json(analytics);

  } catch (error) {
    console.error("=================================");
    console.error("ASSESSMENT ANALYTICS ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL:", error.sql);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("STACK:", error.stack);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code || null,
      sqlMessage: error.sqlMessage || null,
    });
  }
};