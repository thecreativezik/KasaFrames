import type { Metadata } from "next";
import { MockupPreview } from "@/components/visualizer/mockup-preview";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Your wall preview",
  description: "The wall you composed, at full size, with the cost of every piece.",
};

export default function VisualizerPreviewPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pb-32 lg:pt-24">
      <PageIntro title="Here is the wall, before anything is ordered.">
        Every piece at true size against your wall, with what each one costs. Send it to the studio and we will take it from here.
      </PageIntro>

      <div className="mt-16 lg:mt-20">
        <MockupPreview />
      </div>
    </div>
  );
}
