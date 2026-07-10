import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL,
    });

    const result = await model.generateContent("Say Hello");

    console.log("✅ Gemini API is working!");
    console.log(result.response.text());

  } catch (err) {
    console.error("❌ Gemini API failed");
    console.error(err.message);
  }
}

testGemini();