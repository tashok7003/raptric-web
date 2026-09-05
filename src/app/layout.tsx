import type { Metadata } from "next";
import { Archivo, Mukta } from "next/font/google";
import "./globals.css";
import { ConsentBanner } from "@/components/chrome/ConsentBanner";
import { getConsentChoice } from "@/lib/consent";

// Type pairing 10a: Archivo (display, industrial/dense, best numerals) +
// Mukta (body — ships with a matched Devanagari so a Marathi site later
// is a language file, not a rebuild).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RAPTRIC — eBikes for the daily commute",
    template: "%s — RAPTRIC",
  },
  description:
    "eBikes and mBikes with no-cost EMI, a 2-year frame warranty, and 20 stores across Maharashtra.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const consent = await getConsentChoice();

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${mukta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-2.5 focus:text-[13px] focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <ConsentBanner initiallyShown={consent === null} />
      </body>
    </html>
  );
}
