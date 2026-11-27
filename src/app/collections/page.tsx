import type { Metadata } from "next";
import { CollectionsExplorer } from "@/components/collections/collections-explorer";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore the four KasaFrames frame types, each made to order and priced in the open.",
};

export default function CollectionsPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pb-32 lg:pt-24">
      <PageIntro title="Four frame types, made to order for one wall.">
        Step into a collection for styling notes, suggested layouts and every size with its price.
      </PageIntro>

      <div className="mt-16 lg:mt-20">
        <CollectionsExplorer />
      </div>
    </div>
  );
}
