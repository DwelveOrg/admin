import "server-only";

import { z } from "zod";

/**
 * The HTTP layer to the Dwelve NestJS API.
 *
 * Ported from the product frontend's `src/lib/api/backend.ts` rather than
 * rewritten. The two apps talk to the same backend, and a second, subtly
 * different implementation of error mapping and response validation is a way for
 * the operator console to disagree with the product about what a 401 means.
 */

const DEFAULT_TIMEOUT_MS = 15_000;

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

const backendErrorBodySchema = z
  .object({
    message: z.union([z.string(), z.array(z.string())]).optional(),
    error: z.string().optional(),
    statusCode: z.number().optional(),
  })
  .passthrough();

type BackendErrorBody = z.infer<typeof backendErrorBodySchema>;

export type BackendRequestInit<TSchema extends z.ZodTypeAny | undefined = undefined> = Omit<
  RequestInit,
  "body"
> & {
  body?: unknown;
  query?: QueryParams;
  responseSchema?: TSchema;
  timeoutMs?: number;
};

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly body: unknown = null,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export class BackendResponseValidationError extends Error {
  constructor(
    path: string,
    public readonly issues: z.core.$ZodIssue[],
  ) {
    super(`Invalid response received from backend for ${path}.`);
    this.name = "BackendResponseValidationError";
  }
}

/**
 * No localhost fallback outside development. An operator console that silently
 * pointed at a machine that was not the API would be worse than one that failed
 * to start.
 */
export function getApiBaseUrl() {
  const configured = process.env.DWELVE_API_BASE_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5001/api/v1";
  }

  throw new Error("DWELVE_API_BASE_URL is not set.");
}

function withQuery(path: string, query?: QueryParams) {
  if (!query) return path;

  const [pathname, existingQuery = ""] = path.split("?");
  const params = new URLSearchParams(existingQuery);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function getErrorMessage(body: BackendErrorBody | null) {
  if (Array.isArray(body?.message)) {
    return body.message.join(" ");
  }

  return body?.message ?? body?.error ?? "Something went wrong. Please try again.";
}

async function readJson(response: Response): Promise<unknown | null> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Whether a body should be JSON-serialised. A `Blob`, `FormData`, or
 * `URLSearchParams` is already a `BodyInit` and stringifying it would send the
 * string "[object Blob]".
 */
function isJsonBody(body: unknown) {
  return (
    body !== undefined &&
    body !== null &&
    typeof body !== "string" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ArrayBuffer)
  );
}

function createTimeoutSignal(signal: AbortSignal | null | undefined, timeoutMs: number) {
  if (timeoutMs <= 0) return signal ?? undefined;

  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  if (!signal) return timeoutSignal;

  const controller = new AbortController();
  const abort = () => controller.abort();
  const options: AddEventListenerOptions = { once: true, signal: controller.signal };

  signal.addEventListener("abort", abort, options);
  timeoutSignal.addEventListener("abort", abort, options);

  return controller.signal;
}

export async function backendJson<TSchema extends z.ZodTypeAny>(
  path: string,
  init: BackendRequestInit<TSchema>,
): Promise<z.infer<TSchema>>;
export async function backendJson<TResponse = unknown>(
  path: string,
  init?: BackendRequestInit,
): Promise<TResponse>;
export async function backendJson(
  path: string,
  // `z.ZodTypeAny | undefined` rather than the default `undefined`, so the
  // narrowing after the `!responseSchema` check leaves a schema rather than
  // `never`.
  init: BackendRequestInit<z.ZodTypeAny | undefined> = {},
): Promise<unknown> {
  const { body, query, responseSchema, timeoutMs, headers, ...rest } = init;
  const url = `${getApiBaseUrl()}${withQuery(path, query)}`;

  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (!requestHeaders.has("X-Request-Id")) {
    requestHeaders.set("X-Request-Id", crypto.randomUUID());
  }

  const serializeJson = isJsonBody(body);

  // No explicit Content-Type for a FormData body: fetch has to set it so the
  // multipart boundary matches.
  if (serializeJson && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : serializeJson
          ? JSON.stringify(body)
          : (body as BodyInit),
    signal: createTimeoutSignal(rest.signal, timeoutMs ?? DEFAULT_TIMEOUT_MS),
    cache: "no-store",
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const parsedError = backendErrorBodySchema.safeParse(payload);
    throw new BackendApiError(
      getErrorMessage(parsedError.success ? parsedError.data : null),
      response.status,
      payload,
    );
  }

  if (!responseSchema) return payload;

  const parsed = responseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new BackendResponseValidationError(path, parsed.error.issues);
  }

  return parsed.data;
}
