import pool from '../config/db.js';

export const createSubmission = async (assessmentId, studentId) => {
    const [result] = await pool.execute(
        'INSERT INTO submissions (assessment_id, student_id, status) VALUES (?, ?, ?)',
        [assessmentId, studentId, 'in_progress']
    );
    return result.insertId;
};

export const getSubmissionById = async (submissionId) => {
    const [submissions] = await pool.execute(
        'SELECT * FROM submissions WHERE id = ?',
        [submissionId]
    );
    return submissions[0] || null;
};

export const getSubmissionByStudentAndAssessment = async (studentId, assessmentId) => {
    const [submissions] = await pool.execute(
        'SELECT * FROM submissions WHERE student_id = ? AND assessment_id = ?',
        [studentId, assessmentId]
    );
    return submissions[0] || null;
};

export const getSubmissionsByStudent = async (studentId) => {
    const [submissions] = await pool.execute(
        `SELECT s.*, a.title as assessment_title, a.total_marks 
         FROM submissions s 
         JOIN assessments a ON s.assessment_id = a.id 
         WHERE s.student_id = ? 
         ORDER BY s.submitted_at DESC`,
        [studentId]
    );
    return submissions;
};

export const getSubmissionsByAssessment = async (assessmentId) => {
    const [submissions] = await pool.execute(
        `SELECT s.*, u.name as student_name, u.email as student_email 
         FROM submissions s 
         JOIN users u ON s.student_id = u.id 
         WHERE s.assessment_id = ? 
         ORDER BY s.created_at DESC`,
        [assessmentId]
    );
    return submissions;
};

export const submitAssessment = async (submissionId) => {
    await pool.execute(
        'UPDATE submissions SET status = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['submitted', submissionId]
    );
};

export const saveAnswer = async (answerData) => {
    const { submission_id, question_id, answer, marks_awarded } = answerData;
    const [existing] = await pool.execute(
        'SELECT id FROM answers WHERE submission_id = ? AND question_id = ?',
        [submission_id, question_id]
    );

    if (existing.length > 0) {
        await pool.execute(
            'UPDATE answers SET answer = ?, marks_awarded = ? WHERE submission_id = ? AND question_id = ?',
            [answer, marks_awarded || 0, submission_id, question_id]
        );
        return existing[0].id;
    } else {
        const [result] = await pool.execute(
            'INSERT INTO answers (submission_id, question_id, answer, marks_awarded) VALUES (?, ?, ?, ?)',
            [submission_id, question_id, answer, marks_awarded || 0]
        );
        return result.insertId;
    }
};

export const getAnswersBySubmission = async (submissionId) => {
    const [answers] = await pool.execute(
        `SELECT a.*, q.question, q.question_type, q.marks as question_marks, q.options 
         FROM answers a 
         JOIN questions q ON a.question_id = q.id 
         WHERE a.submission_id = ? 
         ORDER BY a.question_id`,
        [submissionId]
    );
    return answers;
};

export const getSubmissionTotalMarks = async (submissionId) => {
    const [result] = await pool.execute(
        'SELECT SUM(marks_awarded) as total_marks FROM answers WHERE submission_id = ?',
        [submissionId]
    );
    return result[0].total_marks || 0;
};

