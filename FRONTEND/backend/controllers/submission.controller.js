import * as submissionService from "../services/submission.service.js";
import * as assessmentService from "../services/assessment.service.js";

/* =====================================================
   STUDENT
===================================================== */

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getSubmissionsByStudent(
      req.user.id
    );
    res.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    if (assessment.status?.toUpperCase() !== "PUBLISHED") {
      return res.status(400).json({ error: "Assessment is not published" });
    }

    let submission =
      await submissionService.getSubmissionByStudentAndAssessment(
        req.user.id,
        assessmentId
      );

    if (submission && submission.status === "submitted") {
      return res.status(400).json({ error: "Assessment already submitted" });
    }

    if (!submission) {
      const submissionId = await submissionService.createSubmission(
        assessmentId,
        req.user.id
      );
      submission = await submissionService.getSubmissionById(submissionId);
    }

    res.json(submission);
  } catch (error) {
    console.error("Start assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSubmissionAnswers = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await submissionService.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (
      submission.student_id !== req.user.id &&
      req.user.role !== "instructor" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const answers = await submissionService.getAnswersBySubmission(submissionId);
    res.json({
      submission: {
        id: submission.id,
        assessment_id: submission.assessment_id,
        status: submission.status,
      },
      answers: answers,
    });
  } catch (error) {
    console.error("Get answers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const saveAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { question_id, answer } = req.body;

    const submission = await submissionService.getSubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.student_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (submission.status === "submitted") {
      return res
        .status(400)
        .json({ error: "Cannot modify submitted assessment" });
    }

    await submissionService.saveAnswer({
      submission_id: submissionId,
      question_id,
      answer,
    });

    res.json({ message: "Answer saved successfully" });
  } catch (error) {
    console.error("Save answer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await submissionService.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.student_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (submission.status === "submitted") {
      return res.status(400).json({ error: "Assessment already submitted" });
    }

    await submissionService.submitAssessment(submissionId);
    res.json({ message: "Assessment submitted successfully" });
  } catch (error) {
    console.error("Submit assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =====================================================
   INSTRUCTOR — EVALUATION (FIXED)
===================================================== */

export const getSubmissionsForEvaluation = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions =
      await submissionService.getSubmittedSubmissionsByAssessment(assessmentId);

    res.json(submissions);
  } catch (error) {
    console.error("Evaluation submissions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};















/* =====================================================
   INSTRUCTOR — SUBMISSION DETAILS
===================================================== */

export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission =
      await submissionService.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const details =
      await submissionService.getSubmissionDetails(submissionId);

    res.json(details);

  } catch (error) {
    console.error("Get submission details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* =====================================================
   INSTRUCTOR — ALL SUBMISSIONS FOR ONE ASSESSMENT
===================================================== */

export const getAssessmentSubmissions = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const submissions =
      await submissionService.getSubmissionsByAssessment(assessmentId);

    res.json(submissions);
  } catch (error) {
    console.error('Get assessment submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};