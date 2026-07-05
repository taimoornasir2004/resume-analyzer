import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildFeedbackPrompt } from "../shared/promptBuilders.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI not configured. Set GEMINI_API_KEY in Vercel project settings." });
  }

  const { resumeText, ruleBasedAnalysis, jdMatch } = req.body || {};
  if (!resumeText || !ruleBasedAnalysis) {
    return res.status(400).json({ error: "resumeText and ruleBasedAnalysis are required." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
    const prompt = buildFeedbackPrompt(resumeText, ruleBasedAnalysis, jdMatch);
    const result = await model.generateContent(prompt);
    res.status(200).json({ feedback: result.response.text() });
  } catch (err) {
    console.error("Gemini feedback error:", err.message);
    res.status(502).json({ error: "AI request failed. Falling back to rule-based feedback." });
  }
}
