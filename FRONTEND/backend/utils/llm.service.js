import fetch from "node-fetch";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

export async function callLLM(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Accept-Encoding": "identity"
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0,
        top_p: 1,
        num_predict: 800
      }
    })
  });

  const raw = await res.text();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("❌ RAW OLLAMA:", raw);
    throw new Error("Ollama returned invalid JSON envelope");
  }

  if (!parsed.response || typeof parsed.response !== "string") {
    throw new Error("Empty Ollama response");
  }

  return parsed.response.trim();
}