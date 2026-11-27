"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { SectionHeading } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { getProduct, type FrameSize } from "@/lib/data/catalog";
import { processSteps } from "@/lib/data/site";
import { EYE_LEVEL_CM, SAMPLE_ROOMS } from "@/lib/visualizer";
import { cn, formatGhs } from "@/lib/utils";

/**
 * How a wall comes together, told on one wall. The section holds still while
 * the visitor scrolls through the studio's four steps, and a sample room from
 * the visualizer goes from an empty wall to a hung one.
 *
 * Everything on that wall is to scale: the room's measured width and height,
 * the published frame sizes, and the height we hang to. The price at the end is
 * the published price of those frames, installed.
 */

const ROOM_ID = "warm-sideboard";
/** The room photographs are 16:9. The stage shows the left part, where the wall is empty. */
const PHOTO_RATIO = 16 / 9;
const CROP = 0.6;
/** Centre of the composition, in cm from the left end of the wall. */
const CENTRE_CM = 121;
const GAP_CM = 10;
/** Where the floor-to-centre dimension is drawn, in cm from the left end of the wall. */
const DIMENSION_CM = 28;
const CM_PER_IN = 2.54;
const PRODUCT_ID = "black-frame-thick";
/** Left to right. Sizes are matched against the published price list. */
const HANG = [
  { w: 12, h: 16, art: "/art/adinkra-owo-foro-adobe.svg", tilt: -2.4 },
  { w: 20, h: 30, art: "/art/adinkra-gye-nyame.svg", tilt: 1.3 },
  { w: 12, h: 16, art: "/art/adinkra-dwennimmen.svg", tilt: -1.2 },
];

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six"];

/** Wall geometry as percentages of the photograph, worked out once from the room's measurements. */
function buildScene() {
  const room = SAMPLE_ROOMS.find((r) => r.id === ROOM_ID);
  const product = getProduct(PRODUCT_ID);
  if (!room || !product) return null;

  const sizes = HANG.map((p) => product.sizes.find((s) => s.widthIn === p.w && s.heightIn === p.h)).filter(
    (s): s is FrameSize => Boolean(s),
  );
  if (sizes.length !== HANG.length) return null;

  // The wall runs the full width of the photograph, from its top edge down to the skirting.
  const floor = room.quad[3].y * 100;
  const x = (cm: number) => (cm / room.wallCm) * 100;
  const y = (cm: number) => (cm / room.wallHeightCm) * floor;
  const line = floor - y(EYE_LEVEL_CM);

  const spanCm = sizes.reduce((sum, s) => sum + s.widthIn * CM_PER_IN, 0) + GAP_CM * (sizes.length - 1);
  let cursor = CENTRE_CM - spanCm / 2;
  const frames = HANG.map((p, i) => {
    const size = sizes[i];
    const w = size.widthIn * CM_PER_IN;
    const h = size.heightIn * CM_PER_IN;
    const frame = { ...p, label: size.label, left: x(cursor), top: line - y(h) / 2, width: x(w), height: y(h) };
    cursor += w + GAP_CM;
    return frame;
  });

  const counts = new Map<string, number>();
  for (const f of frames) counts.set(f.label, (counts.get(f.label) ?? 0) + 1);
  const mix = [...counts]
    .sort((a, b) => a[1] - b[1])
    .map(([label, n]) => `${NUMBER_WORDS[n] ?? n} ${label}`)
    .join(" and ");

  return {
    room,
    product,
    floor,
    line,
    frames,
    mix: mix.charAt(0).toUpperCase() + mix.slice(1),
    spanCm: Math.round(spanCm),
    spanLeft: x(CENTRE_CM - spanCm / 2),
    spanWidth: x(spanCm),
    // Dimensioned below the frames, clear of the chapter note in the top corner.
    spanY: Math.max(...frames.map((f) => f.top + f.height)) + y(8),
    dimensionX: x(DIMENSION_CM),
    total: sizes.reduce((sum, s) => sum + s.frameGhs + product.installationGhs, 0),
    /** One centimetre of wall, in units of the stage's width. */
    cm: 100 / (CROP * room.wallCm),
  };
}

const SCENE = buildScene();

/** Stage annotations sit on a white wall, so they are drawn in ink. */
const tagText = "whitespace-nowrap text-[clamp(12px,1.6cqw,13px)] leading-none tabular-nums text-ink/75";
const fade = "transition-opacity duration-500 ease-out motion-reduce:transition-none";

