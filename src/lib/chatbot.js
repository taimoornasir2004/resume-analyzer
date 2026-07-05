// Real-time resume advice chatbot.
//
// This runs entirely rule-based against the analysis object so the whole
// app works offline with zero API keys — good for a student project demo.
// To upgrade to a real LLM: send `buildPrompt(analysis, jdMatch, question)`
// as the user message to POST https://api.anthropic.com/v1/messages
// (model: "claude-sonnet-4-6") from a small backend that holds your API key,
// and stream `data.content[0].text` back to the chat panel instead of the
// string this file returns. Keep the rule-based version as a fallback if
// the request fails or no key is configured.

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = /\b(hi|hello|hey|salam|assalam)\b/i;
const THANKS = /\b(thanks|thank you|shukriya)\b/i;

export function buildPrompt(analysis, jdMatch, question) {
  return [
    `Resume overall score: ${analysis.overall}/100.`,
    `Category scores: ${analysis.categories
      .map((c) => `${c.label} ${c.score}`)
      .join(", ")}.`,
    jdMatch
      ? `Job description keyword match: ${jdMatch.matchPercent}%. Missing keywords: ${jdMatch.missing.slice(0, 10).join(", ")}.`
      : "No job description provided yet.",
    `Question: ${question}`,
  ].join("\n");
}

export function generateChatResponse(question, analysis, jdMatch) {
  const q = question.toLowerCase();

  if (GREETINGS.test(q)) {
    return "Hey! I've read through your resume. Ask me about your score, missing keywords, formatting, or how to phrase your experience bullets.";
  }
  if (THANKS.test(q)) {
    return "You're welcome — good luck with the applications!";
  }

  if (!analysis) {
    return "Upload a resume first and I'll be able to give specific, grounded feedback instead of generic tips.";
  }

  if (/score|rating|how (good|bad)/i.test(q)) {
    const worst = [...analysis.categories].sort((a, b) => a.score - b.score)[0];
    return `Your overall score is ${analysis.overall}/100. Your weakest area is "${worst.label}" at ${worst.score}/100 — ${
      worst.issues[0] || "keep it up there."
    }`;
  }

  if (/keyword|match|job description|jd\b/i.test(q)) {
    if (!jdMatch) {
      return "Paste a job description in the Job Match panel and I'll tell you exactly which keywords from that posting are missing from your resume.";
    }
    if (jdMatch.missing.length === 0) {
      return `Great alignment — your resume already covers the top keywords from that job description (${jdMatch.matchPercent}% match).`;
    }
    return `Your resume matches ${jdMatch.matchPercent}% of the top keywords in that job description. Consider weaving in: ${jdMatch.missing
      .slice(0, 6)
      .join(", ")}.`;
  }

  if (/verb|language|wording|phrase/i.test(q)) {
    const impact = analysis.categories.find((c) => c.key === "impact");
    return `You're using ${analysis.stats.actionVerbCount} strong action verbs${
      analysis.stats.weakPhraseCount
        ? ` but also ${analysis.stats.weakPhraseCount} weak phrase(s) like "responsible for"`
        : ""
    }. Try opening bullets with verbs like "led", "built", "reduced", or "automated" instead of describing duties passively.`;
  }

  if (/number|metric|quantif|result|achievement/i.test(q)) {
    return `${analysis.stats.quantifiedLines} of your lines currently include a number. Aim for most experience bullets to end with a measurable result — e.g. "cut load time by 40%" or "onboarded 12 new clients".`;
  }

  if (/length|long|short|page/i.test(q)) {
    const length = analysis.categories.find((c) => c.key === "length");
    return `Your resume is ${analysis.stats.wordCount} words. ${
      length.issues[0] || "That's a healthy length for one page."
    }`;
  }

  if (/section|structure|format|missing/i.test(q)) {
    const missing = analysis.categories.find((c) => c.key === "structure").issues;
    return missing.length
      ? `Your structure could be clearer — ${missing.join("; ")}.`
      : "Your section structure looks solid — summary, experience, education, and skills are all present.";
  }

  if (/contact|email|phone/i.test(q)) {
    return analysis.stats.emailPresent && analysis.stats.phonePresent
      ? "Your contact details look complete."
      : `Double check your header — ${
          !analysis.stats.emailPresent ? "I couldn't find an email address. " : ""
        }${!analysis.stats.phonePresent ? "I couldn't find a phone number." : ""}`;
  }

  return pick([
    `Based on your current score of ${analysis.overall}/100, focus first on your weakest category — check the breakdown panel above.`,
    "You can ask me things like: 'how's my score', 'what keywords am I missing', 'is my resume too long', or 'how are my action verbs'.",
    `Try adding measurable outcomes to your experience bullets — right now only ${analysis.stats.quantifiedLines} lines include numbers.`,
  ]);
}
