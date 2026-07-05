import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";

export default function UploadZone({ onFile, fileName, status, error, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      if (files && files[0]) onFile(files[0]);
    },
    [onFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative overflow-hidden rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors
          ${dragOver ? "border-scan bg-scan-dim" : "border-border hover:border-faint"}
        `}
        style={{
          borderColor: dragOver ? "var(--color-scan)" : "var(--color-border)",
          background: dragOver ? "var(--color-scan-dim)" : "transparent",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {status === "parsing" ? (
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-scan)" }} />
            <p className="font-mono text-sm">scanning document…</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-3">
            <FileText size={22} style={{ color: "var(--color-good)" }} />
            <span className="font-mono text-sm text-text">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-2 text-faint hover:text-bad"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud size={30} style={{ color: "var(--color-scan)" }} />
            <p className="font-display text-lg text-text">
              Drop your resume here, or click to browse
            </p>
            <p className="text-sm text-muted">Supports PDF and DOCX</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm font-mono" style={{ color: "var(--color-bad)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
