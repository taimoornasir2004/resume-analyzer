import { ScanLine } from "lucide-react";

export default function Hero() {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center py-14 md:py-20">
      <div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono mb-5"
          style={{ background: "var(--color-scan-dim)", color: "var(--color-scan)" }}
        >
          <ScanLine size={13} />
          RESUME.ANALYZER — v1.0
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-[1.08] mb-5">
          Your resume, read the way{" "}
          <span style={{ color: "var(--color-scan)" }}>an ATS reads it</span>.
        </h1>
        <p className="text-muted text-base md:text-lg max-w-md leading-relaxed">
          Upload a PDF or Word resume. Get a structured score, keyword gaps
          against any job description, and a live assistant that answers
          exactly what to fix — all processed locally in your browser.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div
          className="relative rounded-lg border overflow-hidden p-6"
          style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}
        >
          {/* fake document lines */}
          <div className="space-y-2.5">
            <div className="h-3 w-2/3 rounded" style={{ background: "var(--color-border)" }} />
            <div className="h-2 w-1/2 rounded" style={{ background: "var(--color-border-soft)" }} />
            <div className="h-px w-full my-3" style={{ background: "var(--color-border)" }} />
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-2 rounded"
                style={{
                  width: `${85 - i * 6}%`,
                  background: "var(--color-border-soft)",
                }}
              />
            ))}
          </div>

          {/* scanning line */}
          <div
            className="scanline absolute left-0 right-0 h-16 pointer-events-none"
            style={{
              top: 0,
              background:
                "linear-gradient(to bottom, transparent, var(--color-scan-dim), transparent)",
              borderTop: "1px solid var(--color-scan)",
              borderBottom: "1px solid var(--color-scan)",
            }}
          />
        </div>

        <div
          className="absolute -bottom-4 -right-4 rounded-md border px-3 py-2 font-mono text-xs"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-panel-raised)",
            color: "var(--color-good)",
          }}
        >
          score: 82<span className="cursor-blink">_</span>
        </div>
      </div>
    </div>
  );
}
