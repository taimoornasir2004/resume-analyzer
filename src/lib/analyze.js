// Rule-based resume analysis engine.
// No external AI call is required to run — everything here is deterministic
// text analysis, so the analyzer works fully offline. See chatbot.js for
// where a real LLM call would slot in if an API key is configured.

const SECTION_PATTERNS = {
  contact: /email|phone|linkedin|github|portfolio/i,
  summary: /\b(summary|objective|profile)\b/i,
  experience: /\b(experience|employment|work history)\b/i,
  education: /\b(education|academic|degree|university|college)\b/i,
  skills: /\b(skills|technical skills|competenc(y|ies))\b/i,
  projects: /\b(projects?)\b/i,
};

const ACTION_VERBS = [
  "led", "built", "designed", "developed", "implemented", "created",
  "managed", "improved", "increased", "reduced", "launched", "optimized",
  "architected", "automated", "delivered", "spearheaded", "coordinated",
  "analyzed", "streamlined", "engineered", "mentored", "negotiated",
  "restructured", "achieved", "resolved", "initiated",
];

const WEAK_PHRASES = [
  "responsible for", "duties included", "worked on", "helped with",
  "tasked with", "in charge of",
];

const STOPWORDS = new Set(
  ("a about above after again against all am an and any are aren't as at be " +
    "because been before being below between both but by can't cannot could " +
    "couldn't did didn't do does doesn't doing don't down during each few for " +
    "from further had hadn't has hasn't have haven't having he he'd he'll " +
    "he's her here here's hers herself him himself his how how's i i'd i'll " +
    "i'm i've if in into is isn't it it's its itself let's me more most " +
    "mustn't my myself no nor not of off on once only or other ought our " +
    "ours ourselves out over own same shan't she she'd she'll she's should " +
    "shouldn't so some such than that that's the their theirs them " +
    "themselves then there there's these they they'd they'll they're " +
    "they've this those through to too under until up very was wasn't we " +
    "we'd we'll we're we've were weren't what what's when when's where " +
    "where's which while who who's whom why why's with won't would " +
    "wouldn't you you'd you'll you're you've your yours yourself yourselves " +
    "and/or etc using use used via per new strong excellent").split(" ")
);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z+.#-]{1,}/g) || []).filter(
    (w) => !STOPWORDS.has(w) && w.length > 1
  );
}

function findKeywords(text, limit = 40) {
  const counts = new Map();
  for (const word of tokenize(text)) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function detectSections(text) {
  const found = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    found[key] = pattern.test(text);
  }
  return found;
}

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce((n, p) => n + (lower.includes(p) ? 1 : 0), 0);
}

function countQuantifiedBullets(text) {
  // lines containing a number, percentage, or currency symbol next to a metric
  const lines = text.split(/\n+/);
  return lines.filter((l) => /\d/.test(l) && l.trim().length > 0).length;
}

function hasEmail(text) {
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
}

function hasPhone(text) {
  return /(\+?\d[\d\s().-]{8,}\d)/.test(text);
}

function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

/**
 * Core analysis: returns a score breakdown + actionable feedback,
 * independent of any job description.
 */
export function analyzeResume(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const sections = detectSections(text);
  const wc = wordCount(text);
  const actionVerbCount = countMatches(text, ACTION_VERBS);
  const weakPhraseCount = countMatches(text, WEAK_PHRASES);
  const quantified = countQuantifiedBullets(rawText);
  const emailPresent = hasEmail(text);
  const phonePresent = hasPhone(text);

  const categories = [];

  // 1. Structure — key sections present
  const sectionKeys = ["summary", "experience", "education", "skills"];
  const sectionsFound = sectionKeys.filter((k) => sections[k]).length;
  categories.push({
    key: "structure",
    label: "Structure & Sections",
    score: Math.round((sectionsFound / sectionKeys.length) * 100),
    detail: `${sectionsFound}/${sectionKeys.length} core sections detected`,
    issues: sectionKeys
      .filter((k) => !sections[k])
      .map((k) => `Missing a clear "${k}" section`),
  });

  // 2. Contact info
  const contactScore = (emailPresent ? 60 : 0) + (phonePresent ? 40 : 0);
  categories.push({
    key: "contact",
    label: "Contact Information",
    score: contactScore,
    detail: `${emailPresent ? "Email found" : "No email found"}, ${
      phonePresent ? "phone found" : "no phone found"
    }`,
    issues: [
      ...(!emailPresent ? ["No email address detected"] : []),
      ...(!phonePresent ? ["No phone number detected"] : []),
    ],
  });

  // 3. Impact language — action verbs vs weak phrases
  const impactScore = Math.max(
    0,
    Math.min(100, actionVerbCount * 8 - weakPhraseCount * 12)
  );
  categories.push({
    key: "impact",
    label: "Impact Language",
    score: impactScore,
    detail: `${actionVerbCount} strong action verbs, ${weakPhraseCount} weak phrases`,
    issues: [
      ...(actionVerbCount < 5
        ? ["Use more strong action verbs (built, led, improved...)"]
        : []),
      ...(weakPhraseCount > 0
        ? [`Replace passive phrases like "responsible for" with direct verbs`]
        : []),
    ],
  });

  // 4. Quantified achievements
  const quantScore = Math.min(100, Math.round((quantified / 6) * 100));
  categories.push({
    key: "metrics",
    label: "Quantified Achievements",
    score: quantScore,
    detail: `${quantified} line(s) with numbers or metrics`,
    issues:
      quantified < 3
        ? ["Add measurable results — %, $, time saved, team size, etc."]
        : [],
  });

  // 5. Length
  let lengthScore;
  let lengthIssue = null;
  if (wc < 150) {
    lengthScore = 40;
    lengthIssue = "Resume looks very short — add more detail on your experience.";
  } else if (wc > 1100) {
    lengthScore = 55;
    lengthIssue = "Resume is quite long — aim for one page (~400-700 words) if early-career.";
  } else {
    lengthScore = 100;
  }
  categories.push({
    key: "length",
    label: "Length",
    score: lengthScore,
    detail: `${wc} words`,
    issues: lengthIssue ? [lengthIssue] : [],
  });

  const overall = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );

  const topKeywords = findKeywords(text, 25);

  return {
    overall,
    categories,
    topKeywords,
    stats: {
      wordCount: wc,
      actionVerbCount,
      weakPhraseCount,
      quantifiedLines: quantified,
      emailPresent,
      phonePresent,
      sections,
    },
  };
}

/**
 * Compares resume text against a job description: extracts JD keywords
 * and reports which appear / are missing in the resume.
 */
export function matchJobDescription(resumeText, jdText) {
  const jdKeywords = findKeywords(jdText, 30);
  const resumeLower = resumeText.toLowerCase();

  const matched = [];
  const missing = [];
  for (const kw of jdKeywords) {
    if (resumeLower.includes(kw)) matched.push(kw);
    else missing.push(kw);
  }

  const matchPercent =
    jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100);

  return { matchPercent, matched, missing, jdKeywords };
}
