/*
=====================================================
SIMPLE TEXT CHUNKER + FALLBACK QUESTION LOGIC
=====================================================
✔ Safe
✔ No AI
✔ No dependencies
*/

export const chunkText = (text, maxLength = 1200) => {
  if (!text || typeof text !== "string") return [];

  const chunks = [];
  let current = "";

  const sentences = text
    .replace(/\s+/g, " ")
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current.trim());
      current = sentence + ". ";
    } else {
      current += sentence + ". ";
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
};

/* ----------------------------------------------
   OPTIONAL FALLBACK DESCRIPTIVE GENERATOR
---------------------------------------------- */
export const generateQuestionsFromText = (text, limit = 10) => {
  if (!text || typeof text !== "string") return [];

  const sentences = text
    .replace(/\s+/g, " ")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 40);

  const starters = [
    "Explain",
    "Describe",
    "Discuss",
    "Write short notes on",
  ];

  const questions = [];
  const used = new Set();

  for (let i = 0; i < sentences.length && questions.length < limit; i++) {
    const sentence = sentences[i];
    if (used.has(sentence)) continue;

    used.add(sentence);
    const starter = starters[i % starters.length];

    questions.push(`${starter} ${sentence}.`);
  }

  return questions;
};