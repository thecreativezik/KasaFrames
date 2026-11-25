import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnalyticsScripts } from "@/components/analytics-scripts";

// One grotesk for everything, set large at regular weight with tight tracking.
const grotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KasaFrames — Luxury Wall Aesthetics",
    template: "%s · KasaFrames",
  },
  description:
    "Ghana-based luxury wall aesthetics and framing. Custom frames, interior wall styling, and premium installations across Accra.",
  openGraph: {
    title: "KasaFrames — Luxury Wall Aesthetics",
    description:
      "Transform empty walls into modern statement spaces. Consultation, curation, craft, and white-glove installation.",
    type: "website",
    locale: "en_GH",
    siteName: "KasaFrames",
  },
  twitter: {
    card: "summary_large_image",
    title: "KasaFrames — Luxury Wall Aesthetics",
    description: "Premium wall styling and framing for modern Ghanaian spaces.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dark-only: the class is fixed, so every `dark:` style always applies.
    <html lang="en" className="dark">
      <body className={`${grotesk.variable} min-h-dvh font-sans`}>
        <AppProviders>
          <AnalyticsScripts />
          <div id="top" className="relative flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
