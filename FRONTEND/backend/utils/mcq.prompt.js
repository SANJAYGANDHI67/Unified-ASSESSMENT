// =====================================================
// LOCKED MCQ PROMPT BUILDER (UNIVERSITY-SAFE)
// =====================================================
// ✔ Exam-level MCQs
// ✔ Filters author / book / university metadata
// ✔ Strict JSON output
// ✔ NO parsing, NO API calls, NO DB logic
// =====================================================

export function buildMCQPrompt(syllabusText, count) {
  const safeCount =
    Number.isFinite(count) && count > 0 ? Math.floor(count) : 5;

  const trimmedSyllabus = (syllabusText || "").trim();

  return `
You are an expert university-level exam setter for technical and academic subjects.

IMPORTANT CONTEXT FILTERING (STRICT):
- IGNORE university or institution names
- IGNORE faculty names
- IGNORE author names
- IGNORE textbook titles
- IGNORE publisher details
- IGNORE ISBN numbers, editions, years
- IGNORE acknowledgements, preface, references, bibliography
- IGNORE page headers, footers, copyright text

USE ONLY:
- Core syllabus concepts
- Technical definitions, principles, mechanisms, processes
- Subject-matter knowledge suitable for exams

TASK:
- Generate exactly ${safeCount} exam-level multiple choice questions (MCQs)
- Questions must be directly derived from syllabus concepts
- Questions must test conceptual understanding, not memory of authors/books

MCQ RULES:
- Each MCQ must have exactly 4 options: A, B, C, D
- Exactly ONE correct option
- Options must be plausible and mutually exclusive
- Difficulty must be exam-appropriate (not trivial)

STRICT OUTPUT RULES:
- Output MUST be STRICT JSON only
- NO explanations
- NO numbering
- NO markdown
- NO text before or after JSON

OUTPUT FORMAT (EXACT):
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": "A"
  }
]

Generate MCQs ONLY from the syllabus content below
(after applying the filtering rules above):

---
${trimmedSyllabus}
---
`.trim();
}