"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/lib/data/site";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [open, setOpen] = useState(0);
  const id = useId();

  return (
    <section className="border-t border-bone/[0.08]">
      <div className="shell grid gap-12 py-24 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <div className="lg:col-span-4">
          <h2 className="text-display-md text-balance">Answers, calmly delivered.</h2>
        </div>

        <div className="border-t border-bone/10 lg:col-span-8">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${id}-panel-${i}`;
            const buttonId = `${id}-button-${i}`;
            return (
              <div key={item.q} className={cn("border-b border-bone/10 pb-2", isOpen && "pb-8")}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 pb-4 pt-6 text-left text-[19px] tracking-[-0.03em] text-bone sm:text-[22px]"
                  >
                    {item.q}
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-[transform,border-color,color] duration-300 ease-out group-hover:border-bone/40 group-hover:text-bone",
                        isOpen && "rotate-45 border-bone/40 text-bone",
                      )}
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                  <p className="max-w-2xl pr-12 text-[16px] font-light leading-relaxed text-bone/60 sm:text-[17px]">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
