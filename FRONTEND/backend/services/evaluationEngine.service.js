import { callGeminiEvaluation } from "../utils/gemini.service.js";

export const evaluateMCQ = (questions) => {
  let totalScore = 0;

  const evaluated = questions.map((q) => {
    if (q.question_type !== "mcq") {
      return q;
    }

    const isCorrect =
      String(q.student_answer).trim() ===
      String(q.correct_option).trim();

    const awardedMarks = isCorrect ? q.marks : 0;

    totalScore += awardedMarks;

    return {
      ...q,
      is_correct: isCorrect,
      awarded_marks: awardedMarks,
    };
  });

  return {
    totalScore,
    questions: evaluated,
  };
};

export async function evaluateDescriptiveAnswer({
  question,
  referenceAnswer,
  studentAnswer,
  maxMarks,
}) {
  const prompt = `
You are an exam evaluator.

Question:
${question}

Reference Answer:
${referenceAnswer}

Student Answer:
${studentAnswer}

Maximum Marks:
${maxMarks}

Evaluate the student's answer.

Return ONLY valid JSON.

{
  "score": number,
  "feedback": "short feedback"
}
`;

  

const response = await callGeminiEvaluation(prompt);

// Remove markdown code fences if present
const cleaned = response
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(cleaned);
}