import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/* ===============================
   QUESTION GENERATION MODEL
================================ */

const generationAI = new GoogleGenerativeAI(
  process.env.GEMINI_GENERATION_API_KEY
);

/* ===============================
   ANSWER EVALUATION MODEL
================================ */

const evaluationAI = new GoogleGenerativeAI(
  process.env.GEMINI_EVALUATION_API_KEY
);

/* ===============================
   QUESTION GENERATION
================================ */

export async function callGeminiGeneration(prompt) {
  const model = generationAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await model.generateContent(prompt);

  return result.response.text();
}

/* ===============================
   ANSWER EVALUATION
================================ */

export async function callGeminiEvaluation(prompt) {
  const model = evaluationAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await model.generateContent(prompt);

  return result.response.text();
}



console.log(
  "Generation Key:",
  process.env.GEMINI_GENERATION_API_KEY?.substring(0, 10)
);

console.log(
  "Evaluation Key:",
  process.env.GEMINI_EVALUATION_API_KEY?.substring(0, 10)
);