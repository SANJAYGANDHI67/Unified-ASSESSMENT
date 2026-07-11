import * as analyticsService from "../services/analytics.service.js";

/* =====================================================
   OVERALL INSTRUCTOR ANALYTICS
===================================================== */
export const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const analytics =
      await analyticsService.getInstructorAnalytics(instructorId);

    res.json(analytics);
  } catch (error) {
    console.error("INSTRUCTOR ANALYTICS ERROR:", error);

    res.status(500).json({
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
    const { assessmentId } = req.params;

   
      const analytics =
  await analyticsService.getAssessmentAnalytics(
    Number(assessmentId),
    instructorId
  );

    res.json(analytics);
  } catch (error) {
    console.error("ASSESSMENT ANALYTICS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment analytics",
    });
  }
};