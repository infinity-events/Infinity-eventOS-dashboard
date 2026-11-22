const API_URL = (import.meta.env.VITE_API_URL || 'https://infinity-eventos-api.onrender.com').replace(/\/+$/, '');

export async function telegramRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': window.Telegram?.WebApp?.initData || '', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || 'Sessione Telegram non autorizzata');
  return body;
}
