const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

export async function api(path, options = {}) {
  if (!BASE_URL) {
    const error = new Error('VITE_API_URL is not configured');
    error.status = 0;
    throw error;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}
