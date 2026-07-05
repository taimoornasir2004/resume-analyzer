// Shared between server/index.js (local dev via Express) and api/*.js
// (Vercel serverless functions used in production). Keeping this in one
// place means both environments generate identical prompts.

export function buildFeedbackPrompt(resumeText, analysis, jdMatch) {
  return [
    "You are a career coach reviewing a resume. Be specific, encouraging but honest, and concrete.",
    "Here is a rule-based analysis already computed for this resume:",
    JSON.stringify(analysis, null, 2),
    jdMatch ? `\nJob description keyword match data:\n${JSON.stringify(jdMatch, null, 2)}` : "",
    "\nHere is the raw resume text:\n---\n" + resumeText.slice(0, 6000) + "\n---",
    "\nWrite 3-5 short, specific, personalized improvement suggestions referencing actual content from the resume. Keep it under 200 words. Do not just repeat the scores back.",
  ].join("\n");
}

export function buildChatSystemContext(analysis, jdMatch) {
  return [
    "You are a helpful, concise resume-improvement assistant embedded in a web app.",
    "Ground every answer in the data below — don't invent details about the resume you weren't given.",
    `Rule-based analysis: ${JSON.stringify(analysis)}`,
    jdMatch ? `Job description match data: ${JSON.stringify(jdMatch)}` : "No job description has been provided yet.",
    "Answer in 2-4 sentences unless the user asks for more detail.",
  ].join("\n");
}
