import type { NextConfig } from "next";

/**
 * Baseline security headers. The same set the product frontend sends, plus one
 * this app needs and that one does not: an operator console has no business in a
 * search index, and `noindex, nofollow` costs nothing to state.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/**
 * Report screenshots are served from wherever the backend's
 * `PUBLIC_UPLOAD_BASE_URL` points. In production that is the DigitalOcean Spaces
 * CDN; in local development the backend writes to disk and returns a *relative*
 * path, which `resolveMediaUrl` re-bases onto the API origin before it ever
 * reaches an <img>.
 *
 * `NEXT_PUBLIC_MEDIA_HOST` overrides the host for a different bucket without a
 * code change.
 */
const mediaHost =
  process.env.NEXT_PUBLIC_MEDIA_HOST ?? "dwelvespaces.sgp1.cdn.digitaloceanspaces.com";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: mediaHost },
      // The local backend, for `STORAGE_DRIVER=local` development only.
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
