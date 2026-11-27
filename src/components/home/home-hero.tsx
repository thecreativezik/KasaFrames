"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera } from "lucide-react";
import { HeroHang } from "@/components/home/hero-hang";
import type { HangPiece } from "@/lib/home-hang";
import { handOverWall } from "@/lib/wall-handoff";

type WallStatus = "idle" | "opening" | "not-a-photo";

/** True while the thing being dragged is a file, not text or a link. */
const carriesFiles = (event: React.DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

/**
 * The headline and two ways forward, then the studio's own work hung along a
 * single centre line under a gallery light.
 *
 * The first way is a consultation. The second puts frames on the visitor's
 * own wall: a photo, picked here or dropped anywhere on the hero, opens in the
 * visualizer and never leaves their device.
 */
export function HomeHero({ hang }: { hang: HangPiece[] }) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const [status, setStatus] = React.useState<WallStatus>("idle");

  React.useEffect(() => {
    router.prefetch("/visualizer");
  }, [router]);

  const openWall = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("not-a-photo");
      return;
    }
    handOverWall(file);
    setStatus("opening");
    router.push("/visualizer");
  };

  return (
    <section
      aria-labelledby="hero-title"
      onDragEnter={(e) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        if (!carriesFiles(e)) return;
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        if (!carriesFiles(e)) return;
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        openWall(e.dataTransfer.files[0]);
      }}
      className="relative flex flex-col overflow-clip pt-10 sm:pt-14 lg:min-h-[calc(100svh-80px)] lg:pt-12"
    >
      <div className="shell">
        <h1 id="hero-title" className="max-w-[12em] text-display-xl text-balance">
          <span className="hero-line">
            <span style={{ "--d": "0.05s" } as React.CSSProperties}>Luxury wall aesthetics</span>
          </span>{" "}
          <span className="hero-line text-bone/50">
            <span style={{ "--d": "0.15s" } as React.CSSProperties}>for modern spaces.</span>
          </span>
        </h1>

        <div className="hero-fade mt-8 grid gap-7 border-t border-bone/10 pt-6 lg:mt-9 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-12">
          <p className="max-w-xl text-lead font-light text-bone/60 text-pretty">
            Transform empty walls into statement compositions, curated like interior architecture and installed with
            white-glove precision.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/book"
              className="group flex items-center gap-4 rounded-full bg-bone p-2 text-ink shadow-[0_20px_50px_-24px_rgba(244,242,237,0.35)] transition-[background-color,transform] duration-300 ease-out hover:bg-white active:scale-[0.98]"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full sm:h-14 sm:w-14">
                <Image
                  src="/media/gallery-wall/black-frame-grid-six.jpg"
                  alt=""
                  fill
                  priority
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col pr-1">
                <span className="text-[16px] font-medium leading-tight tracking-[-0.02em] sm:text-[17px]">
                  Book a consultation
                </span>
                <span className="mt-0.5 truncate text-[13px] text-ink/60">No fee. At home or on a video call.</span>
              </span>
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-bone sm:h-14 sm:w-14">
                <ArrowRight
                  aria-hidden
                  className="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-10"
                />
                <ArrowRight
                  aria-hidden
                  className="absolute h-5 w-5 -translate-x-10 transition-transform duration-500 ease-out group-hover:translate-x-0"
                />
              </span>
            </Link>

            <button
              type="button"
              disabled={status === "opening"}
              onClick={() => fileRef.current?.click()}
              className="group flex items-center gap-4 rounded-full border border-bone/20 p-2 pr-6 text-left text-bone transition-[border-color,background-color,transform] duration-300 ease-out hover:border-bone/45 hover:bg-bone/[0.04] active:scale-[0.98] disabled:cursor-progress disabled:opacity-70"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bone/[0.08] transition-colors duration-300 group-hover:bg-bone/[0.14] sm:h-14 sm:w-14">
                <Camera aria-hidden className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[16px] font-medium leading-tight tracking-[-0.02em] sm:text-[17px]">
                  {status === "opening" ? "Opening your wall…" : "See it on your wall"}
                </span>
                <span className="mt-0.5 text-[13px] text-bone/50">From a photo, on your device</span>
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                openWall(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <p role="status" className="text-[13px] text-bone/60 xl:text-right">
          {status === "not-a-photo" ? (
            <span className="mt-3 block">That file is not a photo. Try a JPG or PNG from your camera roll.</span>
          ) : null}
        </p>
      </div>

      <HeroHang pieces={hang} />

      {dragging ? (
        <div
          aria-hidden
          className="hero-drop pointer-events-none absolute inset-0 z-30 grid place-items-center bg-ink/85 backdrop-blur-sm"
        >
          <span className="absolute inset-3 rounded-panel border border-dashed border-kasa-gold/70 sm:inset-5" />
          <div className="relative max-w-md px-6 text-center">
            <Camera className="mx-auto h-6 w-6 text-kasa-gold" />
            <p className="mt-5 text-display-sm text-balance">Let go to see frames on your wall.</p>
            <p className="mt-3 text-[15px] text-bone/60 text-pretty">
              Your photo opens in the visualizer. It stays on your device.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
