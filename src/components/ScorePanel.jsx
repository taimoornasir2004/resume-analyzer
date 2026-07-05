import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function scoreColor(score) {
  if (score >= 75) return "var(--color-good)";
  if (score >= 45) return "var(--color-warn)";
  return "var(--color-bad)";
}

export default function ScorePanel({ analysis }) {
  const data = analysis.categories.map((c) => ({
    name: c.label,
    score: c.score,
  }));

  return (
    <div className="rounded-lg border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-display text-xl">Resume Score</h2>
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono text-4xl font-bold"
            style={{ color: scoreColor(analysis.overall) }}
          >
            {analysis.overall}
          </span>
          <span className="text-muted font-mono text-sm">/100</span>
        </div>
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: "var(--color-panel-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, i) => (
                <Cell key={i} fill={scoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 space-y-2.5 border-t pt-4" style={{ borderColor: "var(--color-border-soft)" }}>
        {analysis.categories.map((c) => (
          <div key={c.key} className="text-sm">
            <div className="flex items-center gap-2 text-muted">
              {c.issues.length === 0 ? (
                <CheckCircle2 size={14} style={{ color: "var(--color-good)" }} />
              ) : (
                <AlertTriangle size={14} style={{ color: "var(--color-warn)" }} />
              )}
              <span className="text-text">{c.label}</span>
              <span className="font-mono text-xs text-faint">— {c.detail}</span>
            </div>
            {c.issues.map((issue, i) => (
              <p key={i} className="ml-6 mt-0.5 text-xs text-faint">
                • {issue}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
