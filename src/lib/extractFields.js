// Best-effort structured field extraction from raw resume text.
// Resumes vary wildly in layout, so this uses heuristics (section headers,
// line position, common separators) rather than guaranteeing perfect
// parsing — treat the output as "extracted, please verify" not ground truth.

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;
const LINKEDIN_RE = /(linkedin\.com\/in\/[a-z0-9-_%]+)/i;
const GITHUB_RE = /(github\.com\/[a-z0-9-_%]+)/i;

const SECTION_HEADERS = {
  summary: /^(summary|objective|profile)\s*$/i,
  experience: /^(experience|employment|work experience|work history)\s*$/i,
  education: /^(education|academic background)\s*$/i,
  skills: /^(skills|technical skills|core competenc(y|ies))\s*$/i,
  projects: /^(projects?)\s*$/i,
};

function splitLines(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Groups lines into { header: string|null, lines: [] } blocks by detected section headers. */
function splitIntoSections(lines) {
  const blocks = [{ header: null, lines: [] }];
  for (const line of lines) {
    const matchedKey = Object.entries(SECTION_HEADERS).find(([, re]) => re.test(line));
    if (matchedKey) {
      blocks.push({ header: matchedKey[0], lines: [] });
    } else {
      blocks[blocks.length - 1].lines.push(line);
    }
  }
  return blocks;
}

function guessName(lines) {
  // Look at the first few lines; the name is usually the first line that
  // isn't an email/phone/link and isn't ALL CAPS section-header-like noise.
  for (const line of lines.slice(0, 5)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line)) continue;
    if (line.length > 45) continue;
    if (/^(resume|cv|curriculum vitae)$/i.test(line)) continue;
    const wordCount = line.split(/\s+/).length;
    if (wordCount >= 1 && wordCount <= 5) return line;
  }
  return null;
}

function extractSkillsList(sectionLines) {
  const joined = sectionLines.join(", ");
  return joined
    .split(/[,•|·\u2022\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);
}

function extractEducationEntries(sectionLines) {
  const entries = [];
  let current = [];
  for (const line of sectionLines) {
    if (/\b(19|20)\d{2}\b/.test(line) && current.length) {
      current.push(line);
      entries.push(current.join(" — "));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) entries.push(current.join(" — "));
  return entries.filter(Boolean).slice(0, 8);
}

function extractExperienceEntries(sectionLines) {
  // Group into blocks: a new entry usually starts at a line containing a
  // year range or " - " separating a title/company, following a blank-ish
  // structural break. Since we've already stripped blank lines, use year
  // patterns as anchors.
  const entries = [];
  let current = [];
  for (const line of sectionLines) {
    const looksLikeHeader = /\b(19|20)\d{2}\b.*(present|\d{4})?/i.test(line) && line.length < 90;
    if (looksLikeHeader && current.length) {
      entries.push(current.join(" "));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) entries.push(current.join(" "));
  return entries.slice(0, 10);
}

export function extractStructuredData(rawText) {
  const lines = splitLines(rawText);
  const fullText = rawText;

  const emailMatch = fullText.match(EMAIL_RE);
  const phoneMatch = fullText.match(PHONE_RE);
  const linkedinMatch = fullText.match(LINKEDIN_RE);
  const githubMatch = fullText.match(GITHUB_RE);

  const sections = splitIntoSections(lines);
  const getSection = (key) => sections.find((b) => b.header === key)?.lines || [];

  const skills = extractSkillsList(getSection("skills"));
  const education = extractEducationEntries(getSection("education"));
  const experience = extractExperienceEntries(getSection("experience"));
  const summaryLines = getSection("summary");

  return {
    name: guessName(lines),
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    linkedin: linkedinMatch ? linkedinMatch[0] : null,
    github: githubMatch ? githubMatch[0] : null,
    summary: summaryLines.join(" ").slice(0, 400) || null,
    skills: skills.slice(0, 25),
    education,
    experience,
  };
}
