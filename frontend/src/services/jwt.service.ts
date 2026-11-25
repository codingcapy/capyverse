import { type PublicUser } from "@server/schemas/users";

export const API_BASE = import.meta.env.DEV
  ? "http://localhost:3333"
  : window.location.origin;

// One-time cleanup of the old localStorage token
try {
  localStorage.removeItem("jwt_access_token");
} catch {}

let accessToken: string | null = null;

export function setSession(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

type AuthResult = { user: PublicUser; token: string };

let refreshPromise: Promise<AuthResult | null> | null = null;

// Concurrent callers (StrictMode double effects, parallel 401s) share one request
export function refreshSession(): Promise<AuthResult | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<AuthResult | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/v0/user/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 409) {
        // Another tab just rotated the token; retry with the new cookie
        await new Promise((resolve) => setTimeout(resolve, 400));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const result = data.result;
      if (!result?.user || !result?.token) return null;
      setSession(result.token);
      return { user: result.user, token: result.token };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  return null;
}
