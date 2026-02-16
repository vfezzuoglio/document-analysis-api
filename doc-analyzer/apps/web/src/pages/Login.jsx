import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await api(path, { method: "POST", body: { email, password } });
      setToken(data.access_token);
      nav("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Doc Analyzer</h1>
        <p className="text-sm opacity-70 mt-1">Login to upload PDFs and ask questions.</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl border px-3 py-2 ${mode === "login" ? "font-semibold" : "opacity-70"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-xl border px-3 py-2 ${mode === "register" ? "font-semibold" : "opacity-70"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border p-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border p-3"
            type="password"
            placeholder="Password (8–72 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err ? <div className="text-sm text-red-600">{String(err)}</div> : null}

          <button className="w-full rounded-xl border p-3 font-semibold" disabled={loading}>
            {loading ? "Working..." : mode === "login" ? "Login" : "Create account"}
          </button>

          <div className="text-xs opacity-70">
            Tip: Use <span className="font-mono">/auth/login</span> if you already registered (to avoid 409).
          </div>
        </form>
      </div>
    </div>
  );
}
