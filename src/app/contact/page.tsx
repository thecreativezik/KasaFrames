import type { Metadata } from "next";
import { ContactPanel } from "@/components/contact/contact-panel";
import { StudioStatus } from "@/components/layout/studio-status";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact KasaFrames for consultations, collaborations, and commercial wall styling across Accra.",
};

export default function ContactPage() {
  return (
    <div className="shell pb-24 pt-10 lg:pb-32 lg:pt-16">
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="max-w-4xl text-display-xl text-balance">Speak with the studio.</h1>
        <p className="inline-flex shrink-0 items-center rounded-full border border-bone/10 px-4 py-2.5 text-[13px] text-bone/70 lg:mb-3">
          <StudioStatus showTime />
        </p>
      </header>

      <div className="mt-14 lg:mt-20">
        <ContactPanel />
      </div>
    </div>
  );
}
