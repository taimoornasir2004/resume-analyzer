# AI-Powered Resume Analyzer

A React + Vite app that parses PDF/DOCX resumes entirely in the browser,
extracts structured fields, scores the resume against best-practice rules,
compares it to a pasted job description, and gives real-time improvement
advice — with genuine LLM-generated feedback via Google's free Gemini API.

## Features
- **Resume upload & parsing** — PDF (pdfjs-dist) and DOCX (mammoth), parsed client-side.
- **Structured data extraction** — name, email, phone, LinkedIn/GitHub, skills list, education entries, and experience entries pulled into a structured object (see `src/lib/extractFields.js`). Heuristic/best-effort, since resume layouts vary.
- **AI-powered analysis** — two layers:
  1. A deterministic rule-based scoring engine (`src/lib/analyze.js`) that always works offline: structure, contact info, impact language, quantified achievements, length.
  2. Real language-model feedback (`server/index.js` + Gemini API) that reads the rule-based results and the resume text and writes personalized suggestions. Falls back gracefully to rule-based-only if no API key is set.
- **Keyword matching** — paste a job description to see matched vs. missing top keywords.
- **AI chatbot** — answers resume questions in real time. Uses the live Gemini API when configured; otherwise answers from the rule-based logic in `src/lib/chatbot.js`. Either way it's grounded in your actual resume analysis, not generic advice.

## Project structure
```
src/
  lib/
    parseResume.js      # PDF/DOCX -> raw text
    extractFields.js    # raw text -> structured fields
    analyze.js           # rule-based scoring + keyword extraction
    chatbot.js           # rule-based chatbot fallback
    aiClient.js          # frontend -> backend AI calls
  components/            # UI panels
server/
  index.js               # Express API: /api/feedback, /api/chat, /api/health
```

## Running it

### 1. Frontend only (rule-based mode, no API key needed)
```bash
npm install
npm run dev
```
Everything works — scoring, keyword match, structured data, and the chatbot
all run rule-based. The UI will show "rule-based" next to the chatbot.

### 2. With real AI (frontend + backend) — free Gemini key
1. Go to https://aistudio.google.com/app/apikey and click "Create API key".
   No credit card required — Gemini's free tier covers this project easily.
2. Copy `.env.example` to `.env` in the project root and add your key:
   ```
   GEMINI_API_KEY=your_free_key_here
   GEMINI_MODEL=gemini-2.5-flash
   PORT=5000
   ```
   Note: `gemini-2.0-flash` was deprecated in March 2026 and has zero free-tier
   quota now — use `gemini-2.5-flash` or `gemini-2.5-flash-lite` (higher
   free-tier rate limits) instead. If you hit a 429 "quota exceeded" error,
   check https://ai.google.dev/gemini-api/docs/rate-limits for the current
   free-tier model list, since Google updates this periodically.
3. Run both servers together:
   ```bash
   npm run dev:full
   ```
   (or separately: `npm run server` and `npm run dev` in two terminals)

The Vite dev server proxies `/api/*` to the Express backend (see
`vite.config.js`). Once the backend reports `aiConfigured: true`, the AI
Feedback panel and chatbot automatically switch from rule-based to live
Gemini responses — no frontend code changes needed.

## Build
```bash
npm run build
npm run preview
```
Note: production hosting needs the Express backend deployed separately
(or converted to serverless functions) if you want live AI in production —
`vite build` only builds the static frontend.

## Tech stack
React 19, Vite, Tailwind CSS v4, recharts, lucide-react, pdfjs-dist,
mammoth, Express, @google/generative-ai (Gemini)
