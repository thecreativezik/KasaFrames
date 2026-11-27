"use client";

import * as React from "react";
import Link from "next/link";
import { GalleryImage } from "@/components/gallery/gallery-image";
import { familyLabel } from "@/lib/data/gallery";
import { HANG_GAP, type HangPiece } from "@/lib/home-hang";
import { EYE_LEVEL_CM } from "@/lib/visualizer";

/** How long the light takes to catch up with the pointer, in ms. */
const LIGHT_LAG = 110;

interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
  shadow: HTMLElement | null;
  shade: HTMLElement | null;
  sheen: HTMLElement | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Finished projects hung along one gold centre line, the way the studio hangs
 * a customer's wall: every piece centred on the same height.
 *
 * The wall is lit like a gallery. The lights come up piece by piece once the
 * work is hung, and on a desktop the pointer is the lamp: the wall warms where
 * it points, each frame's shadow falls away from it and the glass catches it.
 * With no pointer, and on a phone, the light rests above the piece in view.
 * With reduced motion it still lights the piece in view, without moving.
 */
export function HeroHang({ pieces }: { pieces: HangPiece[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const wallRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLSpanElement>(null);
  const scrollFrame = React.useRef(0);
  const settleLight = React.useRef<(() => void) | null>(null);

  const centrepiece = React.useMemo(
    () => pieces.reduce((best, p, i) => (p.h > pieces[best].h ? i : best), 0),
    [pieces],
  );
  const [active, setActive] = React.useState(centrepiece);
  const activeRef = React.useRef(centrepiece);
  const tallest = pieces.reduce((max, p) => Math.max(max, p.h), 0);

  const followScroll = React.useCallback(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth + 1) return;
    const box = track.getBoundingClientRect();
    const middle = box.left + box.width / 2;
    let best = 0;
    let distance = Infinity;
    track.querySelectorAll<HTMLElement>("[data-piece]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - middle);
      if (d < distance) {
        distance = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  // A phone opens on the centrepiece rather than the edge of the wall.
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth + 1) return;
    const piece = track.querySelectorAll<HTMLElement>("[data-piece]")[centrepiece];
    if (!piece) return;
    track.scrollLeft = piece.offsetLeft + piece.offsetWidth / 2 - track.clientWidth / 2;
  }, [centrepiece]);

  React.useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);

  // The light. Everything here writes transforms and opacity straight onto
  // the elements, once a frame and only while the light is still moving.
  React.useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const light = { x: 0, y: 0, reach: 1, tx: 0, ty: 0, treach: 1 };
    let spots: Spot[] = [];
    let frame = 0;
    let last = 0;
    let pointing = false;

    const measure = () => {
      spots = Array.from(wall.querySelectorAll<HTMLElement>("[data-piece]"), (el) => ({
        x: el.offsetLeft + el.offsetWidth / 2,
        y: el.offsetTop + el.offsetHeight / 2,
        w: el.offsetWidth,
        h: el.offsetHeight,
        shadow: el.querySelector<HTMLElement>("[data-shadow]"),
        shade: el.querySelector<HTMLElement>("[data-shade]"),
        sheen: el.querySelector<HTMLElement>("[data-sheen]"),
      }));
    };

    const paint = () => {
      const { x, y, reach } = light;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
      for (const s of spots) {
        const dx = s.x - x;
        const dy = s.y - y;
        const lit = clamp(1 - Math.hypot(dx, dy) / reach, 0, 1);
        // Shadows fall away from the lamp, and a little down, since it hangs above.
        if (s.shadow) {
          const sx = clamp(dx * 0.05, -26, 26);
          const sy = clamp(dy * 0.05, -8, 24) + 12;
          s.shadow.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
          s.shadow.style.opacity = (0.45 + 0.5 * lit).toFixed(3);
        }
        if (s.shade) s.shade.style.opacity = (0.42 * (1 - lit) ** 1.5).toFixed(3);
        // The reflection slides across the glass the opposite way to the lamp.
        if (s.sheen) {
          const along = clamp(-dx / Math.max(1, s.w), -1.3, 1.3) * 80;
          s.sheen.style.transform = `translate3d(${along.toFixed(1)}%, 0, 0) skewX(-16deg)`;
          s.sheen.style.opacity = (lit * lit).toFixed(3);
        }
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const k = 1 - Math.exp(-dt / LIGHT_LAG);
      light.x += (light.tx - light.x) * k;
      light.y += (light.ty - light.y) * k;
      light.reach += (light.treach - light.reach) * k;
      paint();
      const left = Math.abs(light.tx - light.x) + Math.abs(light.ty - light.y) + Math.abs(light.treach - light.reach);
      if (left > 0.4) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        last = 0;
      }
    };

    const aim = (x: number, y: number, reach: number, snap = false) => {
      light.tx = x;
      light.ty = y;
      light.treach = reach;
      if (snap || still.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        light.x = x;
        light.y = y;
        light.reach = reach;
        paint();
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Resting, it washes down the piece in view from just above its middle and
    // reaches most of the wall.
    const rest = (snap = false) => {
      const s = spots[activeRef.current] ?? spots[0];
      if (!s) return;
      aim(s.x, s.y - s.h * 0.3, Math.max(420, wall.clientWidth * 0.75), snap);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || still.matches) return;
      pointing = true;
      const box = wall.getBoundingClientRect();
      aim(event.clientX - box.left, event.clientY - box.top, Math.max(380, wall.clientWidth * 0.36));
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointing = false;
      rest();
    };

    measure();
    rest(true);
    // Only now that it sits in the right place may the light come up.
    glowRef.current?.setAttribute("data-on", "");

    const resized = new ResizeObserver(() => {
      measure();
      if (pointing) paint();
      else rest(true);
    });
    resized.observe(wall);
    wall.addEventListener("pointermove", onMove);
    wall.addEventListener("pointerleave", onLeave);
    settleLight.current = () => {
      if (!pointing) rest();
    };

    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      wall.removeEventListener("pointermove", onMove);
      wall.removeEventListener("pointerleave", onLeave);
      settleLight.current = null;
    };
  }, []);

  // A new piece in view (a swipe, or keyboard focus) moves the resting light to it.
  React.useEffect(() => {
    activeRef.current = active;
    settleLight.current?.();
  }, [active]);

  if (pieces.length === 0) return null;
  const current = pieces[active]?.item ?? pieces[0].item;

  return (
    <div className="hang relative mt-10 flex flex-1 flex-col lg:mt-4" style={{ "--tall": tallest } as React.CSSProperties}>
      <div
        ref={trackRef}
        onScroll={() => {
          cancelAnimationFrame(scrollFrame.current);
          scrollFrame.current = requestAnimationFrame(followScroll);
        }}
        className="flex flex-1 snap-x snap-mandatory items-center overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        <div ref={wallRef} className="relative w-max min-w-full shrink-0 px-[5vw] py-14 lg:py-8">
          {/* The lamp's pool of light, kept to the band of wall the work hangs
              on and faded out at its top and bottom so it never shows an edge. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]"
          >
            <span
              ref={glowRef}
              className="hang-glow absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,236,204,0.19),rgba(255,236,204,0.07)_46%,transparent)] lg:h-[54rem] lg:w-[54rem]"
            />
          </span>
          <span aria-hidden className="hang-line pointer-events-none absolute inset-x-0 top-1/2 h-px bg-kasa-gold/60" />
          <span
            aria-hidden
            className="hang-tick pointer-events-none absolute left-[2.5vw] top-1/2 h-2.5 w-px -translate-y-1/2 bg-kasa-gold"
          />
          <ul className="flex items-center justify-center" style={{ gap: `calc(var(--u) * ${HANG_GAP})` }}>
            {pieces.map((p, i) => (
              <li
                key={p.item.id}
                data-piece
                className="hang-in relative isolate shrink-0 snap-center"
                style={{ "--i": i } as React.CSSProperties}
              >
                {/* Its shadow on the wall. Lifting the piece opens the gap. */}
                <span
                  data-shadow
                  aria-hidden
                  className="pointer-events-none absolute inset-[5%] -z-10 translate-y-3 rounded-[2px] bg-black opacity-70 blur-[18px]"
                />
                <Link
                  href={`/gallery?finish=${p.item.family}`}
                  aria-label={`${p.item.title}, ${p.item.room}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="relative block rounded-[2px] transition-transform duration-500 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 active:scale-[0.99]"
                  style={{
                    height: `calc(var(--u) * ${p.h})`,
                    width: `calc(var(--u) * ${(p.h * p.item.ratio).toFixed(3)})`,
                  }}
                >
                  {/* A slim black moulding, its top edge catching the light. */}
                  <span className="relative block h-full w-full rounded-[2px] bg-[#131211] p-[calc(var(--u)*0.32)] shadow-[inset_0_1px_0_rgba(244,242,237,0.08),inset_0_0_0_1px_rgba(0,0,0,0.5)]">
                    <span className="relative block h-full w-full overflow-hidden bg-ink-raised">
                      <GalleryImage
                        item={p.item}
                        priority={i < 4}
                        className="object-cover"
                        sizes="(max-width: 1023px) 60vw, 22vw"
                      />
                      <span
                        data-sheen
                        aria-hidden
                        className="pointer-events-none absolute inset-y-[-10%] left-1/4 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,250,240,0.09)_50%,transparent)] opacity-0"
                        style={{ transform: "skewX(-16deg)" }}
                      />
                    </span>
                    <span data-shade aria-hidden className="pointer-events-none absolute inset-0 rounded-[2px] bg-ink opacity-[0.12]" />
                    <span aria-hidden className="hang-lamp pointer-events-none absolute inset-0 rounded-[2px] bg-ink" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="shell grid gap-3 pb-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-10 lg:pb-8">
        <div key={current.id} className="hang-label min-w-0">
          <p className="text-[15px] tracking-[-0.01em] text-bone">{current.title}</p>
          <p className="mt-1 text-[13px] text-bone/50">
            {familyLabel(current.family)} · {current.room} · {current.sizes}
          </p>
        </div>
        <p className="max-w-[36ch] text-[13px] leading-relaxed text-bone/50 sm:text-right">
          Every piece centred on one line, {EYE_LEVEL_CM} cm off the floor, the way we hang yours.
        </p>
      </div>
    </div>
  );
}
