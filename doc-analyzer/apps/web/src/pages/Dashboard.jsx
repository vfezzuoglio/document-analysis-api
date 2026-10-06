// Dashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { api, clearToken } from "../api/client";
import UploadCard from "../components/UploadCard";
import DocList from "../components/DocList";
import AskPanel from "../components/AskPanel";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const timerRef = useRef(null);

  async function refreshDocs() {
    const list = await api("/documents");
    setDocs(list);

    // Preserve selection even if selectedId is a string
    setSelectedId((current) => {
      const currentNum =
        current === null || current === undefined ? null : Number(current);

      if (currentNum !== null && list.some((d) => d.id === currentNum)) {
        return currentNum;
      }
      return list.length ? list[0].id : null;
    });
  }

  const hasProcessing = useMemo(
    () => docs.some((d) => d.status === "processing"),
    [docs]
  );

  useEffect(() => {
    refreshDocs().catch((e) => {
      if (/token|credential|401|unauthorized/i.test(e.message)) {
        clearToken();
        location.href = "/";
      }
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (hasProcessing) {
      timerRef.current = setInterval(() => {
        refreshDocs().catch(() => {});
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasProcessing]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doc Analyzer</h1>
        <button
          className="rounded-xl border px-4 py-2 font-semibold"
          onClick={() => {
            clearToken();
            location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <UploadCard onUploaded={refreshDocs} />
        <div className="md:col-span-2 space-y-6">
          <DocList
            docs={docs}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(Number(id))}
          />
          <AskPanel docId={selectedId} docs={docs} />
        </div>
      </div>
    </div>
  );
}
