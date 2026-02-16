import { useRef, useState } from "react";
import { api } from "../api/client";

export default function UploadCard({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setMsg("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await api("/documents", { method: "POST", body: form, isForm: true });
      setMsg("Uploaded!");
      setFile(null);
      onUploaded?.();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <h2 className="font-semibold">Upload PDF</h2>
      <p className="text-sm opacity-70 mt-1">PDF must contain selectable text (no OCR yet).</p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border px-4 py-2 font-semibold"
        >
          Choose file
        </button>

        <div className="text-sm opacity-70 truncate flex-1">
          {file ? file.name : "No file selected"}
        </div>
      </div>

      <button
        onClick={upload}
        disabled={!file || loading}
        className="mt-3 w-full rounded-xl border px-4 py-2 font-semibold disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {msg ? <div className="mt-2 text-sm">{msg}</div> : null}
    </div>
  );
}
