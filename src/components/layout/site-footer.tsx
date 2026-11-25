import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { FooterWordmark } from "@/components/layout/footer-wordmark";
import { StudioStatus } from "@/components/layout/studio-status";
import { BRAND_PHONE_DISPLAY, BRAND_PHONE_TEL, whatsappLink } from "@/lib/utils";

const footerNav = [
  { href: "/collections", label: "Collections" },
  { href: "/gallery", label: "Gallery" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/installation", label: "Installation" },
  { href: "/book", label: "Consultation" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/policies", label: "How we work" },
];

/** Three ways to start a conversation, set large across the top of the footer. */
const starts = [
  {
    label: "Book a consultation",
    note: "No fee. At home or on a video call.",
    href: "/book",
    external: false,
  },
  {
    label: "Chat on WhatsApp",
    note: "The quickest way to reach us.",
    href: whatsappLink("Hello KasaFrames — I'd love guidance on a wall project."),
    external: true,
  },
  {
    label: "Follow on Instagram",
    note: "@kasaframes",
    href: "https://instagram.com",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-bone/[0.08] bg-ink">
      <div className="shell">
        <ul className="grid md:grid-cols-3">
          {starts.map((s) => {
            const Icon = s.external ? ArrowUpRight : ArrowRight;
            const content = (
              <>
                <span className="text-display-sm transition-transform duration-500 ease-out group-hover:translate-x-1">
                  {s.label}
                </span>
                <span className="flex items-end justify-between gap-6">
                  <span className="text-[14px] text-bone/50">{s.note}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-[background-color,border-color,color] duration-300 group-hover:border-bone group-hover:bg-bone group-hover:text-ink">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                </span>
              </>
            );
            const className =
              "group flex h-full min-h-[10rem] flex-col justify-between gap-8 py-8 lg:min-h-[13rem] lg:py-12";
            return (
              <li
                key={s.label}
                className="border-b border-bone/[0.08] md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0 lg:px-10"
              >
                {s.external ? (
                  <a href={s.href} target="_blank" rel="noreferrer" className={className}>
                    {content}
                  </a>
                ) : (
                  <Link href={s.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-bone/[0.08]">
        <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <p className="max-w-md text-title text-bone/80 text-pretty lg:col-span-5">
            We transform empty walls into modern statement spaces, through curation, craft and precision
            installation across Accra.
          </p>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
            <ul className="grid grid-cols-2 gap-x-8">
              {footerNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-[15px] tracking-[-0.01em] text-bone/60 transition-colors hover:text-bone sm:min-h-9"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="text-[15px] not-italic leading-relaxed text-bone/60 lg:col-span-3">
            Accra, Greater Accra
            <br />
            Visits by appointment
            <br />
            <a href={BRAND_PHONE_TEL} className="inline-flex min-h-11 items-center tabular-nums text-bone transition-colors hover:text-white sm:min-h-9">
              {BRAND_PHONE_DISPLAY}
            </a>
            <StudioStatus showTime className="mt-3 flex text-[13px] text-bone/50" />
          </address>
        </div>

        <div className="shell">
          <FooterWordmark />

          <div className="mt-8 flex flex-col gap-1 border-t border-bone/10 py-5 text-[13px] text-bone/50 sm:flex-row sm:items-center sm:justify-between">
            <p className="py-2.5">© {new Date().getFullYear()} KasaFrames. All rights reserved.</p>
            <p className="hidden md:block">Designed for Ghana · Built for the world</p>
            <a href="#top" className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-bone">
              Back to top <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
