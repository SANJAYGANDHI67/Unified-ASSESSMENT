import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

export async function callGemini(prompt) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const response = result.response;

  if (!response || !response.text) {
    throw new Error("Empty Gemini response");
  }

  return response.text().trim();
}