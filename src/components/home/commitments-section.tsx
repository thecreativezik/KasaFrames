import Link from "next/link";
import { commitments } from "@/lib/data/site";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Replaces the invented customer quotes that used to sit here. Until there are
 * real clients to quote, what we can honestly show is how the studio works.
 */
export function CommitmentsSection() {
  return (
    <section aria-labelledby="commitments-title" className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-10 lg:py-36">
      <div className="lg:col-span-5">
        <h2 id="commitments-title" className="text-display-md text-balance">
          No surprises at the door.
        </h2>
        <p className="mt-6 max-w-md text-lead font-light text-bone/60 text-pretty">
          What you pay, when you pay it, and who turns up. All of it is on the site before you commit to anything.
        </p>
        <Button asChild variant="link" className="mt-8 text-[15px]">
          <Link href="/policies">Read how we work, in full</Link>
        </Button>
      </div>

      <ul className="grid border-b border-bone/10 sm:grid-cols-2 sm:gap-x-10 lg:col-span-7">
        {commitments.map((c, i) => (
          <li key={c.title} className="border-t border-bone/10 py-8 lg:py-10">
            <Reveal delay={(i % 2) * 0.06}>
              <h3 className="text-title text-balance">{c.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bone/60 text-pretty">{c.body}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
