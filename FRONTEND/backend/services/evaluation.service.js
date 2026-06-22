import pool from "../config/db.js";

export const createOrUpdateEvaluation = async ({
  submissionId,
  finalScore,
  feedback,
  instructorId,
}) => {
  await pool.execute(
    `
    INSERT INTO evaluations
      (submission_id, final_score, feedback, evaluated_by)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      final_score = VALUES(final_score),
      feedback = VALUES(feedback),
      evaluated_by = VALUES(evaluated_by)
    `,
    [submissionId, finalScore, feedback, instructorId]
  );

  // Mark submission as evaluated
  await pool.execute(
    `
    UPDATE submissions
    SET status = 'evaluated'
    WHERE id = ?
    `,
    [submissionId]
  );
};

export const getEvaluationBySubmission = async (submissionId) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM evaluations
    WHERE submission_id = ?
    `,
    [submissionId]
  );

  return rows[0] || null;
};