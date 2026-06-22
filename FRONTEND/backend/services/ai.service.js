import fs from "fs";
import path from "path";
import pool from "../config/db.js";
import { extractTextFromPDF } from "../utils/pdf.util.js";
import { callGemini } from "../utils/gemini.service.js";

/*
=====================================================
AI QUESTION GENERATION — FINAL (COUNT ENFORCED)
=====================================================
✔ Builder-driven (question_config)
✔ MCQ count enforced
✔ Descriptive count enforced PER MARK
✔ Subject + topics locked
✔ PDF used only as reference
✔ Single Gemini call
✔ Transaction safe
✔ Exam/Viva safe
=====================================================
*/

function extractStrictJSON(text) {
  if (!text) throw new Error("Empty AI response");

  text = text.replace(/```json|```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No valid JSON found in AI response");
  }

  return text.slice(first, last + 1);
}

/* =====================================================
   GENERATE AI QUESTIONS
===================================================== */
export const generateQuestionsForAssessment = async (assessmentId) => {
  console.log("🧠 AI generation started:", assessmentId);

  /* ======================
     1️⃣ FETCH ASSESSMENT
  ====================== */
  const [[assessment]] = await pool.execute(
    `
    SELECT subject, syllabus_topics, syllabus_path, question_config
    FROM assessments
    WHERE id = ?
    `,
    [assessmentId]
  );

  if (!assessment) throw new Error("Assessment not found");
  if (!assessment.subject) throw new Error("Subject not set");
  if (!assessment.syllabus_topics) throw new Error("Syllabus topics missing");

  /* ======================
     2️⃣ PARSE CONFIG
  ====================== */
  let qc;
  try {
    qc =
      typeof assessment.question_config === "string"
        ? JSON.parse(assessment.question_config)
        : assessment.question_config;
  } catch {
    throw new Error("Invalid question_config JSON");
  }

  const mode = qc.mode || "MIXED";

  const mcqCount =
    mode !== "DESCRIPTIVE" ? Number(qc?.mcq?.count || 0) : 0;
  const mcqMarks = Number(qc?.mcq?.marks_each || 1);

  const descLimits =
    mode !== "OBJECTIVE"
      ? {
          2: Number(qc?.descriptive?.[2] || 0),
          5: Number(qc?.descriptive?.[5] || 0),
          10: Number(qc?.descriptive?.[10] || 0),
          15: Number(qc?.descriptive?.[15] || 0),
        }
      : { 2: 0, 5: 0, 10: 0, 15: 0 };

  if (
    mcqCount +
      descLimits[2] +
      descLimits[5] +
      descLimits[10] +
      descLimits[15] ===
    0
  ) {
    throw new Error("No questions configured");
  }

  /* ======================
     3️⃣ PARSE TOPICS
  ====================== */
  let topics;
  try {
    topics =
      typeof assessment.syllabus_topics === "string"
        ? JSON.parse(assessment.syllabus_topics)
        : assessment.syllabus_topics;
  } catch {
    throw new Error("Invalid syllabus_topics JSON");
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error("Empty syllabus topics");
  }

  /* ======================
     4️⃣ OPTIONAL PDF
  ====================== */
  let pdfContext = "";
  if (assessment.syllabus_path) {
    const p = path.resolve(assessment.syllabus_path);
    if (fs.existsSync(p)) {
      pdfContext = String(await extractTextFromPDF(p))
        .replace(/\s+/g, " ")
        .slice(0, 3000);
    }
  }

  /* ======================
     5️⃣ PROMPT
  ====================== */
  const tasks = [
    mcqCount > 0
      ? `- Generate EXACTLY ${mcqCount} MCQs (${mcqMarks} mark each)`
      : "",
    descLimits[2] > 0
      ? `- Generate EXACTLY ${descLimits[2]} descriptive questions of 2 marks`
      : "",
    descLimits[5] > 0
      ? `- Generate EXACTLY ${descLimits[5]} descriptive questions of 5 marks`
      : "",
    descLimits[10] > 0
      ? `- Generate EXACTLY ${descLimits[10]} descriptive questions of 10 marks`
      : "",
    descLimits[15] > 0
      ? `- Generate EXACTLY ${descLimits[15]} descriptive questions of 15 marks`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `
YOU ARE A UNIVERSITY EXAM QUESTION SETTER.

SUBJECT:
${assessment.subject}

SYLLABUS TOPICS:
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

RETURN JSON ONLY:
{
  "mcq": [],
  "descriptive": []
}

TASK:
${tasks}

MCQ RULES:
- 4 options
- A, B, C, D
- correct_option must be A/B/C/D

REFERENCE (OPTIONAL):
"""
${pdfContext}
"""
`.trim();

  /* ======================
     6️⃣ AI CALL
  ====================== */
  const llmText = await callGemini(prompt);
  console.log("🧠 RAW AI RESPONSE:\n", llmText);

  let parsed;
  try {
    parsed = JSON.parse(extractStrictJSON(llmText));
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!Array.isArray(parsed.mcq) || !Array.isArray(parsed.descriptive)) {
    throw new Error("Wrong AI JSON structure");
  }

  if (mcqCount > 0 && parsed.mcq.length === 0) {
    throw new Error("AI failed to generate MCQs");
  }

  /* ======================
     7️⃣ TRANSACTION
  ====================== */
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  let mcqInserted = 0;
  let descInserted = 0;

  try {
    await conn.execute(
      "DELETE FROM ai_questions WHERE assessment_id = ?",
      [assessmentId]
    );

    /* ---- MCQs ---- */
    for (const raw of parsed.mcq.slice(0, mcqCount)) {
      if (!raw?.question || !raw?.options || !raw?.correct_option) continue;

      let optionsArray;
      if (Array.isArray(raw.options)) {
        optionsArray = raw.options;
      } else if (typeof raw.options === "object") {
        optionsArray = [
          raw.options.A,
          raw.options.B,
          raw.options.C,
          raw.options.D,
        ];
      }

      if (!optionsArray || optionsArray.length !== 4) continue;
      if (!["A", "B", "C", "D"].includes(raw.correct_option)) continue;

      await conn.execute(
        `
        INSERT INTO ai_questions
        (assessment_id, question, question_type, marks, options, correct_option)
        VALUES (?, ?, 'mcq', ?, ?, ?)
        `,
        [
          assessmentId,
          raw.question.slice(0, 500),
          mcqMarks,
          JSON.stringify(optionsArray),
          raw.correct_option,
        ]
      );

      mcqInserted++;
    }

    /* ---- DESCRIPTIVE ---- */
    const buckets = { 2: [], 5: [], 10: [], 15: [] };

    for (const q of parsed.descriptive) {
      if (buckets[q.marks]) buckets[q.marks].push(q);
    }

    for (const mark of [2, 5, 10, 15]) {
      for (const q of buckets[mark].slice(0, descLimits[mark])) {
        if (!q?.question) continue;

        await conn.execute(
          `
          INSERT INTO ai_questions
          (assessment_id, question, question_type, marks)
          VALUES (?, ?, 'descriptive', ?)
          `,
          [assessmentId, q.question.slice(0, 800), mark]
        );

        descInserted++;
      }
    }

    await conn.commit();
    console.log("✅ AI generation completed", {
      mcqInserted,
      descInserted,
    });

    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* =====================================================
   FETCH / APPROVE / REJECT
===================================================== */

export async function getAIQuestionsByAssessment(assessmentId) {
  const [rows] = await pool.execute(
    `
    SELECT id, question, question_type, marks, options, correct_option
    FROM ai_questions
    WHERE assessment_id = ?
    ORDER BY id ASC
    `,
    [assessmentId]
  );
  return rows;
}

export async function approveAIQuestion(
  aiQuestionId,
  { question_type, marks, options, correct_option }
) {
  const [[aiq]] = await pool.execute(
    "SELECT * FROM ai_questions WHERE id = ?",
    [aiQuestionId]
  );

  if (!aiq) throw new Error("AI question not found");

  await pool.execute(
    `
    INSERT INTO questions
    (assessment_id, question, question_type, marks, options, correct_option, source)
    VALUES (?, ?, ?, ?, ?, ?, 'AI')
    `,
    [
      aiq.assessment_id,
      aiq.question,
      question_type,
      marks,
      options ? JSON.stringify(options) : null,
      correct_option || null,
    ]
  );

  await pool.execute("DELETE FROM ai_questions WHERE id = ?", [aiQuestionId]);
  return true;
}

export async function rejectAIQuestion(aiQuestionId) {
  await pool.execute("DELETE FROM ai_questions WHERE id = ?", [aiQuestionId]);
  return true;
}