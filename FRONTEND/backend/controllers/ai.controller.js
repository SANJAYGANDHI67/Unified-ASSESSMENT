import * as aiService from "../services/ai.service.js";
import pool from "../config/db.js";

/* =====================================================
   PHASE 1 — GENERATE AI QUESTIONS
===================================================== */
export const generateQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({ error: "assessmentId required" });
    }

    const id = Number(assessmentId);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid assessmentId" });
    }

    /* ======================
       🔒 PRE-CHECK (PERMANENT)
    ====================== */
    const [[assessment]] = await pool.execute(
      `
      SELECT subject, syllabus_topics
      FROM assessments
      WHERE id = ?
      `,
      [id]
    );

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (!assessment.subject) {
      return res.status(400).json({
        error: "Subject not set for assessment",
      });
    }

    if (!assessment.syllabus_topics) {
      return res.status(400).json({
        error: "Syllabus topics not generated",
      });
    }

    /* ======================
       CALL AI SERVICE
    ====================== */
    await aiService.generateQuestionsForAssessment(id);

    res.json({
      success: true,
      message: "AI questions generated successfully",
    });
  } catch (error) {
    console.error("AI GENERATION ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message || "AI generation failed",
    });
  }
};

/* =====================================================
   PHASE 2 — FETCH AI QUESTIONS
===================================================== */
export const getAIQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({ error: "assessmentId required" });
    }

    const id = Number(assessmentId);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid assessmentId" });
    }

    const questions =
      await aiService.getAIQuestionsByAssessment(id);

    res.json(questions);
  } catch (error) {
    console.error("FETCH AI QUESTIONS ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch AI questions",
    });
  }
};

/* =====================================================
   PHASE 3 — APPROVE AI QUESTION
===================================================== */
export const approveAIQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_type, marks, options, correct_option } = req.body;

    if (!id) {
      return res.status(400).json({ error: "AI question id required" });
    }

    const qid = Number(id);
    if (!Number.isInteger(qid)) {
      return res.status(400).json({ error: "Invalid AI question id" });
    }

    await aiService.approveAIQuestion(qid, {
      question_type,
      marks,
      options,
      correct_option,
    });

    res.json({
      success: true,
      message: "AI question approved successfully",
    });
  } catch (error) {
    console.error("AI APPROVAL ERROR:", error);

    res.status(500).json({
      error: error.message || "AI approval failed",
    });
  }
};

/* =====================================================
   PHASE 4 — REJECT AI QUESTION
===================================================== */
export const rejectAIQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "AI question id required" });
    }

    const qid = Number(id);
    if (!Number.isInteger(qid)) {
      return res.status(400).json({ error: "Invalid AI question id" });
    }

    await aiService.rejectAIQuestion(qid);

    res.json({
      success: true,
      message: "AI question rejected successfully",
    });
  } catch (error) {
    console.error("AI REJECTION ERROR:", error);

    res.status(500).json({
      error: error.message || "AI rejection failed",
    });
  }
};