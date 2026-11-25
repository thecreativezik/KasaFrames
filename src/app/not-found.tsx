import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col justify-center pb-24 pt-16 lg:pt-24">
      <PageIntro title="This wall doesn’t exist, yet.">
        The page you’re looking for may have moved. Let’s take you somewhere intentional.
      </PageIntro>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/gallery">See the gallery</Link>
        </Button>
      </div>
    </div>
  );
}
