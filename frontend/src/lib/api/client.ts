import { hc, type ClientResponse } from "hono/client";
import { type ApiRoutes } from "../../../../app";

export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;

export type ExtractData<T> =
  T extends ClientResponse<infer Data, any, any> ? Data : never;

const devServer = "http://localhost:3333";
const prodServer = "https://capyverse-production.up.railway.app";

export const client = hc<ApiRoutes>(devServer);
