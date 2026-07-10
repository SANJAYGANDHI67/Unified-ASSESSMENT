import pool from "../config/db.js";

/* =========================================
   SAVE AI FEEDBACK
========================================= */

export async function saveAIFeedback({
  submissionId,
  questionId,
  aiScore,
  aiFeedback,
}) {
  await pool.execute(
    `
    INSERT INTO ai_feedback
    (submission_id, question_id, ai_score, ai_feedback)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      ai_score = VALUES(ai_score),
      ai_feedback = VALUES(ai_feedback)
    `,
    [
      submissionId,
      questionId,
      aiScore,
      aiFeedback,
    ]
  );
}

/* =========================================
   GET AI FEEDBACK
========================================= */

export async function getAIFeedback(submissionId) {
  const [rows] = await pool.execute(
    `
    SELECT
      question_id,
      ai_score,
      ai_feedback
    FROM ai_feedback
    WHERE submission_id = ?
    `,
    [submissionId]
  );

  return rows;
}