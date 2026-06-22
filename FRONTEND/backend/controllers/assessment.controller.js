import * as assessmentService from "../services/assessment.service.js";
import pool from "../config/db.js";

/* ======================
   ASSESSMENTS
====================== */

export const getMyAssessments = async (req, res) => {
  try {
    const assessments = await assessmentService.getAssessmentsByInstructor(
      req.user.id
    );
    res.json(assessments);
  } catch (error) {
    console.error("Get assessments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPublishedAssessments = async (req, res) => {
  try {
    const assessments = await assessmentService.getPublishedAssessments();
    res.json(assessments);
  } catch (error) {
    console.error("Get published assessments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    res.json(assessment);
  } catch (error) {
    console.error("Get assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   CREATE ASSESSMENT
====================== */

export const createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      total_marks,
      question_config,
      subject,
      syllabus_topics,
    } = req.body;

    if (!title || !total_marks) {
      return res
        .status(400)
        .json({ error: "Title and total_marks are required" });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    const assessmentId = await assessmentService.createAssessment({
      title,
      description: description || "",
      total_marks: Number(total_marks),
      created_by: req.user.id,
      question_config: question_config
        ? JSON.stringify(question_config)
        : null,
      subject,
      syllabus_topics: syllabus_topics
        ? JSON.stringify(syllabus_topics)
        : null,
    });

    res.status(201).json({
      id: assessmentId,
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Create assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   UPDATE ASSESSMENT
====================== */

export const updateAssessment = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await assessmentService.updateAssessment(req.params.id, {
      title: req.body.title ?? assessment.title,
      description: req.body.description ?? assessment.description,
      total_marks:
        req.body.total_marks !== undefined
          ? Number(req.body.total_marks)
          : assessment.total_marks,
      status: req.body.status ?? assessment.status,

      question_config:
        req.body.question_config !== undefined
          ? JSON.stringify(req.body.question_config)
          : assessment.question_config,

      subject:
        req.body.subject !== undefined
          ? req.body.subject
          : assessment.subject,

      syllabus_topics:
        req.body.syllabus_topics !== undefined
          ? JSON.stringify(req.body.syllabus_topics)
          : assessment.syllabus_topics,
    });

    res.json({ message: "Assessment updated successfully" });
  } catch (error) {
    console.error("Update assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   DELETE ASSESSMENT
====================== */

export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await assessmentService.deleteAssessment(req.params.id);
    res.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Delete assessment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   UPLOAD SYLLABUS
====================== */

export const uploadSyllabus = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "PDF file required" });
    }

    const assessment = await assessmentService.getAssessmentById(assessmentId);

    if (!assessment || assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await pool.execute(
      "UPDATE assessments SET syllabus_path = ? WHERE id = ?",
      [req.file.path, assessmentId]
    );

    res.json({
      message: "Syllabus uploaded successfully",
      syllabus_path: req.file.path,
    });
  } catch (error) {
    console.error("Upload syllabus error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   QUESTIONS (MANUAL) ✅ REQUIRED
====================== */

export const getQuestions = async (req, res) => {
  try {
    const questions = await assessmentService.getQuestionsByAssessment(
      req.params.assessmentId
    );
    res.json(questions);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    if (!assessment || assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const {
      question,
      question_type,
      options,
      correct_option,
      marks,
      source,
    } = req.body;

    const id = await assessmentService.createQuestion({
      assessment_id: assessmentId,
      question,
      question_type,
      options,
      correct_option,
      marks,
      source: source || "manual",
    });

    res.status(201).json({ id });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    await assessmentService.updateQuestion(
      req.params.questionId,
      req.body
    );
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await assessmentService.deleteQuestion(req.params.questionId);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   AI QUESTIONS (VIEW)
====================== */

export const getAIQuestions = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(
      req.params.assessmentId
    );

    if (!assessment || assessment.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const questions =
      await assessmentService.getAIQuestionsByAssessment(
        req.params.assessmentId
      );

    res.json(questions);
  } catch (error) {
    console.error("Get AI questions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================
   STATS
====================== */

export const getStats = async (req, res) => {
  try {
    const stats = await assessmentService.getAssessmentStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};