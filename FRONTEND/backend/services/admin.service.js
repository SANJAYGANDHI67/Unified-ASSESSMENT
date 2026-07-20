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

/* =====================================================
   GET SYSTEM LOGS
===================================================== */
export const getLogs = async (
  page = 1,
  limit = 10,
  type,
  date,
  search
) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;
  const offset = (safePage - 1) * safeLimit;

  let where = [];
  let params = [];

  if (type) {
    where.push("type = ?");
    params.push(type);
  }

  if (date) {
    where.push("DATE(datetime) = ?");
    params.push(date);
  }

  if (search) {
    where.push("(event LIKE ? OR user LIKE ?)");
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  const whereClause =
    where.length > 0
      ? `WHERE ${where.join(" AND ")}`
      : "";

  const [logs] = await pool.execute(
    `
    SELECT
      id,
      event,
      user,
      type,
      datetime
    FROM system_logs
    ${whereClause}
    ORDER BY datetime DESC
    LIMIT ${safeLimit} OFFSET ${offset}
    `,
    params
  );

  const [count] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM system_logs
    ${whereClause}
    `,
    params
  );

  return {
    logs,
    pagination: {
      page: safePage,
      total: count[0].total,
      totalPages: Math.ceil(
        count[0].total / safeLimit
      ),
    },
  };
};