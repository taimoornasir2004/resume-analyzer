import { User, Mail, Phone, Link2, Layers } from "lucide-react";

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} style={{ color: "var(--color-scan)" }} />
      <span className="text-muted">{label}:</span>
      <span className="text-text font-mono text-xs">{value}</span>
    </div>
  );
}

export default function StructuredData({ data }) {
  const anyContact = data.name || data.email || data.phone || data.linkedin || data.github;

  return (
    <div
      className="rounded-lg border p-6"
      style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}
    >
      <h2 className="font-display text-xl mb-1 flex items-center gap-2">
        <Layers size={18} style={{ color: "var(--color-scan)" }} />
        Extracted Data
      </h2>
      <p className="text-xs text-faint mb-4">
        Best-effort extraction — double check against the original file.
      </p>

      {anyContact && (
        <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: "var(--color-border-soft)" }}>
          <Row icon={User} label="Name" value={data.name} />
          <Row icon={Mail} label="Email" value={data.email} />
          <Row icon={Phone} label="Phone" value={data.phone} />
          <Row icon={Link2} label="LinkedIn" value={data.linkedin} />
          <Row icon={Link2} label="GitHub" value={data.github} />
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-faint mb-1.5">SKILLS ({data.skills.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span
                key={i}
                className="rounded px-2 py-0.5 text-xs font-mono"
                style={{ background: "var(--color-panel-raised)", color: "var(--color-muted)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-faint mb-1.5">EDUCATION</p>
          <ul className="space-y-1">
            {data.education.map((e, i) => (
              <li key={i} className="text-xs text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <p className="text-xs text-faint mb-1.5">EXPERIENCE ({data.experience.length} entries)</p>
          <ul className="space-y-1.5">
            {data.experience.map((e, i) => (
              <li key={i} className="text-xs text-muted line-clamp-2">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!anyContact && data.skills.length === 0 && data.education.length === 0 && (
        <p className="text-sm text-faint">
          Couldn't confidently extract structured fields from this layout.
        </p>
      )}
    </div>
  );
}
