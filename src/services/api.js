const BASE = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    const err = new Error('Cannot reach the server. Is the backend running?');
    err.status = 0;
    throw err;
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}