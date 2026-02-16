// src/components/DocList.jsx
export default function DocList({ docs = [], selectedId, onSelect }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Documents</h2>
        <div className="text-xs opacity-60">{docs.length} total</div>
      </div>

      <div className="mt-3 space-y-2">
        {docs.length === 0 ? (
          <div className="text-sm opacity-70">No documents yet. Upload a PDF.</div>
        ) : (
          docs.map((d) => {
            const isSelected = Number(selectedId) === Number(d.id);

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect?.(d.id)}
                className={[
                  "w-full text-left rounded-xl border px-3 py-3",
                  "hover:bg-black/5 active:scale-[0.99] transition",
                  isSelected ? "border-black" : "border-black/10",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.filename}</div>
                    <div className="text-xs opacity-60">id: {d.id}</div>
                  </div>

                  <span
                    className={[
                      "text-xs rounded-full border px-2 py-1",
                      d.status === "ready"
                        ? "bg-green-50"
                        : d.status === "processing"
                        ? "bg-yellow-50"
                        : d.status === "failed"
                        ? "bg-red-50"
                        : "bg-black/5",
                    ].join(" ")}
                  >
                    {d.status}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* debug line so you can see selection changing */}
      <div className="mt-3 text-xs opacity-60">
        Selected: {selectedId ?? "none"}
      </div>
    </div>
  );
}
