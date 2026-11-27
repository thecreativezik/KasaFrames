import { HomeHero } from "@/components/home/home-hero";
import { StatementSection } from "@/components/home/statement-section";
import { WallStory } from "@/components/home/wall-story";
import { CollectionsPreview } from "@/components/home/collections-preview";
import { SelectedWork } from "@/components/home/selected-work";
import { CommitmentsSection } from "@/components/home/commitments-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactForm } from "@/components/contact/contact-form";
import { loadGalleryItems } from "@/lib/data/media";
import { planHang } from "@/lib/home-hang";

export default function HomePage() {
  // Read at build time from public/media/, like the gallery page.
  const items = loadGalleryItems();
  const hang = planHang(items, 90);

  return (
    <>
      <HomeHero hang={hang} />
      <StatementSection />
      <WallStory />
      <CollectionsPreview />
      <SelectedWork items={items} />
      <CommitmentsSection />
      <FaqSection />

      <section aria-labelledby="get-in-touch" className="border-t border-bone/[0.08]">
        <div className="shell grid gap-14 py-24 lg:grid-cols-12 lg:gap-10 lg:py-36">
          <div className="lg:col-span-5">
            <h2 id="get-in-touch" className="text-display-md text-balance">
              Let&rsquo;s compose your wall.
            </h2>
            <p className="mt-6 max-w-md text-lead font-light text-bone/60 text-pretty">
              Book a consultation and we&rsquo;ll design your wall like a composition. Or send a note, and a photo
              of the wall helps.
            </p>
          </div>
          <div className="lg:col-span-7 lg:pl-10">
            <ContactForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
