import pool from "../config/db.js";

/* ======================
   STUDENT DASHBOARD
   (SAFE – NO EVALUATION DEPENDENCY)
====================== */
export const getStudentDashboard = async (studentId) => {
  /* ======================
     TOTAL PUBLISHED ASSESSMENTS
  ====================== */

  const [[assessmentCount]] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM assessments
    WHERE status = 'published'
    `
  );

  /* ======================
     STUDENT SUBMISSIONS
  ====================== */

  const [submissions] = await pool.execute(
    `
    SELECT 
      s.id, 
      s.status, 
      s.created_at, 
      s.submitted_at, 
      a.title, 
      a.total_marks, 
      e.final_score 
    FROM submissions s
    JOIN assessments a 
      ON s.assessment_id = a.id
    LEFT JOIN evaluations e 
      ON e.submission_id = s.id
    WHERE s.student_id = ?
    ORDER BY s.created_at DESC
    `,
    [studentId]
  );

  /* ======================
     COMPLETED
  ====================== */

  const completed = submissions.filter(
    (s) => s.status === "evaluated"
  ).length;

  /* ======================
     IN PROGRESS
  ====================== */

  const inProgress = submissions.filter(
    (s) => s.status === "in_progress"
  ).length;

  /* ======================
     AVERAGE SCORE
  ====================== */

  const evaluatedSubmissions = submissions.filter(
    (s) =>
      s.status === "evaluated" &&
      s.final_score !== null &&
      s.final_score !== undefined
  );

  let averageScore = 0;

  if (evaluatedSubmissions.length > 0) {
    const totalPercentage = evaluatedSubmissions.reduce(
      (sum, s) => {
        const percentage =
          (Number(s.final_score) / Number(s.total_marks)) * 100;

        return sum + percentage;
      },
      0
    );

    averageScore =
      totalPercentage / evaluatedSubmissions.length;
  }

  /* ======================
     PERFORMANCE DATA
  ====================== */

  const performanceData = evaluatedSubmissions.map((s) => ({
    assessment: s.title,
    score:
      Number(s.total_marks) > 0
        ? Math.round(
            (Number(s.final_score) /
              Number(s.total_marks)) *
              100
          )
        : 0,
  }));

  return {
    totalAssessments: assessmentCount?.total || 0,
    completed,
    inProgress,
    averageScore: Math.round(averageScore),
    performanceData,
    recentActivity: submissions || [],
  };
};

/* ======================
   INSTRUCTOR DASHBOARD
====================== */
export const getInstructorDashboard = async (instructorId) => {
  /* ======================
     ASSESSMENT COUNTS
  ====================== */

  const [[assessmentStats]] = await pool.execute(
    `
    SELECT
      COUNT(*) AS totalAssessments,
      COALESCE(SUM(status = 'published'), 0) AS publishedAssessments,
      COALESCE(SUM(status = 'draft'), 0) AS pendingReview
    FROM assessments
    WHERE created_by = ?
    `,
    [instructorId]
  );

  /* ======================
     EVALUATED SUBMISSIONS
  ====================== */

  const [[submissionStats]] = await pool.execute(
    `
    SELECT COUNT(*) AS evaluated
    FROM submissions s
    JOIN assessments a
      ON s.assessment_id = a.id
    WHERE a.created_by = ?
      AND s.status = 'submitted'
    `,
    [instructorId]
  );

  /* ======================
     RECENT ASSESSMENTS
  ====================== */

  const [recentAssessments] = await pool.execute(
    `
    SELECT
      id,
      title,
      total_marks,
      status,
      created_at
    FROM assessments
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [instructorId]
  );

  /* ======================
     ASSESSMENT ACTIVITY
  ====================== */

  const [activityData] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(s.created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM submissions s
    JOIN assessments a
      ON s.assessment_id = a.id
    WHERE a.created_by = ?
    GROUP BY DATE_FORMAT(s.created_at, '%Y-%m')
    ORDER BY month ASC
    `,
    [instructorId]
  );

  /* ======================
     ASSESSMENT STATUS
  ====================== */

  const [assessmentStatusRows] = await pool.execute(
    `
    SELECT
      status,
      COUNT(*) AS total
    FROM assessments
    WHERE created_by = ?
    GROUP BY status
    `,
    [instructorId]
  );

  const assessmentStatus = assessmentStatusRows.map((row) => ({
    name: row.status,
    value: Number(row.total) || 0,
  }));

  /* ======================
     RETURN
  ====================== */

  return {
    totalAssessments:
      Number(assessmentStats?.totalAssessments) || 0,

    publishedAssessments:
      Number(assessmentStats?.publishedAssessments) || 0,

    pendingReview:
      Number(assessmentStats?.pendingReview) || 0,

    evaluated:
      Number(submissionStats?.evaluated) || 0,

    recentAssessments:
      recentAssessments || [],

    activityData:
      activityData || [],

    assessmentStatus,
  };
};
/* ======================
   ADMIN DASHBOARD
====================== */
export const getAdminDashboard = async () => {
  /* ======================
     BASIC COUNTS
  ====================== */

  const [[students]] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'student'
    `
  );

  const [[instructors]] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'instructor'
    `
  );

  const [[assessments]] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM assessments
    `
  );

  const [[active]] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM assessments
    WHERE status = 'published'
    `
  );

  /* ======================
     MONTHLY GROWTH
  ====================== */

  const [studentGrowth] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS students
    FROM users
    WHERE role = 'student'
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
    `
  );

  const [instructorGrowth] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS instructors
    FROM users
    WHERE role = 'instructor'
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
    `
  );

  const [assessmentGrowth] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS assessments
    FROM assessments
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
    `
  );

  /* ======================
     COMBINE MONTHLY DATA
  ====================== */

  const months = new Set();

  studentGrowth.forEach((row) => months.add(row.month));
  instructorGrowth.forEach((row) => months.add(row.month));
  assessmentGrowth.forEach((row) => months.add(row.month));

  const userGrowth = Array.from(months)
    .sort()
    .map((month) => ({
      month,

      students:
        Number(
          studentGrowth.find((r) => r.month === month)?.students
        ) || 0,

      instructors:
        Number(
          instructorGrowth.find((r) => r.month === month)?.instructors
        ) || 0,

      assessments:
        Number(
          assessmentGrowth.find((r) => r.month === month)?.assessments
        ) || 0,
    }));

  /* ======================
     USER DISTRIBUTION
  ====================== */

  const userDistribution = [
    {
      name: "Students",
      value: Number(students?.total) || 0,
    },
    {
      name: "Instructors",
      value: Number(instructors?.total) || 0,
    },
  ];

  /* ======================
     ASSESSMENT STATUS
  ====================== */

  const [assessmentStatusRows] = await pool.execute(
    `
    SELECT
      status,
      COUNT(*) AS total
    FROM assessments
    GROUP BY status
    `
  );

  const assessmentStatus = assessmentStatusRows.map((row) => ({
    name: row.status,
    value: Number(row.total) || 0,
  }));

  return {
    totalStudents: Number(students?.total) || 0,
    totalInstructors: Number(instructors?.total) || 0,
    totalAssessments: Number(assessments?.total) || 0,
    activeAssessments: Number(active?.total) || 0,

    userGrowth,
    userDistribution,
    assessmentStatus,
  };
};