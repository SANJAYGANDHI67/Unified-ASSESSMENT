import pool from '../config/db.js';

export const getAssessmentsByInstructor = async (instructorId) => {
    const [assessments] = await pool.execute(
        'SELECT * FROM assessments WHERE created_by = ? ORDER BY created_at DESC',
        [instructorId]
    );
    return assessments;
};

export const getAssessmentById = async (assessmentId) => {
    const [assessments] = await pool.execute(
        'SELECT * FROM assessments WHERE id = ?',
        [assessmentId]
    );
    return assessments[0] || null;
};

export const getPublishedAssessments = async () => {
    const [assessments] = await pool.execute(
        'SELECT a.*, u.name as instructor_name FROM assessments a JOIN users u ON a.created_by = u.id WHERE a.status = ? ORDER BY a.created_at DESC',
        ['published']
    );
    return assessments;
};

export const createAssessment = async (assessmentData) => {
    const { title, description, total_marks, created_by } = assessmentData;
    const [result] = await pool.execute(
        'INSERT INTO assessments (title, description, total_marks, status, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, description, total_marks, 'draft', created_by]
    );
    return result.insertId;
};

export const updateAssessment = async (assessmentId, assessmentData) => {
    const { title, description, total_marks, status } = assessmentData;
    await pool.execute(
        'UPDATE assessments SET title = ?, description = ?, total_marks = ?, status = ? WHERE id = ?',
        [title, description, total_marks, status, assessmentId]
    );
};

export const deleteAssessment = async (assessmentId) => {
    await pool.execute('DELETE FROM assessments WHERE id = ?', [assessmentId]);
};

export const getQuestionsByAssessment = async (assessmentId) => {
    const [questions] = await pool.execute(
        'SELECT * FROM questions WHERE assessment_id = ? ORDER BY id',
        [assessmentId]
    );
    return questions;
};

export const createQuestion = async (questionData) => {
    const { assessment_id, question, question_type, options, correct_option, marks, source } = questionData;
    const [result] = await pool.execute(
        'INSERT INTO questions (assessment_id, question, question_type, options, correct_option, marks, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [assessment_id, question, question_type, JSON.stringify(options), correct_option, marks, source || 'manual']
    );
    return result.insertId;
};

export const updateQuestion = async (questionId, questionData) => {
    const { question, question_type, options, correct_option, marks } = questionData;
    await pool.execute(
        'UPDATE questions SET question = ?, question_type = ?, options = ?, correct_option = ?, marks = ? WHERE id = ?',
        [question, question_type, JSON.stringify(options), correct_option, marks, questionId]
    );
};

export const deleteQuestion = async (questionId) => {
    await pool.execute('DELETE FROM questions WHERE id = ?', [questionId]);
};

export const getAIQuestionsByAssessment = async (assessmentId) => {
    const [questions] = await pool.execute(
        'SELECT * FROM ai_questions WHERE assessment_id = ? ORDER BY id',
        [assessmentId]
    );
    return questions;
};

export const getAssessmentStats = async (instructorId) => {
    const [stats] = await pool.execute(
        `SELECT 
            COUNT(*) as total_assessments,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_assessments,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_assessments
        FROM assessments 
        WHERE created_by = ?`,
        [instructorId]
    );
    return stats[0];
};

