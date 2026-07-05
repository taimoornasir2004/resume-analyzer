import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(genAI) });
});

/**
 * POST /api/feedback
 * body: { resumeText, ruleBasedAnalysis, jdMatch? }
 * Returns AI-written qualitative feedback grounded in the rule-based scores.
 */
app.post("/api/feedback", async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: "AI not configured. Set GEMINI_API_KEY in .env." });
  }
  const { resumeText, ruleBasedAnalysis, jdMatch } = req.body;
  if (!resumeText || !ruleBasedAnalysis) {
    return res.status(400).json({ error: "resumeText and ruleBasedAnalysis are required." });
  }

  try {
    const prompt = buildFeedbackPrompt(resumeText, ruleBasedAnalysis, jdMatch);
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();
    res.json({ feedback: text });
  } catch (err) {
    console.error("Gemini feedback error:", err.message);
    res.status(502).json({ error: "AI request failed. Falling back to rule-based feedback." });
  }
});

/**
 * POST /api/chat
 * body: { question, ruleBasedAnalysis, jdMatch?, history? }
 * Returns a real LLM chatbot reply grounded in the resume analysis.
 */
app.post("/api/chat", async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: "AI not configured. Set GEMINI_API_KEY in .env." });
  }
  const { question, ruleBasedAnalysis, jdMatch, history = [] } = req.body;
  if (!question) {
    return res.status(400).json({ error: "question is required." });
  }

  try {
    const systemContext = buildChatSystemContext(ruleBasedAnalysis, jdMatch);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: systemContext });

    const chatHistory = history.slice(-6).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(question);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini chat error:", err.message);
    res.status(502).json({ error: "AI request failed. Falling back to rule-based reply." });
  }
});

function buildFeedbackPrompt(resumeText, analysis, jdMatch) {
  return [
    "You are a career coach reviewing a resume. Be specific, encouraging but honest, and concrete.",
    "Here is a rule-based analysis already computed for this resume:",
    JSON.stringify(analysis, null, 2),
    jdMatch ? `\nJob description keyword match data:\n${JSON.stringify(jdMatch, null, 2)}` : "",
    "\nHere is the raw resume text:\n---\n" + resumeText.slice(0, 6000) + "\n---",
    "\nWrite 3-5 short, specific, personalized improvement suggestions referencing actual content from the resume. Keep it under 200 words. Do not just repeat the scores back.",
  ].join("\n");
}

function buildChatSystemContext(analysis, jdMatch) {
  return [
    "You are a helpful, concise resume-improvement assistant embedded in a web app.",
    "Ground every answer in the data below — don't invent details about the resume you weren't given.",
    `Rule-based analysis: ${JSON.stringify(analysis)}`,
    jdMatch ? `Job description match data: ${JSON.stringify(jdMatch)}` : "No job description has been provided yet.",
    "Answer in 2-4 sentences unless the user asks for more detail.",
  ].join("\n");
}

app.listen(PORT, () => {
  console.log(`Resume Analyzer API listening on http://localhost:${PORT}`);
  console.log(genAI ? "✔ Gemini API configured" : "⚠ No GEMINI_API_KEY set — /api routes will return 503");
});
