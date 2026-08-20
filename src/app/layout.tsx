import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Newsreader } from "next/font/google";

import "./globals.css";

/**
 * Three faces, one per kind of text on the screen.
 *
 * Instrument Sans is the console speaking — precise, humanist, with figures that
 * hold a column. IBM Plex Mono is the machine reporting: a user agent, a
 * viewport, a UUID, all things read character by character. Newsreader is the
 * reporter's own words, and nothing else.
 *
 * That third one is the risk in this design and the reason it works: three kinds
 * of text share a case file, and separating them typographically means no labels
 * are needed to say which is which.
 */
const sans = Instrument_Sans({
  variable: "--font-console-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-console-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-console-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dwelve Operations",
  description: "Platform administration and problem report triage for Dwelve operators.",
  // Belt and braces with the X-Robots-Tag header in next.config.ts.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f6" },
    { media: "(prefers-color-scheme: dark)", color: "#131318" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables go on <html>, not <body>.
    //
    // `--stack-sans/mono/serif` in globals.css are declared on :root and are
    // built out of these. A custom property containing var() is resolved at
    // computed-value time on the element that DECLARES it — not lazily where it
    // is used — so with the faces on <body> the stacks would be invalid at
    // :root and would inherit down as invalid. Everything would silently fall
    // back to the UA sans, which costs this design the one thing it is built on.
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme resolved before first paint. An inline script rather than a
          provider because the alternative is a flash of the wrong ground on
          every load, and this app has no other client-side state worth a
          library. `dwelve-ops-theme` is deliberately not the product's key.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("dwelve-ops-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
