import { useState } from "react";
import { Target } from "lucide-react";

export default function JobMatch({ onAnalyze, result }) {
  const [jd, setJd] = useState("");

  return (
    <div
      className="rounded-lg border p-6"
      style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}
    >
      <h2 className="font-display text-xl mb-1 flex items-center gap-2">
        <Target size={18} style={{ color: "var(--color-scan)" }} />
        Job Match
      </h2>
      <p className="text-sm text-muted mb-4">
        Paste a job description to check keyword overlap with your resume.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here…"
        rows={6}
        className="w-full rounded-md p-3 text-sm font-mono resize-none outline-none focus:ring-1"
        style={{
          background: "var(--color-panel-raised)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />

      <button
        onClick={() => onAnalyze(jd)}
        disabled={!jd.trim()}
        className="mt-3 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
        style={{ background: "var(--color-scan)", color: "#171008" }}
      >
        Compare against resume
      </button>

      {result && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--color-border-soft)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted">Keyword match</span>
            <span
              className="font-mono text-2xl font-bold"
              style={{
                color:
                  result.matchPercent >= 60
                    ? "var(--color-good)"
                    : result.matchPercent >= 30
                    ? "var(--color-warn)"
                    : "var(--color-bad)",
              }}
            >
              {result.matchPercent}%
            </span>
          </div>

          {result.matched.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-faint mb-1.5">FOUND IN YOUR RESUME</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.slice(0, 14).map((kw) => (
                  <span
                    key={kw}
                    className="rounded px-2 py-0.5 text-xs font-mono"
                    style={{ background: "#4fd1c522", color: "var(--color-good)" }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <p className="text-xs text-faint mb-1.5">MISSING — CONSIDER ADDING</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.slice(0, 14).map((kw) => (
                  <span
                    key={kw}
                    className="rounded px-2 py-0.5 text-xs font-mono"
                    style={{ background: "#e5484d22", color: "var(--color-bad)" }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
