import pool from '../config/db.js';

export const getAdminStats = async () => {
    const [userStats] = await pool.execute('SELECT COUNT(*) as total_users FROM users');
    const [assessmentStats] = await pool.execute('SELECT COUNT(*) as total_assessments FROM assessments');
    const [submissionStats] = await pool.execute('SELECT COUNT(*) as total_submissions FROM submissions');
    
    return {
        total_users: userStats[0].total_users,
        total_assessments: assessmentStats[0].total_assessments,
        total_submissions: submissionStats[0].total_submissions
    };
};

export const getUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const [users] = await pool.execute(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
    
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return {
        users,
        total,
        page,
        totalPages,
        limit
    };
};

