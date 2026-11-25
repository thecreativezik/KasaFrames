import Link from "next/link";
import { commitments } from "@/lib/data/site";
import { SectionHeading } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Replaces the invented customer quotes that used to sit here. Until there are
 * real clients to quote, what we can honestly show is how the studio works.
 */
export function CommitmentsSection() {
  return (
    <section className="shell py-24 lg:py-36">
      <SectionHeading
        title="No surprises at the door."
        action={
          <Button asChild variant="link" className="text-[15px]">
            <Link href="/policies">Read how we work, in full</Link>
          </Button>
        }
      />
      <p className="mt-6 max-w-2xl text-lead font-light text-bone/60 text-pretty">
        What you pay, when you pay it, and who turns up. All of it is on the site before you commit to anything.
      </p>

      <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {commitments.map((c, i) => (
          <li key={c.title} className="border-t border-bone/15 pt-6">
            <Reveal delay={i * 0.06}>
              <span className="text-[11px] tabular-nums text-bone/50">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-title">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-bone/60 text-pretty">{c.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
