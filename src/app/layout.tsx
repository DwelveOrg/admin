import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Archivo, Azeret_Mono, Petrona } from "next/font/google";

import "./globals.css";

/**
 * Three faces, one per kind of text on the screen.
 *
 * Archivo is the board's own lettering, and it is one family doing two jobs:
 * the `wdth` axis gives the condensed setting a ruled board uses for column
 * heads and field names, so the console never needs a second sans to keep in
 * sync. Azeret Mono is the machine reporting — a user agent, a viewport, a
 * UUID, all things read character by character. Petrona is the note clipped to
 * the board: the reporter's own words, and nothing else.
 *
 * That third one is the risk in this design and the reason it works: three
 * kinds of text share a case file, and separating them typographically means no
 * labels are needed to say which is which.
 */
const sans = Archivo({
  variable: "--font-board-sans",
  subsets: ["latin"],
  // Beyond the weight axis, which a variable font carries by default. This is
  // what `font-stretch` in globals.css is asking for; without it the condensed
  // column heads silently render at normal width.
  axes: ["wdth"],
  display: "swap",
});

const mono = Azeret_Mono({
  variable: "--font-board-mono",
  subsets: ["latin"],
  display: "swap",
});

const serif = Petrona({
  variable: "--font-board-serif",
  subsets: ["latin"],
  display: "swap",
  // Testimony appears on one route. Preloading it on every page spends a
  // request on a face most navigations never render.
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
    { media: "(prefers-color-scheme: light)", color: "#f4f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#171c1b" },
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
THESIS: The ward handover board — how much is waiting, answered from across the
room. Refuses the KPI-card grid and its dark-analytics twin.
OWN-WORLD: Vitreous enamel field under a steel rail; magnetic tiles with acuity
carrier strips; hard 1px rules, 3px corners; Archivo (wdth axis) / Azeret Mono /
Petrona. Colour appears only where it means something, and always in a legend.
STORY: An operator arrives at shift change, reads the board from the door, picks
the tile that needs a person, and answers them.
FIRST VIEWPORT: The steel rail names the shift and the range. Below it the board
opens with disposition columns whose counts are set to be read across a room,
then the observation plates.
FORM: Ward handover board; candidate 1 of 7, taken over the roll's assignment;
seed d7847e01.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
-->`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

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
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("dwelve-ops-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
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
