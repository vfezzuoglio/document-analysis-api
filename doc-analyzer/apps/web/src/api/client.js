const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function api(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";
  console.log("API", method, `${BASE_URL}${path}`, { hasToken: !!token, isForm });

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = data?.detail || data?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