export function WallStory() {
  const reduce = useReducedMotion();
  const pinned = !reduce;
  const count = processSteps.length;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const seen = useInView(stageRef, { once: true, amount: 0.35 });
  const drawn = seen || !pinned;
  const [step, setStep] = React.useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 80px", "end end"] });
  const stepAt = React.useCallback((p: number) => Math.min(count - 1, Math.max(0, Math.floor(p * count))), [count]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (pinned) setStep(stepAt(p));
  });

  // Without scroll-driven motion the story opens on the finished wall.
  React.useEffect(() => {
    setStep(pinned ? stepAt(scrollYProgress.get()) : count - 1);
  }, [pinned, stepAt, scrollYProgress, count]);

  /** Scroll to the middle of a chapter, or simply show it when the section is not pinned. */
  const go = (i: number) => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!pinned || !track || !sticky) {
      setStep(i);
      return;
    }
    const start = window.scrollY + track.getBoundingClientRect().top - (parseFloat(getComputedStyle(sticky).top) || 0);
    const distance = track.offsetHeight - sticky.offsetHeight;
    window.scrollTo({ top: start + (distance * (i + 0.5)) / count, behavior: "smooth" });
  };

  if (!SCENE) return null;
  const s = SCENE;
  const sizes = s.frames.map((f) => f.label).join(", ");

  const notes = [
    `This wall, ${s.room.wallCm} × ${s.room.wallHeightCm} cm`,
    "Frame sizes in inches",
    "Made to order, usually 3–7 days",
    `Level, centred ${EYE_LEVEL_CM} cm up`,
  ];
  const n = NUMBER_WORDS[s.frames.length] ?? String(s.frames.length);
  const descriptions = [
    `A sample room with an empty wall. A centre line is marked ${EYE_LEVEL_CM} cm above the floor.`,
    `${n.charAt(0).toUpperCase() + n.slice(1)} frames outlined on the wall, ${sizes} inches, ${s.spanCm} cm across.`,
    `The ${n} frames, made to order, are lifted into place.`,
    `The ${n} frames hang level on the centre line. Installed, they cost ${formatGhs(s.total)}.`,
  ];

  return (
    <section aria-labelledby="wall-story-title">
      <div className="shell pt-24 lg:pt-36">
        <SectionHeading
          id="wall-story-title"
          title="From an empty wall to a finished composition."
          action={
            <Button asChild size="lg" variant="secondary">
              <Link href="/visualizer">Try it on your wall</Link>
            </Button>
          }
        />
      </div>

      <div
        ref={trackRef}
        className="relative mt-8 lg:mt-12"
        style={pinned ? { height: `${count * 85}svh` } : undefined}
      >
        <div
          ref={stickyRef}
          className={cn(
            "flex items-center",
            pinned ? "sticky top-[72px] h-[calc(100svh-72px)] lg:top-20 lg:h-[calc(100svh-80px)]" : "pb-24 lg:pb-36",
          )}
        >
          <div className="shell grid w-full gap-x-10 lg:grid-cols-12 lg:items-start">
            {/* The four chapters, with the gold rail filling as the story is told. */}
            <ol className="relative hidden lg:col-span-4 lg:block">
              <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-bone/10">
                <motion.span
                  className="absolute inset-0 origin-top bg-kasa-gold"
                  style={{ scaleY: pinned ? scrollYProgress : (step + 1) / count }}
                />
              </span>
              {processSteps.map((st, i) => (
                <li key={st.title}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === step ? "step" : undefined}
                    className="group block w-full py-4 pl-8 text-left"
                  >
                    <span
                      className={cn(
                        "block text-title transition-colors duration-500",
                        i === step ? "text-bone" : "text-bone/50 group-hover:text-bone/80",
                      )}
                    >
                      {st.title}
                    </span>
                    <span
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
                        i === step ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="block max-w-[34ch] pt-2 text-[15px] leading-relaxed text-bone/60 text-pretty">
                          {st.body}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="min-w-0 lg:col-span-8">
              <figure
                className="mx-auto w-[min(100%,calc((100svh_-_72px_-_17rem)*var(--ar)))] lg:mr-0 lg:w-[min(100%,calc((100svh_-_80px_-_8rem)*var(--ar)))]"
                style={{ "--ar": CROP * PHOTO_RATIO } as React.CSSProperties}
              >
                <div
                  ref={stageRef}
                  role="img"
                  aria-label={descriptions[step]}
                  className="relative overflow-hidden rounded-panel bg-[#eeedea] [container-type:inline-size]"
                  style={{ aspectRatio: CROP * PHOTO_RATIO, "--cm": `${s.cm}cqw` } as React.CSSProperties}
                >
                  <div className="absolute inset-y-0 left-0" style={{ width: `${100 / CROP}%` }}>
                    <Image
                      src={s.room.src}
                      alt=""
                      fill
                      sizes="(max-width: 1023px) 170vw, 90vw"
                      className="object-cover"
                    />

                    {/* The centre line every piece is hung to. */}
                    <span
                      className="absolute left-0 origin-left border-t border-dashed border-[#a8853a] transition-[transform,opacity] duration-[1400ms] ease-out motion-reduce:transition-none"
                      style={{
                        top: `${s.line}%`,
                        width: `${CROP * 100}%`,
                        transform: `scaleX(${drawn ? 1 : 0})`,
                        opacity: step < 3 ? 1 : 0,
                      }}
                    />
                    <span
                      className={cn(tagText, fade, "absolute -translate-y-[calc(100%+0.6cqw)] text-[#7d6129]")}
                      style={{ top: `${s.line}%`, right: `${100 - CROP * 100 + 2.5}%`, opacity: drawn && step === 0 ? 1 : 0 }}
                    >
                      Centre line
                    </span>

                    {/* Floor to centre line. */}
                    <span
                      className="absolute w-px origin-bottom bg-ink/70 transition-[transform,opacity] delay-300 duration-1000 ease-out motion-reduce:transition-none"
                      style={{
                        left: `${s.dimensionX}%`,
                        top: `${s.line}%`,
                        height: `${s.floor - s.line}%`,
                        transform: `scaleY(${drawn ? 1 : 0})`,
                        opacity: step <= 1 ? 1 : 0,
                      }}
                    >
                      <span className="absolute -left-[0.6cqw] top-0 h-px w-[1.2cqw] bg-ink/70" />
                      <span className="absolute -left-[0.6cqw] bottom-0 h-px w-[1.2cqw] bg-ink/70" />
                    </span>
                    <span
                      className={cn(tagText, fade, "absolute -translate-y-1/2")}
                      style={{
                        left: `calc(${s.dimensionX}% + 1.4cqw)`,
                        top: `${(s.line + s.floor) / 2}%`,
                        opacity: drawn && step <= 1 ? 1 : 0,
                      }}
                    >
                      {EYE_LEVEL_CM} cm
                    </span>

                    {/* Overall width of the composition. */}
                    <span
                      className="absolute h-px bg-ink/70 transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none"
                      style={{
                        left: `${s.spanLeft}%`,
                        width: `${s.spanWidth}%`,
                        top: `${s.spanY}%`,
                        transform: `scaleX(${step === 1 ? 1 : 0})`,
                        opacity: step === 1 ? 1 : 0,
                      }}
                    >
                      <span className="absolute -top-[0.6cqw] left-0 h-[1.2cqw] w-px bg-ink/70" />
                      <span className="absolute -top-[0.6cqw] right-0 h-[1.2cqw] w-px bg-ink/70" />
                    </span>
                    <span
                      className={cn(tagText, fade, "absolute -translate-x-1/2 translate-y-[1.2cqw]")}
                      style={{
                        left: `${s.spanLeft + s.spanWidth / 2}%`,
                        top: `${s.spanY}%`,
                        opacity: step === 1 ? 1 : 0,
                      }}
                    >
                      {s.spanCm} cm
                    </span>

                    {/* Each frame set out on the wall before anything is made. */}
                    {s.frames.map((f, i) => (
                      <span
                        key={`plan-${i}`}
                        className={cn(fade, "absolute flex items-center justify-center border border-dashed border-ink/50")}
                        style={{
                          left: `${f.left}%`,
                          top: `${f.top}%`,
                          width: `${f.width}%`,
                          height: `${f.height}%`,
                          opacity: step === 1 ? 1 : 0,
                          transitionDelay: step === 1 ? `${i * 80}ms` : "0ms",
                        }}
                      >
                        <span className={tagText}>{f.label}</span>
                      </span>
                    ))}

                    {/* The frames: carried in, then levelled onto the line. */}
                    {s.frames.map((f, i) => {
                      const shown = step >= 2;
                      const hung = step >= 3;
                      return (
                        <span
                          key={`frame-${i}`}
                          className="absolute block bg-[#141312] transition-[opacity,transform,box-shadow] duration-[900ms] ease-out motion-reduce:transition-none"
                          style={{
                            left: `${f.left}%`,
                            top: `${f.top}%`,
                            width: `${f.width}%`,
                            height: `${f.height}%`,
                            padding: "calc(var(--cm) * 3)",
                            opacity: shown ? 1 : 0,
                            transform: hung
                              ? "none"
                              : `translateY(calc(var(--cm) * ${shown ? -4 : -14})) rotate(${f.tilt * (shown ? 1 : 2)}deg)`,
                            boxShadow: hung
                              ? "0 calc(var(--cm) * 0.3) calc(var(--cm) * 0.6) rgba(0,0,0,0.22), 0 calc(var(--cm) * 1.6) calc(var(--cm) * 3) calc(var(--cm) * -1) rgba(40,30,20,0.35)"
                              : "0 calc(var(--cm) * 2) calc(var(--cm) * 3) rgba(0,0,0,0.08), 0 calc(var(--cm) * 7) calc(var(--cm) * 10) calc(var(--cm) * -3) rgba(40,30,20,0.26)",
                            transitionDelay: `${i * 90}ms`,
                          }}
                        >
                          <span
                            className="block h-full w-full bg-[#f6f4ef] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                            style={{ padding: "calc(var(--cm) * 4.5)" }}
                          >
                            {/* Our own vector artwork, served as is. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.art} alt="" className="block h-full w-full object-cover" />
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  <p
                    key={step}
                    className="story-swap absolute left-[3cqw] top-[3cqw] rounded-full bg-ink/90 px-[0.9em] py-[0.5em] text-[clamp(12px,1.6cqw,13px)] leading-none text-bone"
                  >
                    {notes[step]}
                  </p>

                  {/* The price of what is on the wall, from the published list. */}
                  <div
                    className={cn(
                      "absolute bottom-[3cqw] left-[3cqw] right-[3cqw] max-w-[22rem] rounded-[10px] bg-ink/90 px-[1.1em] py-[0.85em] text-[clamp(12px,1.7cqw,14px)] text-bone transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                      step === 3 ? "translate-y-0 opacity-100 delay-300" : "translate-y-2 opacity-0",
                    )}
                  >
                    <p className="flex items-baseline justify-between gap-4">
                      <span>{s.product.name}</span>
                      <span className="tabular-nums">{formatGhs(s.total)}</span>
                    </p>
                    <p className="mt-1 text-bone/60">{s.mix} inch frames, installed</p>
                  </div>
                </div>

                <figcaption className="mt-3 max-w-[62ch] text-[13px] leading-relaxed text-bone/50 text-pretty">
                  A sample room from the visualizer, drawn to scale: {s.room.wallCm} cm of wall, measured against{" "}
                  {s.room.measuredAgainst}.
                </figcaption>
              </figure>

              {/* On a phone the chapters sit under the stage, one at a time. */}
              <div className="mx-auto mt-5 max-w-xl lg:hidden">
                <div className="grid grid-cols-4 gap-3">
                  {processSteps.map((st, i) => (
                    <button
                      key={st.title}
                      type="button"
                      onClick={() => go(i)}
                      aria-current={i === step ? "step" : undefined}
                      className="min-h-11 text-left"
                    >
                      <span aria-hidden className="relative block h-px overflow-hidden bg-bone/15">
                        <span
                          className={cn(
                            "absolute inset-0 origin-left bg-kasa-gold transition-transform duration-500 motion-reduce:transition-none",
                            i <= step ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          "mt-2.5 block text-[13px] transition-colors",
                          i === step ? "text-bone" : "text-bone/50",
                        )}
                      >
                        {st.title}
                      </span>
                    </button>
                  ))}
                </div>
                <p
                  key={step}
                  className="story-swap mt-3 min-h-[6.25rem] text-[15px] leading-relaxed text-bone/60 text-pretty"
                >
                  {processSteps[step].body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
