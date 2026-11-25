import { hc, type ClientResponse } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { API_BASE, refreshSession } from "../../services/jwt.service";
import useAuthStore from "../../store/AuthStore";

export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;

export type ExtractData<T> =
  T extends ClientResponse<infer Data, any, any> ? Data : never;

const authFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const hadToken = new Headers(init?.headers).has("Authorization");
  const res = await fetch(input, { ...init, credentials: "include" });
  if (res.status !== 401 || !hadToken) return res;
  const refreshed = await refreshSession();
  if (!refreshed) {
    await useAuthStore.getState().logoutService();
    return res;
  }
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${refreshed.token}`);
  return fetch(input, { ...init, headers, credentials: "include" });
}) as typeof fetch;

export const client = hc<ApiRoutes>(API_BASE, { fetch: authFetch });
