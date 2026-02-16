import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Bubble({ role, text, meta }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm whitespace-pre-wrap ${
          isUser ? "bg-black/5" : ""
        }`}
      >
        <div>{text}</div>
        {meta ? <div className="mt-2 text-[11px] opacity-60">{meta}</div> : null}
      </div>
    </div>
  );
}

function CitationCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">
            Chunk #{c.idx} <span className="text-xs opacity-60">(id {c.chunk_id})</span>
          </div>
          <div className="text-xs opacity-60">{open ? "Hide" : "Show"}</div>
        </div>
        <div className="mt-1 text-sm opacity-80 line-clamp-2">{c.snippet}</div>
      </button>

      {open ? <div className="mt-3 text-sm whitespace-pre-wrap">{c.snippet}</div> : null}
    </div>
  );
}

export default function AskPanel({ docId, docs }) {
  // chat history keyed by doc id (in-memory MVP)
  const [threads, setThreads] = useState(() => ({}));
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const doc = useMemo(() => {
    if (!docId) return null;
    return (docs || []).find((d) => d.id === docId) || null;
  }, [docId, docs]);

  const ready = doc?.status === "ready";
  const processing = doc?.status === "processing";
  const failed = doc?.status === "failed";

  const thread = useMemo(() => {
    if (!doc) return [];
    return threads[doc.id] || [];
  }, [threads, doc]);

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, loading]);

  async function ask() {
    if (!doc || !ready || !q.trim() || loading) return;

    const question = q.trim();
    setQ("");
    setErr("");

    // push user message
    setThreads((t) => ({
      ...t,
      [doc.id]: [...(t[doc.id] || []), { role: "user", text: question, ts: nowTime() }],
    }));

    setLoading(true);
    try {
      const data = await api(`/documents/${doc.id}/ask`, {
        method: "POST",
        body: { question },
      });

      // push assistant message
      setThreads((t) => ({
        ...t,
        [doc.id]: [
          ...(t[doc.id] || []),
          {
            role: "assistant",
            text: data.answer || "",
            ts: nowTime(),
            citations: data.citations || [],
          },
        ],
      }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (!doc) return;
    setThreads((t) => ({ ...t, [doc.id]: [] }));
    setErr("");
  }

  return (
    <div className="rounded-2xl border p-4 min-h-[520px] flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Ask</h2>
          <div className="text-sm opacity-70 mt-1">
            {doc ? (
              <>
                Document: <span className="font-semibold">{doc.filename}</span>
              </>
            ) : (
              "Select a document to ask questions."
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={!doc || thread.length === 0}
          className="rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
        >
          Clear chat
        </button>
      </div>

      {/* Status banner */}
      {doc ? (
        <div className="mt-3">
          {processing ? (
            <div className="rounded-xl border px-3 py-2 text-sm opacity-80">
              Processing… please wait a moment (this auto-updates on refresh/polling).
            </div>
          ) : null}

          {failed ? (
            <div className="rounded-xl border px-3 py-2 text-sm text-red-600">
              Failed to process this PDF. Try another file (must have selectable text).
            </div>
          ) : null}

          {!processing && !failed && !ready ? (
            <div className="rounded-xl border px-3 py-2 text-sm opacity-80">
              Status: {doc.status}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex-1 overflow-auto rounded-2xl border p-3 bg-white">
        {doc ? (
          thread.length ? (
            <div className="space-y-3">
              {thread.map((m, i) => (
                <div key={i} className="space-y-2">
                  <Bubble role={m.role} text={m.text} meta={m.ts} />
                  {m.role === "assistant" && m.citations?.length ? (
                    <div className="ml-1 space-y-2">
                      <div className="text-xs font-semibold opacity-70">Citations</div>
                      <div className="space-y-2">
                        {m.citations.map((c) => (
                          <CitationCard key={`${c.chunk_id}-${c.idx}`} c={c} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border px-4 py-3 text-sm opacity-70">
                    Thinking…
                  </div>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="text-sm opacity-70">
              {ready ? "Ask your first question about this PDF." : "Waiting for document to be ready."}
            </div>
          )
        ) : (
          <div className="text-sm opacity-70">No document selected.</div>
        )}
      </div>

      {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-xl border p-3 disabled:opacity-60"
          placeholder='Try: "What skills are mentioned?"'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={!doc || !ready}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
        />
        <button
          className="rounded-xl border px-4 font-semibold disabled:opacity-60"
          onClick={ask}
          disabled={!doc || !ready || !q.trim() || loading}
        >
          Ask
        </button>
      </div>

      <div className="mt-2 text-xs opacity-60">
        Tip: Upload a PDF with selectable text for best results.
      </div>
    </div>
  );
}
