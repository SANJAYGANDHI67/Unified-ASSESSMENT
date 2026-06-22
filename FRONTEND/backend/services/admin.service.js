import pool from "../config/db.js";

/* =====================================================
   ADMIN DASHBOARD STATS
===================================================== */
export const getAdminStats = async () => {
  const [userStats] = await pool.execute(
    "SELECT COUNT(*) as total_users FROM users"
  );

  const [assessmentStats] = await pool.execute(
    "SELECT COUNT(*) as total_assessments FROM assessments"
  );

  const [submissionStats] = await pool.execute(
    "SELECT COUNT(*) as total_submissions FROM submissions"
  );

  return {
    total_users: userStats[0].total_users,
    total_assessments: assessmentStats[0].total_assessments,
    total_submissions: submissionStats[0].total_submissions,
  };
};

/* =====================================================
   GET USERS (FIXED)
===================================================== */
export const getUsers = async (page = 1, limit = 10) => {
  // ✅ FORCE SAFE NUMBERS
  const safePage =
    Number.isInteger(+page) && +page > 0 ? Number(page) : 1;

  const safeLimit =
    Number.isInteger(+limit) && +limit > 0 ? Number(limit) : 10;

  const offset = (safePage - 1) * safeLimit;

  // ✅ INLINE LIMIT & OFFSET (NO PLACEHOLDERS)
  const [users] = await pool.execute(
    `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
    `
  );

  const [countResult] = await pool.execute(
    "SELECT COUNT(*) as total FROM users"
  );

  const total = countResult[0].total;
  const totalPages = Math.ceil(total / safeLimit);

  return {
    users,
    total,
    page: safePage,
    totalPages,
    limit: safeLimit,
  };
};