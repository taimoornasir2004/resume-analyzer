import { Sparkles, RefreshCw } from "lucide-react";

export default function AIFeedback({ feedback, loading, error, aiOn, onRetry }) {
  return (
    <div
      className="rounded-lg border p-6"
      style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Sparkles size={18} style={{ color: "var(--color-scan)" }} />
          AI Feedback
        </h2>
        {!loading && (
          <button
            onClick={onRetry}
            className="text-faint hover:text-text transition-colors"
            aria-label="Regenerate feedback"
          >
            <RefreshCw size={15} />
          </button>
        )}
      </div>

      {!aiOn && !loading && !feedback && (
        <p className="text-sm text-muted">
          Rule-based feedback is shown in the score panel above. To get
          personalized, language-model-generated feedback here, get a free key
          at{" "}
          <span className="font-mono text-xs" style={{ color: "var(--color-scan)" }}>
            aistudio.google.com/app/apikey
          </span>
          , set{" "}
          <code className="font-mono text-xs" style={{ color: "var(--color-scan)" }}>
            GEMINI_API_KEY
          </code>{" "}
          in <code className="font-mono text-xs">.env</code>, and run the backend.
        </p>
      )}

      {loading && (
        <p className="text-sm font-mono text-faint">
          generating personalized feedback<span className="cursor-blink">…</span>
        </p>
      )}

      {error && !loading && (
        <p className="text-sm" style={{ color: "var(--color-bad)" }}>
          {error}
        </p>
      )}

      {feedback && !loading && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-text">{feedback}</p>
      )}
    </div>
  );
}
