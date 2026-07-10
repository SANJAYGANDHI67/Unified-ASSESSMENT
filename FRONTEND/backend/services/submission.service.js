import pool from "../config/db.js";



import { evaluateDescriptiveAnswer } from "./evaluationEngine.service.js";
import {
  saveAIFeedback,
  getAIFeedback,
} from "./aiFeedback.service.js";

/* =====================================================
   SUBMISSION CORE
===================================================== */

export const createSubmission = async (assessmentId, studentId) => {
  const [result] = await pool.execute(
    `
    INSERT INTO submissions (assessment_id, student_id, status)
    VALUES (?, ?, 'in_progress')
    `,
    [assessmentId, studentId]
  );

  return result.insertId;
};

export const getSubmissionById = async (submissionId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM submissions WHERE id = ?",
    [submissionId]
  );
  return rows[0] || null;
};

export const getSubmissionByStudentAndAssessment = async (
  studentId,
  assessmentId
) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM submissions
    WHERE student_id = ? AND assessment_id = ?
    `,
    [studentId, assessmentId]
  );

  return rows[0] || null;
};

/* =====================================================
   STUDENT VIEWS
===================================================== */

export const getSubmissionsByStudent = async (studentId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id,
      s.assessment_id,
      s.status,
      s.submitted_at,
      a.title AS assessment_title,
      a.total_marks
    FROM submissions s
    JOIN assessments a ON a.id = s.assessment_id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
    `,
    [studentId]
  );

  return rows;
};

/* =====================================================
   INSTRUCTOR VIEWS
===================================================== */

export const getSubmissionsForInstructor = async (instructorId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id,
      s.status,
      s.submitted_at,
      a.title AS assessment_title,
      u.name AS student_name,
      u.email AS student_email
    FROM submissions s
    JOIN assessments a ON a.id = s.assessment_id
    JOIN users u ON u.id = s.student_id
    WHERE a.created_by = ?
    ORDER BY s.submitted_at DESC
    `,
    [instructorId]
  );

  return rows;
};

export const getSubmissionsByAssessment = async (assessmentId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id,
      s.status,
      s.submitted_at,
      u.name AS student_name,
      u.email AS student_email
    FROM submissions s
    JOIN users u ON u.id = s.student_id
    WHERE s.assessment_id = ?
    ORDER BY s.submitted_at DESC
    `,
    [assessmentId]
  );

  return rows;
};

export const getSubmittedSubmissionsByAssessment = async (assessmentId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id,
      s.status,
      s.submitted_at,
      u.name AS student_name,
      u.email AS student_email
    FROM submissions s
    JOIN users u ON u.id = s.student_id
    WHERE s.assessment_id = ?
      AND s.status IN ('submitted', 'evaluated')
    ORDER BY s.submitted_at DESC
    `,
    [assessmentId]
  );

  return rows;
};

/* =====================================================
   ANSWERS  ✅ FIXED (NO marks_awarded)
===================================================== */

export const saveAnswer = async ({
  submission_id,
  question_id,
  answer,
}) => {
  const [existing] = await pool.execute(
    `
    SELECT id
    FROM answers
    WHERE submission_id = ? AND question_id = ?
    `,
    [submission_id, question_id]
  );

  if (existing.length > 0) {
    await pool.execute(
      `
      UPDATE answers
      SET answer = ?
      WHERE submission_id = ? AND question_id = ?
      `,
      [answer, submission_id, question_id]
    );

    return existing[0].id;
  }

  const [result] = await pool.execute(
    `
    INSERT INTO answers (submission_id, question_id, answer)
    VALUES (?, ?, ?)
    `,
    [submission_id, question_id, answer]
  );

  return result.insertId;
};

export const getAnswersBySubmission = async (submissionId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      a.id,
      a.question_id,
      a.answer,
      q.question,
      q.question_type,
      q.marks AS question_marks,
      q.options
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    WHERE a.submission_id = ?
    ORDER BY a.question_id
    `,
    [submissionId]
  );

  return rows;
};

/* =====================================================
   FINALIZATION
===================================================== */

export const submitAssessment = async (submissionId) => {
  await pool.execute(
    `
    UPDATE submissions
    SET status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [submissionId]
  );
};


/* =====================================================
   SUBMISSION DETAILS FOR EVALUATION
===================================================== */

export const getSubmissionDetails = async (submissionId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      s.id AS submission_id,
      s.assessment_id,

      u.id AS student_id,
      u.name AS student_name,
      u.email AS student_email,

      q.id AS question_id,
      q.question,
      q.question_type,
      q.marks,
      q.options,
      q.correct_option,
      q.reference_answer,

      a.answer AS student_answer

    FROM submissions s

    JOIN users u
      ON u.id = s.student_id

    JOIN answers a
      ON a.submission_id = s.id

    JOIN questions q
      ON q.id = a.question_id

    WHERE s.id = ?

    ORDER BY q.id
    `,
    [submissionId]
  );
for (const row of rows) {

  if (row.question_type !== "descriptive") continue;

  // Already evaluated?
  let ai = await getAIFeedback(
    submissionId,
    row.question_id
  );

  if (!ai) {

    const result =
      await evaluateDescriptiveAnswer({
        question: row.question,
        referenceAnswer: row.reference_answer,
        studentAnswer: row.student_answer,
        maxMarks: row.marks,
      });

    await saveAIFeedback({
      submissionId,
      questionId: row.question_id,
      aiScore: result.score,
      aiFeedback: result.feedback,
    });

    ai = {
      ai_score: result.score,
      ai_feedback: result.feedback,
    };
  }

  row.ai_score = ai.ai_score;
  row.ai_feedback = ai.ai_feedback;
}











// Existing AI feedback (if already evaluated)
const existingFeedback = await getAIFeedback(submissionId);

for (const row of rows) {

  if (row.question_type !== "descriptive") {
    continue;
  }

  let ai = existingFeedback.find(
    (f) => f.question_id === row.question_id
  );

  // Generate AI evaluation only once
  if (!ai) {
    const result = await evaluateDescriptiveAnswer({
      question: row.question,
      referenceAnswer: row.reference_answer,
      studentAnswer: row.student_answer,
      maxMarks: row.marks,
    });

    await saveAIFeedback({
      submissionId,
      questionId: row.question_id,
      aiScore: result.score,
      aiFeedback: result.feedback,
    });

    ai = {
      ai_score: result.score,
      ai_feedback: result.feedback,
    };
  }

  row.ai_score = ai.ai_score;
  row.ai_feedback = ai.ai_feedback;
}


return rows;
  
  
};