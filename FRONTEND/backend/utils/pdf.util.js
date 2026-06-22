import fs from "fs";
import Tesseract from "tesseract.js";

/*
=====================================================
PDF TEXT EXTRACTION — STRING ONLY (LOCKED)
=====================================================
✔ Always returns STRING
✔ OCR fallback
✔ Node 24 safe
*/

async function extractWithOCR(filePath) {
  console.log("🔎 OCR fallback started...");
  const { data } = await Tesseract.recognize(filePath, "eng");
  return String(data.text || "")
    .replace(/\s+/g, " ")
    .trim();
}

export const extractTextFromPDF = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("PDF file not found");
  }

  let text = "";

  try {
    const buffer = fs.readFileSync(filePath);

    // Raw text attempt (works for text-based PDFs)
    text = buffer
      .toString("utf8")
      .replace(/\0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    text = "";
  }

  // Remove junk metadata
  text = text.replace(
    /(university|faculty|department|college|isbn|author|acknowledgement|preface)/gi,
    ""
  );

  // OCR fallback
  if (!text || text.length < 300) {
    text = await extractWithOCR(filePath);
  }

  // 🔒 GUARANTEE STRING
  return String(text || "").trim();
};