import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
  Newsreader,
} from "next/font/google";

import "./globals.css";

/**
 * Four faces, one per genuinely different kind of text in this console.
 *
 * The split is structural, not decorative. A case file puts three of them on
 * one screen at once — the console speaking, the machine reporting, and a
 * person's own words — and separating them typographically means no labels are
 * needed to say which is which.
 *
 * None of these is the product frontend's face. That app is set in IBM Plex and
 * is a light document a student reads for an hour; this is an instrument an
 * operator watches, and an operator moving between the two windows should never
 * have to check which one they are looking at.
 */

/**
 * The console announcing. Bricolage is a display grotesque with real character
 * in its joins and terminals, which is exactly wrong for a 13px table cell and
 * exactly right for a count read from across the room. Restricted by policy to
 * page titles and figures — a handful of elements per page.
 */
const display = Bricolage_Grotesque({
  variable: "--font-ops-display",
  subsets: ["latin"],
  display: "swap",
});

/** The console speaking: every other interface surface. */
const sans = Instrument_Sans({
  variable: "--font-ops-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The machine reporting — idents, UUIDs, user agents, viewports, and the
 * generated credential. All read character by character, which is why the mono
 * is JetBrains: it disambiguates 0/O and 1/l/I harder than the alternatives,
 * and a mistyped credential is a support ticket.
 */
const mono = JetBrains_Mono({
  variable: "--font-ops-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * A person's own words, and nothing else. Testimony appears on one route, so
 * preloading it on every page spends a request on a face most navigations never
 * render.
 */
const serif = Newsreader({
  variable: "--font-ops-serif",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Dwelve Operations",
  description: "Platform administration and problem report triage for Dwelve operators.",
  // Belt and braces with the X-Robots-Tag header in next.config.ts.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06070d" },
  ],
};

/**
 * The direction contract.
 *
 * Emitted as a real HTML comment rather than a JSX one, because a JSX comment
 * is compiled away and a contract the build erases is a contract nobody can
 * audit. It is the first thing in <body>, so it tops the file every later edit
 * re-opens. Grep the production output for the seed key to confirm it survived.
 */
const DIRECTION_CONTRACT = `<!--
THESIS: The room at night — an instrument an operator watches, not a document
they read. Refuses the ruled-board look it replaces and the generic dark
analytics dashboard equally.
OWN-WORLD: A deep field with a live aurora behind it; glass instrument panels
lit from within; emissive data. Depth is light, never drop shadow. Bricolage
Grotesque (display) / Instrument Sans (UI) / JetBrains Mono (machine) /
Newsreader (a person's words).
SIGNATURE: The aurora IS the queue — the field's hue and drift are driven by
the live open-report count, so "how much is waiting" is answered before a word
is read. Second: the sealed credential, torn open once.
STORY: An operator opens the console, reads the room's temperature from the
door, opens the case that needs a person, and answers them.
FIRST VIEWPORT: A floating command rail; the room's state named in one line of
display type; the standing totals as lit panels with their own trend; then the
instruments.
CONSTRAINT: Evidence never goes dark. A screenshot of a light product is pinned
to a daylight plate in both characters.
FORM: Aurora control room; direction chosen by the operator over three
candidates; seed a1f4c290.
-->`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    // The font variables go on <html>, not <body>.
    //
    // `--stack-*` in globals.css are declared on :root and built out of these.
    // A custom property containing var() resolves at computed-value time on the
    // element that DECLARES it — not lazily where it is used — so with the
    // faces on <body> the stacks would be invalid at :root and would inherit
    // down as invalid. Every voice would silently fall back to the UA sans,
    // which costs this design the thing it is built on.
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme resolved before first paint. An inline script rather than a
          provider because the alternative is a flash of the wrong ground on
          every load — and in this design the ground is a full-viewport lit
          field, so that flash is the whole screen rather than a corner of it.
          `dwelve-ops-theme` is deliberately not the product's key.

          The nonce is not optional: `src/proxy.ts` sets script-src with
          'strict-dynamic' and no 'unsafe-inline', so without it this script is
          refused and the dark character is lost entirely.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("dwelve-ops-theme");var d=s?s==="dark":!window.matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){document.documentElement.classList.add("dark");}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
