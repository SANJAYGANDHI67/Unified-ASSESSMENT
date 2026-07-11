import pool from "../config/db.js";

/* =====================================================
   OVERALL INSTRUCTOR ANALYTICS
===================================================== */

export const getInstructorAnalytics = async (instructorId) => {
  /* ======================
     KPI CARDS
  ====================== */

  const [[kpis]] = await pool.execute(
    `
    SELECT
      COUNT(DISTINCT a.id) AS totalAssessments,

      COUNT(DISTINCT s.student_id) AS studentsAttempted,

      ROUND(AVG(e.final_score),2) AS averageScore,

      MAX(e.final_score) AS highestScore,

      MIN(e.final_score) AS lowestScore,

      SUM(
        CASE
          WHEN e.final_score >= (a.total_marks * 0.40)
          THEN 1
          ELSE 0
        END
      ) AS passed,

      SUM(
        CASE
          WHEN e.final_score < (a.total_marks * 0.40)
          THEN 1
          ELSE 0
        END
      ) AS failed,

      SUM(
        CASE
          WHEN s.status='submitted'
          THEN 1
          ELSE 0
        END
      ) AS pendingEvaluations

    FROM assessments a

    LEFT JOIN submissions s
      ON a.id=s.assessment_id

    LEFT JOIN evaluations e
      ON s.id=e.submission_id

    WHERE a.created_by=?
    `,
    [instructorId]
  );

  const totalResults =
    Number(kpis.passed || 0) +
    Number(kpis.failed || 0);

  const passPercentage =
    totalResults === 0
      ? 0
      : Number(
          (
            (kpis.passed / totalResults) *
            100
          ).toFixed(2)
        );

  const failPercentage =
    totalResults === 0
      ? 0
      : Number(
          (
            (kpis.failed / totalResults) *
            100
          ).toFixed(2)
        );

  /* ======================
     SUBMISSION TREND
  ====================== */

  const [submissionTrend] =
    await pool.execute(
      `
      SELECT

        DATE(s.submitted_at) AS date,

        COUNT(*) AS submissions

      FROM submissions s

      INNER JOIN assessments a

      ON s.assessment_id=a.id

      WHERE

      a.created_by=?

      AND s.submitted_at IS NOT NULL

      GROUP BY DATE(s.submitted_at)

      ORDER BY DATE(s.submitted_at)
      `,
      [instructorId]
    );

  /* ======================
     AVERAGE SCORE TREND
  ====================== */

  const [averageScoreTrend] =
    await pool.execute(
      `
      SELECT

      DATE(s.submitted_at) AS date,

      ROUND(
        AVG(e.final_score),
        2
      ) AS average

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id=s.id

      INNER JOIN assessments a

      ON s.assessment_id=a.id

      WHERE

      a.created_by=?

      GROUP BY DATE(s.submitted_at)

      ORDER BY DATE(s.submitted_at)
      `,
      [instructorId]
    );

  /* ======================
     PASS FAIL
  ====================== */

  const passFail = [
    {
      name: "Pass",
      value: Number(kpis.passed || 0),
    },
    {
      name: "Fail",
      value: Number(kpis.failed || 0),
    },
  ];

  /* ======================
     SCORE DISTRIBUTION
  ====================== */

  const [distribution] =
    await pool.execute(
      `
      SELECT

      CASE

      WHEN e.final_score<20 THEN '0-20'

      WHEN e.final_score<40 THEN '21-40'

      WHEN e.final_score<60 THEN '41-60'

      WHEN e.final_score<80 THEN '61-80'

      ELSE '81-100'

      END AS scoreRange,

      COUNT(*) AS count

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id=s.id

      INNER JOIN assessments a

      ON s.assessment_id=a.id

      WHERE a.created_by=?

      GROUP BY scoreRange
      `,
      [instructorId]
    );
    
      /* ======================
     MONTHLY ACTIVITY
  ====================== */

  const [monthlyActivity] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(created_at,'%b') AS month,
      COUNT(*) AS assessments
    FROM assessments
    WHERE created_by=?
    GROUP BY MONTH(created_at), DATE_FORMAT(created_at,'%b')
    ORDER BY MONTH(created_at)
    `,
    [instructorId]
  );

  /* ======================
     QUESTION ANALYTICS
  ====================== */

  const [questionAnalytics] = await pool.execute(
    `
    SELECT
      q.id,
      q.question,
      q.question_type,
      q.marks,
      COUNT(ans.id) AS attempts,
      ROUND(AVG(ans.marks_awarded),2) AS averageMarks
    FROM questions q
    LEFT JOIN answers ans
      ON q.id=ans.question_id
    INNER JOIN assessments a
      ON q.assessment_id=a.id
    WHERE a.created_by=?
    GROUP BY q.id
    ORDER BY q.id
    `,
    [instructorId]
  );

  /* ======================
     TOP PERFORMING STUDENTS
  ====================== */

  const [topStudents] = await pool.execute(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      ROUND(AVG(e.final_score),2) AS averageScore
    FROM evaluations e
    INNER JOIN submissions s
      ON e.submission_id=s.id
    INNER JOIN users u
      ON s.student_id=u.id
    INNER JOIN assessments a
      ON s.assessment_id=a.id
    WHERE a.created_by=?
    GROUP BY u.id
    ORDER BY averageScore DESC
    LIMIT 10
    `,
    [instructorId]
  );

  /* ======================
     STUDENTS NEEDING ATTENTION
  ====================== */

  const [attentionStudents] = await pool.execute(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      ROUND(AVG(e.final_score),2) AS averageScore
    FROM evaluations e
    INNER JOIN submissions s
      ON e.submission_id=s.id
    INNER JOIN users u
      ON s.student_id=u.id
    INNER JOIN assessments a
      ON s.assessment_id=a.id
    WHERE a.created_by=?
    GROUP BY u.id
    HAVING averageScore < 40
    ORDER BY averageScore ASC
    LIMIT 10
    `,
    [instructorId]
  );
    /* ======================
     AI ANALYTICS
  ====================== */

  const [[aiMetrics]] = await pool.execute(
    `
    SELECT

      ROUND(AVG(ai.ai_score),2) AS avgAiScore,

      COUNT(ai.id) AS totalAiEvaluations,

      ROUND(
        AVG(
          ABS(
            ai.ai_score - e.final_score
          )
        ),
        2
      ) AS averageDifference

    FROM ai_feedback ai

    INNER JOIN submissions s
      ON ai.submission_id = s.id

    INNER JOIN assessments a
      ON s.assessment_id = a.id

    LEFT JOIN evaluations e
      ON s.id = e.submission_id

    WHERE a.created_by = ?
    `,
    [instructorId]
  );

  const accuracy =
    aiMetrics.averageDifference == null
      ? 0
      : Number(
          Math.max(
            0,
            (100 - aiMetrics.averageDifference).toFixed(2)
          )
        );

  const confidence =
    accuracy > 95
      ? 98
      : accuracy > 90
      ? 95
      : accuracy > 80
      ? 90
      : accuracy > 70
      ? 85
      : 75;

  const pendingAiReviews =
    Number(kpis.pendingEvaluations || 0);

  const manualOverridePercentage =
    aiMetrics.totalAiEvaluations > 0
      ? Number(
          (
            (aiMetrics.averageDifference /
              100) *
            100
          ).toFixed(2)
        )
      : 0;

  /* ======================
     SMART INSIGHTS
  ====================== */

  const insights = [];

  if (passPercentage >= 80) {
    insights.push({
      type: "success",
      title: "Excellent Student Performance",
      message: `${passPercentage}% of students passed the assessments.`,
    });
  }

  if (failPercentage >= 40) {
    insights.push({
      type: "warning",
      title: "High Failure Rate",
      message: `${failPercentage}% of students failed. Consider reviewing question difficulty.`,
    });
  }

  if (
    Number(kpis.pendingEvaluations || 0) >
    0
  ) {
    insights.push({
      type: "info",
      title: "Pending Evaluations",
      message: `${kpis.pendingEvaluations} submissions are waiting for evaluation.`,
    });
  }

  if (
    Number(aiMetrics.averageDifference || 0) >
    20
  ) {
    insights.push({
      type: "warning",
      title: "AI Score Difference",
      message:
        "AI scores differ significantly from instructor scores.",
    });
  }

  /* ======================
     RETURN
  ====================== */

  return {
    kpis: {
      totalAssessments:
        Number(kpis.totalAssessments || 0),

      studentsAttempted:
        Number(kpis.studentsAttempted || 0),

      averageScore:
        Number(kpis.averageScore || 0),

      highestScore:
        Number(kpis.highestScore || 0),

      lowestScore:
        Number(kpis.lowestScore || 0),

      passPercentage,

      failPercentage,

      pendingEvaluations:
        Number(kpis.pendingEvaluations || 0),
    },

    submissionTrend,

    averageScoreTrend,

    passFail,

    scoreDistribution: distribution,

    monthlyActivity,

    questionAnalytics,

    topStudents,

    attentionStudents,

    aiMetrics: {
      accuracy,
      confidence,
      avgAiScore:
        Number(aiMetrics.avgAiScore || 0),
      manualOverridePercentage,
      pendingAiReviews,
    },

    insights,
  };
};
/* =====================================================
   SINGLE ASSESSMENT ANALYTICS
===================================================== */

export const getAssessmentAnalytics = async (
  assessmentId,
  instructorId
) => {

  /* ======================
     VERIFY OWNERSHIP
  ====================== */

  const [[assessment]] = await pool.execute(
    `
    SELECT
      id,
      title,
      total_marks
    FROM assessments
    WHERE id = ?
      AND created_by = ?
    `,
    [assessmentId, instructorId]
  );

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  /* ======================
     KPI
  ====================== */

  const [[kpis]] = await pool.execute(
    `
    SELECT

      COUNT(DISTINCT s.student_id)
      AS studentsAttempted,

      ROUND(
        AVG(e.final_score),
        2
      ) AS averageScore,

      MAX(e.final_score)
      AS highestScore,

      MIN(e.final_score)
      AS lowestScore,

      SUM(
        CASE
        WHEN e.final_score >= (a.total_marks*0.40)
        THEN 1
        ELSE 0
        END
      ) AS passed,

      SUM(
        CASE
        WHEN e.final_score < (a.total_marks*0.40)
        THEN 1
        ELSE 0
        END
      ) AS failed,

      SUM(
        CASE
        WHEN s.status='submitted'
        THEN 1
        ELSE 0
        END
      ) AS pendingEvaluations

    FROM assessments a

    LEFT JOIN submissions s
      ON a.id=s.assessment_id

    LEFT JOIN evaluations e
      ON s.id=e.submission_id

    WHERE a.id=?
    `,
    [assessmentId]
  );

  const total =
    Number(kpis.passed || 0) +
    Number(kpis.failed || 0);

  const passPercentage =
    total === 0
      ? 0
      : Number(
          (
            (kpis.passed / total) *
            100
          ).toFixed(2)
        );

  const failPercentage =
    total === 0
      ? 0
      : Number(
          (
            (kpis.failed / total) *
            100
          ).toFixed(2)
        );

  /* ======================
     SUBMISSION TREND
  ====================== */

  const [submissionTrend] =
    await pool.execute(
      `
      SELECT
        DATE(submitted_at) AS date,
        COUNT(*) AS submissions
      FROM submissions
      WHERE assessment_id=?
      GROUP BY DATE(submitted_at)
      ORDER BY DATE(submitted_at)
      `,
      [assessmentId]
    );

  /* ======================
     SCORE TREND
  ====================== */

  const [averageScoreTrend] =
    await pool.execute(
      `
      SELECT

        DATE(s.submitted_at) AS date,

        ROUND(
          AVG(e.final_score),
          2
        ) AS average

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id=s.id

      WHERE s.assessment_id=?

      GROUP BY DATE(s.submitted_at)

      ORDER BY DATE(s.submitted_at)
      `,
      [assessmentId]
    );

  /* ======================
     PASS FAIL
  ====================== */

  const passFail = [
    {
      name: "Pass",
      value: Number(kpis.passed || 0),
    },
    {
      name: "Fail",
      value: Number(kpis.failed || 0),
    },
  ];

  /* ======================
     SCORE DISTRIBUTION
  ====================== */

  const [distribution] =
    await pool.execute(
      `
      SELECT

      CASE

      WHEN final_score<20 THEN '0-20'

      WHEN final_score<40 THEN '21-40'

      WHEN final_score<60 THEN '41-60'

      WHEN final_score<80 THEN '61-80'

      ELSE '81-100'

      END AS scoreRange,

      COUNT(*) AS count

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id=s.id

      WHERE s.assessment_id=?

      GROUP BY scoreRange
      `,
      [assessmentId]
    );
      /* ======================
     QUESTION ANALYTICS
  ====================== */

  const [questionAnalytics] =
    await pool.execute(
      `
      SELECT

        q.id,

        q.question,

        q.question_type,

        q.marks,

        COUNT(ans.id) AS attempts,

        ROUND(
          AVG(ans.marks_awarded),
          2
        ) AS averageMarks

      FROM questions q

      LEFT JOIN answers ans

      ON q.id = ans.question_id

      WHERE q.assessment_id = ?

      GROUP BY q.id

      ORDER BY q.id
      `,
      [assessmentId]
    );

  /* ======================
     TOP PERFORMING STUDENTS
  ====================== */

  const [topStudents] =
    await pool.execute(
      `
      SELECT

        u.id,

        u.name,

        u.email,

        e.final_score,

        e.feedback

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id = s.id

      INNER JOIN users u

      ON s.student_id = u.id

      WHERE s.assessment_id = ?

      ORDER BY e.final_score DESC

      LIMIT 10
      `,
      [assessmentId]
    );

  /* ======================
     STUDENTS NEEDING ATTENTION
  ====================== */

  const [attentionStudents] =
    await pool.execute(
      `
      SELECT

        u.id,

        u.name,

        u.email,

        e.final_score,

        e.feedback

      FROM evaluations e

      INNER JOIN submissions s

      ON e.submission_id = s.id

      INNER JOIN users u

      ON s.student_id = u.id

      WHERE s.assessment_id = ?

      AND e.final_score <
      (
        SELECT total_marks * 0.40
        FROM assessments
        WHERE id = ?
      )

      ORDER BY e.final_score ASC

      LIMIT 10
      `,
      [assessmentId, assessmentId]
    );

  /* ======================
     AI ANALYTICS
  ====================== */

  const [[aiMetrics]] =
    await pool.execute(
      `
      SELECT

        ROUND(
          AVG(ai.ai_score),
          2
        ) AS avgAiScore,

        COUNT(ai.id)
        AS totalAiEvaluations,

        ROUND(
          AVG(
            ABS(
              ai.ai_score -
              e.final_score
            )
          ),
          2
        ) AS averageDifference

      FROM ai_feedback ai

      INNER JOIN submissions s

      ON ai.submission_id = s.id

      LEFT JOIN evaluations e

      ON s.id = e.submission_id

      WHERE s.assessment_id = ?
      `,
      [assessmentId]
    );

  const accuracy =
    aiMetrics.averageDifference == null
      ? 0
      : Number(
          Math.max(
            0,
            (
              100 -
              aiMetrics.averageDifference
            ).toFixed(2)
          )
        );

  const confidence =
    accuracy >= 95
      ? 98
      : accuracy >= 90
      ? 95
      : accuracy >= 80
      ? 90
      : accuracy >= 70
      ? 85
      : 75;

  const pendingAiReviews =
    Number(
      kpis.pendingEvaluations || 0
    );

  const manualOverridePercentage =
    aiMetrics.totalAiEvaluations > 0
      ? Number(
          (
            aiMetrics.averageDifference
          ).toFixed(2)
        )
      : 0;

  /* ======================
     SMART INSIGHTS
  ====================== */

  const insights = [];

  if (passPercentage >= 80) {
    insights.push({
      type: "success",
      title: "Excellent Performance",
      message:
        "Most students successfully passed this assessment."
    });
  }

  if (failPercentage >= 40) {
    insights.push({
      type: "warning",
      title: "High Failure Rate",
      message:
        "A significant number of students failed this assessment."
    });
  }

  if (
    Number(kpis.pendingEvaluations || 0) > 0
  ) {
    insights.push({
      type: "info",
      title: "Pending Evaluation",
      message:
        `${kpis.pendingEvaluations} submissions are still waiting for evaluation.`
    });
  }

  if (
    Number(aiMetrics.averageDifference || 0) > 20
  ) {
    insights.push({
      type: "warning",
      title: "AI vs Instructor Difference",
      message:
        "AI evaluation differs considerably from instructor grading."
    });
  }

  /* ======================
     RETURN
  ====================== */

  return {

    assessment,

    kpis: {
      studentsAttempted:
        Number(kpis.studentsAttempted || 0),

      averageScore:
        Number(kpis.averageScore || 0),

      highestScore:
        Number(kpis.highestScore || 0),

      lowestScore:
        Number(kpis.lowestScore || 0),

      passPercentage,

      failPercentage,

      pendingEvaluations:
        Number(kpis.pendingEvaluations || 0),
    },

    submissionTrend,

    averageScoreTrend,

    passFail,

    scoreDistribution: distribution,

    questionAnalytics,

    topStudents,

    attentionStudents,

    aiMetrics: {
      accuracy,
      confidence,
      avgAiScore:
        Number(aiMetrics.avgAiScore || 0),
      manualOverridePercentage,
      pendingAiReviews,
    },

    insights,
  };
};