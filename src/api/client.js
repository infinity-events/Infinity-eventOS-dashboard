import { auth } from "../firebase";

const DEFAULT_API_URL = "https://infinity-eventos-api.onrender.com";
const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).trim().replace(/\/+$/, "");
const API_TIMEOUT_MS = 15000;

export async function apiRequest(endpoint, options = {}) {
  const {
    headers: extraHeaders = {},
    signal: externalSignal,
    ...fetchOptions
  } = options;

  let token = null;
  if (auth.currentUser) {
    token = await Promise.race([
      auth.currentUser.getIdToken(),
      new Promise((_, reject) => {
        window.setTimeout(
          () => reject(new Error("Firebase token timeout")),
          API_TIMEOUT_MS,
        );
      }),
    ]);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    API_TIMEOUT_MS,
  );

  const signal = externalSignal || controller.signal;

  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...fetchOptions,
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
          ...extraHeaders,
        },
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `API Error: ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "La richiesta ha superato il tempo limite. Riprova tra poco.",
        { cause: error },
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
