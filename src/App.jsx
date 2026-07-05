import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import Hero from "./components/Hero";
import UploadZone from "./components/UploadZone";
import ScorePanel from "./components/ScorePanel";
import JobMatch from "./components/JobMatch";
import Chatbot from "./components/Chatbot";
import StructuredData from "./components/StructuredData";
import AIFeedback from "./components/AIFeedback";
import { extractTextFromFile } from "./lib/parseResume";
import { analyzeResume, matchJobDescription } from "./lib/analyze";
import { extractStructuredData } from "./lib/extractFields";
import { checkAIAvailable, getAIFeedback } from "./lib/aiClient";

export default function App() {
  const [fileName, setFileName] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | parsing | done | error
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [jdMatch, setJdMatch] = useState(null);

  const [aiOn, setAiOn] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    checkAIAvailable().then(setAiOn);
  }, []);

  async function requestAIFeedback(text, ruleBasedAnalysis, jd) {
    setAiLoading(true);
    setAiError(null);
    try {
      const feedback = await getAIFeedback(text, ruleBasedAnalysis, jd);
      setAiFeedback(feedback);
    } catch (err) {
      setAiFeedback(null);
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFile(file) {
    setError(null);
    setFileName(file.name);
    setStatus("parsing");
    setAnalysis(null);
    setStructuredData(null);
    setJdMatch(null);
    setAiFeedback(null);
    setAiError(null);
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      const ruleBasedAnalysis = analyzeResume(text);
      setAnalysis(ruleBasedAnalysis);
      setStructuredData(extractStructuredData(text));
      setStatus("done");

      if (aiOn) requestAIFeedback(text, ruleBasedAnalysis, null);
    } catch (err) {
      setError(err.message || "Something went wrong while reading that file.");
      setStatus("error");
    }
  }

  function handleClear() {
    setFileName(null);
    setStatus("idle");
    setError(null);
    setResumeText(null);
    setAnalysis(null);
    setStructuredData(null);
    setJdMatch(null);
    setAiFeedback(null);
    setAiError(null);
  }

  function handleJdAnalyze(jdText) {
    if (!resumeText || !jdText.trim()) return;
    const match = matchJobDescription(resumeText, jdText);
    setJdMatch(match);
    if (aiOn) requestAIFeedback(resumeText, analysis, match);
  }

  return (
    <div className="min-h-screen">
      <header
        className="border-b sticky top-0 z-10 backdrop-blur"
        style={{ borderColor: "var(--color-border-soft)", background: "#0f1417cc" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2">
          <ScanLine size={18} style={{ color: "var(--color-scan)" }} />
          <span className="font-display font-medium">Resume Analyzer</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <Hero />

        <section className="pb-10">
          <UploadZone
            onFile={handleFile}
            fileName={fileName}
            status={status}
            error={error}
            onClear={handleClear}
          />
        </section>

        {analysis && (
          <section className="grid md:grid-cols-2 gap-6 pb-16">
            <div className="space-y-6">
              <ScorePanel analysis={analysis} />
              <AIFeedback
                feedback={aiFeedback}
                loading={aiLoading}
                error={aiError}
                aiOn={aiOn}
                onRetry={() => requestAIFeedback(resumeText, analysis, jdMatch)}
              />
              <JobMatch onAnalyze={handleJdAnalyze} result={jdMatch} />
              {structuredData && <StructuredData data={structuredData} />}
            </div>
            <Chatbot analysis={analysis} jdMatch={jdMatch} />
          </section>
        )}
      </main>

      <footer
        className="border-t py-6 text-center text-xs text-faint"
        style={{ borderColor: "var(--color-border-soft)" }}
      >
        Built with React + Vite · parsing happens locally in your browser
      </footer>
    </div>
  );
}
