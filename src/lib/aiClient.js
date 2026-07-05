// Talks to the Express + Gemini backend for real AI-generated feedback
// and chat replies. If the backend isn't running or no API key is
// configured, every function here throws — callers should catch and fall
// back to the rule-based logic in analyze.js / chatbot.js so the app never
// breaks for users who haven't set up an API key.

let aiAvailable = null; // cached health check result

export async function checkAIAvailable() {
  if (aiAvailable !== null) return aiAvailable;
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    aiAvailable = Boolean(data.aiConfigured);
  } catch {
    aiAvailable = false;
  }
  return aiAvailable;
}

export async function getAIFeedback(resumeText, ruleBasedAnalysis, jdMatch) {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, ruleBasedAnalysis, jdMatch }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "AI feedback request failed");
  }
  const data = await res.json();
  return data.feedback;
}

export async function getAIChatReply(question, ruleBasedAnalysis, jdMatch, history) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, ruleBasedAnalysis, jdMatch, history }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "AI chat request failed");
  }
  const data = await res.json();
  return data.reply;
}
