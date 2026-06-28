const API_URL = import.meta.env.VITE_API_URL;

interface ApiOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;

  body?: any;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers || {});

  /* =========================
     JSON
  ========================= */

  headers.set("Content-Type", "application/json");

  /* =========================
     AUTH
  ========================= */

  if (options.auth) {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  /* =========================
     REQUEST
  ========================= */

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers,

    body:
      options.body && typeof options.body === "object"
        ? JSON.stringify(options.body)
        : options.body,
  });

  /* =========================
     SESSION EXPIRED
  ========================= */

  if (response.status === 401) {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error("Session expired");
  }

  /* =========================
     ERROR
  ========================= */

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const errorData = await response.json();

      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // ignore json parsing errors
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
