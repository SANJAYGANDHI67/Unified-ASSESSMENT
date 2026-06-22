import pool from "../config/db.js";

/* ======================
   STUDENT DASHBOARD
   (SAFE – NO EVALUATION DEPENDENCY)
====================== */
export const getStudentDashboard = async (studentId) => {
  /* Total published assessments */
  const [[assessmentCount]] = await pool.execute(
    `SELECT COUNT(*) AS total 
     FROM assessments 
     WHERE status = 'published'`
  );

  /* Student submissions */
  const [submissions] = await pool.execute(
    `
    SELECT 
      status,
      created_at,
      submitted_at
    FROM submissions
    WHERE student_id = ?
    ORDER BY created_at DESC
    `,
    [studentId]
  );

  const completed = submissions.filter(
    (s) => s.status === "submitted"
  ).length;

  const inProgress = submissions.filter(
    (s) => s.status === "in_progress"
  ).length;

  return {
    totalAssessments: assessmentCount?.total || 0,
    completed,
    inProgress,

    /* Evaluation not wired yet */
    averageScore: 0,

    /* Reserved for future charts */
    performanceData: [],

    /* Activity feed */
    recentActivity: submissions || [],
  };
};

/* ======================
   INSTRUCTOR DASHBOARD
====================== */
export const getInstructorDashboard = async (instructorId) => {
  const [[assessmentStats]] = await pool.execute(
    `
    SELECT
      COUNT(*) AS totalAssessments,
      SUM(status = 'published') AS publishedAssessments,
      SUM(status = 'draft') AS pendingReview
    FROM assessments
    WHERE created_by = ?
    `,
    [instructorId]
  );

  const [[submissionStats]] = await pool.execute(
    `
    SELECT COUNT(*) AS evaluated
    FROM submissions s
    JOIN assessments a ON s.assessment_id = a.id
    WHERE a.created_by = ?
      AND s.status = 'submitted'
    `,
    [instructorId]
  );

  const [recentAssessments] = await pool.execute(
    `
    SELECT id, title, total_marks, status
    FROM assessments
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [instructorId]
  );

  return {
    totalAssessments: assessmentStats?.totalAssessments || 0,
    publishedAssessments: assessmentStats?.publishedAssessments || 0,
    pendingReview: assessmentStats?.pendingReview || 0,
    evaluated: submissionStats?.evaluated || 0,
    recentAssessments: recentAssessments || [],
    activityData: [],
  };
};

/* ======================
   ADMIN DASHBOARD
====================== */
export const getAdminDashboard = async () => {
  const [[students]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'student'`
  );

  const [[instructors]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'instructor'`
  );

  const [[assessments]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM assessments`
  );

  const [[active]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM assessments WHERE status = 'published'`
  );

  return {
    totalStudents: students?.total || 0,
    totalInstructors: instructors?.total || 0,
    totalAssessments: assessments?.total || 0,
    activeAssessments: active?.total || 0,
    userGrowth: [],
  };
};