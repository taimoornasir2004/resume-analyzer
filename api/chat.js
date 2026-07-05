import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildChatSystemContext } from "../shared/promptBuilders.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI not configured. Set GEMINI_API_KEY in Vercel project settings." });
  }

  const { question, ruleBasedAnalysis, jdMatch, history = [] } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: "question is required." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemContext = buildChatSystemContext(ruleBasedAnalysis, jdMatch);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: systemContext,
    });

    const chatHistory = history.slice(-6).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(question);
    res.status(200).json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini chat error:", err.message);
    res.status(502).json({ error: "AI request failed. Falling back to rule-based reply." });
  }
}
