import pool from "../config/db.js";

/* ======================
   ASSESSMENTS
====================== */

export const getAssessmentsByInstructor = async (instructorId) => {
  const [rows] = await pool.execute(
    `SELECT 
       a.*,
       (SELECT COUNT(*) FROM questions q WHERE q.assessment_id = a.id) AS question_count,
       (SELECT COUNT(*) FROM submissions s WHERE s.assessment_id = a.id) AS submission_count
     FROM assessments a
     WHERE a.created_by = ?
     ORDER BY a.created_at DESC`,
    [instructorId]
  );
  return rows;
};

export const getAssessmentById = async (assessmentId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM assessments WHERE id = ?",
    [assessmentId]
  );
  return rows[0] || null;
};

export const getPublishedAssessments = async () => {
  const [rows] = await pool.execute(
    `SELECT 
       a.*,
       u.name AS instructor_name
     FROM assessments a
     JOIN users u ON a.created_by = u.id
     WHERE a.status = 'published'
     ORDER BY a.created_at DESC`
  );
  return rows;
};

/* ======================
   CREATE ASSESSMENT ✅ FIXED
====================== */

export const createAssessment = async ({
  title,
  description,
  total_marks,
  created_by,
  question_config,
  subject,
  syllabus_topics,
}) => {
  const [result] = await pool.execute(
    `
    INSERT INTO assessments
    (
      title,
      description,
      total_marks,
      status,
      created_by,
      question_config,
      subject,
      syllabus_topics
    )
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?)
    `,
    [
      title,
      description,
      total_marks,
      created_by,
      question_config ?? null,
      subject ?? null,
      syllabus_topics ?? null,
    ]
  );

  return result.insertId;
};

/* ======================
   UPDATE ASSESSMENT ✅ FIXED
====================== */

export const updateAssessment = async (assessmentId, data) => {
  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (data.total_marks !== undefined) {
    fields.push("total_marks = ?");
    values.push(data.total_marks);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (data.question_config !== undefined) {
    fields.push("question_config = ?");
    values.push(data.question_config);
  }

  if (data.subject !== undefined) {
    fields.push("subject = ?");
    values.push(data.subject);
  }

  if (data.syllabus_topics !== undefined) {
    fields.push("syllabus_topics = ?");
    values.push(data.syllabus_topics);
  }

  if (!fields.length) return;

  values.push(assessmentId);

  await pool.execute(
    `UPDATE assessments SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
};

export const deleteAssessment = async (assessmentId) => {
  await pool.execute("DELETE FROM assessments WHERE id = ?", [assessmentId]);
};

/* ======================
   QUESTIONS
====================== */

export const getQuestionsByAssessment = async (assessmentId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM questions WHERE assessment_id = ? ORDER BY id",
    [assessmentId]
  );
  return rows;
};

export const createQuestion = async ({
  assessment_id,
  question,
  question_type,
  options,
  correct_option,
  marks,
  source = "manual",
}) => {
  const optionsValue =
    options === null || options === undefined
      ? null
      : typeof options === "string"
      ? options
      : JSON.stringify(options);

  const [result] = await pool.execute(
    `
    INSERT INTO questions
    (assessment_id, question, question_type, options, correct_option, marks, source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      assessment_id,
      question,
      question_type,
      optionsValue,
      correct_option,
      marks,
      source,
    ]
  );

  return result.insertId;
};

export const updateQuestion = async (questionId, data) => {
  const fields = [];
  const values = [];

  if (data.question !== undefined) {
    fields.push("question = ?");
    values.push(data.question);
  }

  if (data.question_type !== undefined) {
    fields.push("question_type = ?");
    values.push(data.question_type);
  }

  if (data.options !== undefined) {
    const opt =
      data.options === null
        ? null
        : typeof data.options === "string"
        ? data.options
        : JSON.stringify(data.options);

    fields.push("options = ?");
    values.push(opt);
  }

  if (data.correct_option !== undefined) {
    fields.push("correct_option = ?");
    values.push(data.correct_option);
  }

  if (data.marks !== undefined) {
    fields.push("marks = ?");
    values.push(data.marks);
  }

  if (!fields.length) return;

  values.push(questionId);

  await pool.execute(
    `UPDATE questions SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
};

export const deleteQuestion = async (questionId) => {
  await pool.execute("DELETE FROM questions WHERE id = ?", [questionId]);
};

/* ======================
   AI QUESTIONS
====================== */

export const getAIQuestionsByAssessment = async (assessmentId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM ai_questions WHERE assessment_id = ? ORDER BY id",
    [assessmentId]
  );
  return rows;
};

/* ======================
   STATS
====================== */

export const getAssessmentStats = async (instructorId) => {
  const [[stats]] = await pool.execute(
    `SELECT
       COUNT(*) AS totalAssessments,
       SUM(status = 'published') AS publishedAssessments,
       SUM(status = 'draft') AS draftAssessments
     FROM assessments
     WHERE created_by = ?`,
    [instructorId]
  );

  const [[pending]] = await pool.execute(
    `SELECT COUNT(*) AS pendingReview
     FROM ai_questions aq
     JOIN assessments a ON aq.assessment_id = a.id
     WHERE a.created_by = ?`,
    [instructorId]
  );

  const [[evaluated]] = await pool.execute(
    `SELECT COUNT(*) AS evaluated
     FROM submissions s
     JOIN assessments a ON s.assessment_id = a.id
     WHERE a.created_by = ?
       AND s.status = 'submitted'`,
    [instructorId]
  );

  return {
    ...stats,
    pendingReview: pending.pendingReview,
    evaluated: evaluated.evaluated,
  };
};