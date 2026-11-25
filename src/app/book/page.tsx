import type { Metadata } from "next";
import { ConsultationBooker } from "@/components/book/consultation-booker";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Book consultation",
  description: "Schedule a home visit or virtual consultation with KasaFrames.",
};

export default function BookPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pb-32 lg:pt-24">
      <PageIntro title="Begin with listening. End with a wall that feels inevitable.">
        Share your space, your dimensions, and your references. We’ll respond with a composed direction—not a catalog PDF.
      </PageIntro>

      <div className="mt-16 lg:mt-20">
        <ConsultationBooker />
      </div>
    </div>
  );
}
