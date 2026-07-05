import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { generateChatResponse } from "../lib/chatbot";
import { getAIChatReply, checkAIAvailable } from "../lib/aiClient";

const STARTER_PROMPTS = [
  "How's my score?",
  "What keywords am I missing?",
  "Is my resume too long?",
  "How are my action verbs?",
];

export default function Chatbot({ analysis, jdMatch }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: analysis
        ? "I've scanned your resume. Ask me anything about improving it."
        : "Upload a resume above and I'll help you improve it in real time.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    checkAIAvailable().then(setAiOn);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");

    if (!analysis) {
      setMessages((m) => [...m, { role: "bot", text: generateChatResponse(trimmed, null, null) }]);
      return;
    }

    if (aiOn) {
      setThinking(true);
      try {
        const reply = await getAIChatReply(trimmed, analysis, jdMatch, history);
        setMessages((m) => [...m, { role: "bot", text: reply, ai: true }]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "bot", text: generateChatResponse(trimmed, analysis, jdMatch) },
        ]);
      } finally {
        setThinking(false);
      }
    } else {
      setMessages((m) => [...m, { role: "bot", text: generateChatResponse(trimmed, analysis, jdMatch) }]);
    }
  }

  return (
    <div
      className="rounded-lg border flex flex-col"
      style={{ borderColor: "var(--color-border)", background: "var(--color-panel)", height: 460 }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border-soft)" }}
      >
        <div className="flex items-center gap-2">
          <Bot size={18} style={{ color: "var(--color-scan)" }} />
          <h2 className="font-display text-lg">Resume Assistant</h2>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-mono rounded-full px-2 py-0.5"
          style={{
            color: aiOn ? "var(--color-good)" : "var(--color-faint)",
            background: aiOn ? "#4fd1c522" : "transparent",
          }}
          title={aiOn ? "Using live Gemini API" : "Rule-based mode — set GEMINI_API_KEY in .env for live AI"}
        >
          <Sparkles size={11} />
          {aiOn ? "AI live" : "rule-based"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--color-scan-dim)" }}
              >
                <Bot size={13} style={{ color: "var(--color-scan)" }} />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: m.role === "user" ? "var(--color-scan)" : "var(--color-panel-raised)",
                color: m.role === "user" ? "#171008" : "var(--color-text)",
              }}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--color-panel-raised)" }}
              >
                <User size={13} style={{ color: "var(--color-muted)" }} />
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--color-scan-dim)" }}
            >
              <Bot size={13} style={{ color: "var(--color-scan)" }} />
            </div>
            <div
              className="rounded-lg px-3 py-2 text-sm font-mono"
              style={{ background: "var(--color-panel-raised)", color: "var(--color-faint)" }}
            >
              thinking<span className="cursor-blink">…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-xs rounded-full px-3 py-1 border hover:border-faint transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t flex gap-2"
        style={{ borderColor: "var(--color-border-soft)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your resume…"
          className="flex-1 rounded-md px-3 py-2 text-sm outline-none focus:ring-1"
          style={{
            background: "var(--color-panel-raised)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
        <button
          type="submit"
          className="rounded-md px-3 flex items-center justify-center"
          style={{ background: "var(--color-scan)", color: "#171008" }}
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
