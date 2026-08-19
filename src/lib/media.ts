import { getApiBaseUrl } from "@/lib/api/backend";

/**
 * Re-bases a stored media URL onto something a browser can actually fetch.
 *
 * `StorageService.buildPublicUrl` prefixes the object key with whatever
 * `PUBLIC_UPLOAD_BASE_URL` is set to. In production that is absolute — the
 * DigitalOcean Spaces CDN — and this is a no-op. With `STORAGE_DRIVER=local` it
 * is `/api/v1/uploads`, so the stored value is a *relative* path that would
 * resolve against this app's origin and 404. The screenshot is the single most
 * useful thing on a report; it silently disappearing in local development is
 * exactly the bug that wastes an afternoon.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith("/")) return url;

  try {
    // `getApiBaseUrl()` is e.g. http://localhost:5001/api/v1, and the stored
    // path already carries its own /api/v1 prefix — so only the origin is taken.
    return new URL(url, new URL(getApiBaseUrl()).origin).toString();
  } catch {
    return url;
  }
}
