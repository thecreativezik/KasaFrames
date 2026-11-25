import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { STUDIO_HOURS_LABEL } from "@/lib/studio";
import { BRAND_PHONE_DISPLAY, BRAND_PHONE_TEL, whatsappLink } from "@/lib/utils";

const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

/** Set large, like an index: the fastest way first. */
const channels = [
  {
    label: "WhatsApp",
    note: "The fastest reply. Send a photo of the wall.",
    href: whatsappLink("Hello KasaFrames — I'd like to speak with the studio."),
    external: true,
  },
  {
    label: "Call",
    note: `${BRAND_PHONE_DISPLAY}, ${STUDIO_HOURS_LABEL}`,
    href: BRAND_PHONE_TEL,
    external: false,
  },
  {
    label: "Instagram",
    note: "@kasaframes",
    href: "https://instagram.com",
    external: true,
  },
];

export function ContactPanel() {
  return (
    <>
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
        <section aria-label="Reach us directly" className="lg:col-span-6">
          <ul className="border-t border-bone/10">
            {channels.map((c) => (
              <li key={c.label} className="border-b border-bone/10">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center justify-between gap-6 py-6 lg:py-8"
                >
                  <span className="min-w-0">
                    <span className="block text-display-md transition-transform duration-500 ease-out group-hover:translate-x-2">
                      {c.label}
                    </span>
                    <span className="mt-2 block text-[15px] text-bone/50 transition-colors group-hover:text-bone/70">
                      {c.note}
                    </span>
                  </span>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-[background-color,border-color,color,transform] duration-300 group-hover:rotate-45 group-hover:border-bone group-hover:bg-bone group-hover:text-ink">
                    <ArrowUpRight aria-hidden className="h-5 w-5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid grid-cols-2 gap-6 text-[15px]">
            <div>
              <dt className="text-[13px] text-bone/50">Hours</dt>
              <dd className="mt-2 leading-relaxed text-bone/80">
                Tuesday to Saturday
                <br />
                10:00 to 18:00 GMT
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-bone/50">Studio</dt>
              <dd className="mt-2 leading-relaxed text-bone/80">
                Accra, Greater Accra
                <br />
                Visits by appointment
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="contact-form-title"
          className="rounded-panel border border-bone/10 bg-ink-raised p-6 sm:p-10 lg:col-span-6 lg:p-12"
        >
          <h2 id="contact-form-title" className="text-display-sm text-balance">
            Or send a note about the wall.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bone/50 text-pretty">
            The room, roughly how wide the wall is, and what you like.
          </p>
          <div className="mt-10">
            <ContactForm source="contact-page" />
          </div>
        </section>
      </div>

      <div className="relative mt-16 aspect-[4/3] overflow-hidden rounded-panel border border-bone/10 bg-ink-raised sm:aspect-[21/9] lg:mt-24">
        {mapUrl ? (
          <iframe title="KasaFrames on the map" src={mapUrl} className="h-full w-full border-0" loading="lazy" />
        ) : (
          <Image
            src="/media/framed-matte/dining-salon-arrangement.jpg"
            alt="A framed salon arrangement above a dining table"
            fill
            className="object-cover"
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
        )}
      </div>
    </>
  );
}
