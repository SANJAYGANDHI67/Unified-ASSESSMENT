import * as evaluationService from "../services/evaluation.service.js";
import * as submissionService from "../services/submission.service.js";

/* ======================
   SUBMIT FINAL EVALUATION
====================== */
export const submitEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { final_score, feedback } = req.body;

    if (final_score === undefined) {
      return res.status(400).json({ error: "Final score is required" });
    }

    const submission =
      await submissionService.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Only instructor allowed
    if (req.user.role !== "instructor") {
      return res.status(403).json({ error: "Access denied" });
    }

    await evaluationService.createOrUpdateEvaluation({
      submissionId,
      finalScore: parseInt(final_score),
      feedback: feedback || null,
      instructorId: req.user.id,
    });

    res.json({ message: "Evaluation submitted successfully" });
  } catch (error) {
    console.error("EVALUATION ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   GET EVALUATION
====================== */
export const getEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const evaluation =
      await evaluationService.getEvaluationBySubmission(submissionId);

    res.json(evaluation);
  } catch (error) {
    console.error("GET EVALUATION ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};