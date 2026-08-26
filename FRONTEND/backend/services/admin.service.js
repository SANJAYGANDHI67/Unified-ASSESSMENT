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

/* =====================================================
   GET PLATFORM SETTINGS
===================================================== */
/* =====================================================
   GET PLATFORM SETTINGS
===================================================== */
export const getSettings = async () => {
  const [rows] = await pool.execute(`
    SELECT
      id,
      platform_name,
      institute_email,
      default_role,
      ai_generation,
      ai_evaluation,
      auto_publish,
      max_attempts,
      assessment_alerts,
      user_activity_alerts,
      ai_evaluation_alerts,
      security_alerts,
      updated_at
    FROM platform_settings
    WHERE id = 1
    LIMIT 1
  `);

  /* ==========================================
     CREATE DEFAULT SETTINGS IF NOT EXISTS
  ========================================== */

  if (rows.length === 0) {
    await pool.execute(`
      INSERT INTO platform_settings (
        id,
        platform_name,
        institute_email,
        default_role,
        ai_generation,
        ai_evaluation,
        auto_publish,
        max_attempts,
        assessment_alerts,
        user_activity_alerts,
        ai_evaluation_alerts,
        security_alerts
      )
      VALUES (
        1,
        'Unified Assessment Platform',
        'admin@college.edu',
        'student',
        1,
        1,
        0,
        1,
        1,
        1,
        0,
        1
      )
    `);
  }

  const [settingsRows] = await pool.execute(`
    SELECT
      id,
      platform_name,
      institute_email,
      default_role,
      ai_generation,
      ai_evaluation,
      auto_publish,
      max_attempts,
      assessment_alerts,
      user_activity_alerts,
      ai_evaluation_alerts,
      security_alerts,
      updated_at
    FROM platform_settings
    WHERE id = 1
    LIMIT 1
  `);

  return settingsRows[0];
};

/* =====================================================
   UPDATE PLATFORM SETTINGS
===================================================== */
export const updateSettings = async (settings) => {
  const {
    platformName,
    instituteEmail,
    defaultRole,
    system,
    alerts,
  } = settings;

  /* =========================
     NORMALIZE ROLE
  ========================= */
  const allowedRoles = [
  "admin",
  "instructor",
  "student",
];

const safeRole = allowedRoles.includes(
  String(defaultRole).toLowerCase()
)
  ? String(defaultRole).toLowerCase()
  : "student";
  /* =========================
     MAX ATTEMPTS
  ========================= */
  const parsedAttempts = Number(system?.maxAttempts);

  const maxAttempts =
    Number.isInteger(parsedAttempts) && parsedAttempts > 0
      ? parsedAttempts
      : 1;

  /* =========================
     UPDATE EXISTING ROW
  ========================= */
  const [result] = await pool.execute(
    `
    UPDATE platform_settings
    SET
      platform_name = ?,
      institute_email = ?,
      default_role = ?,
      ai_generation = ?,
      ai_evaluation = ?,
      auto_publish = ?,
      max_attempts = ?,
      assessment_alerts = ?,
      user_activity_alerts = ?,
      ai_evaluation_alerts = ?,
      security_alerts = ?
    WHERE id = 1
    `,
    [
      platformName?.trim() ||
        "Unified Assessment Platform",

      instituteEmail?.trim() ||
        "admin@college.edu",

      safeRole,

      system?.aiGeneration ? 1 : 0,
      system?.aiEvaluation ? 1 : 0,
      system?.autoPublish ? 1 : 0,

      maxAttempts,

      alerts?.assessment ? 1 : 0,
      alerts?.userActivity ? 1 : 0,
      alerts?.aiEvaluation ? 1 : 0,
      alerts?.security ? 1 : 0,
    ]
  );

  /* =========================
     SAFETY CHECK
  ========================= */
  if (result.affectedRows === 0) {
    throw new Error(
      "Platform settings row with id = 1 was not found"
    );
  }

  /* =========================
     RETURN SAVED SETTINGS
  ========================= */
  return await getSettings();
};