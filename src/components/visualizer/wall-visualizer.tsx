"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Crop,
  ImagePlus,
  Info,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  RotateCw,
  Ruler,
  Scan,
  ScanLine,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FrameView, WallStage } from "@/components/visualizer/wall-stage";
import { getProduct, INSTALLATION_GHS, type ProductId } from "@/lib/data/catalog";
import {
  aspectFromQuad,
  detectWallQuad,
  fittedQuad,
  imageToPlane,
  planeToImage,
  wallWidthFromReference,
  type Point,
  type Quad,
} from "@/lib/perspective";
import { cn, formatGhs } from "@/lib/utils";
import {
  CM_PER_INCH,
  costOf,
  downscaleImage,
  artPanLimit,
  EYE_LEVEL_CM,
  hangHeightCm,
  pieceCm,
  yPctForHang,
  saveComposition,
  SCALE_REFERENCES,
  STYLES,
  STYLE_PRODUCT,
  type FrameStyle,
  type Piece,
} from "@/lib/visualizer";

/** The three faces of the inspector: choosing frames, editing one, setting up the wall. */
type Panel = "frames" | "piece" | "wall";

type Preset = "single" | "triptych" | "grid" | "stair";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "single", label: "Single" },
  { key: "triptych", label: "Triptych" },
  { key: "grid", label: "2 × 3 grid" },
  { key: "stair", label: "Staircase" },
];

interface SampleRoom {
  id: string;
  label: string;
  src: string;
  /** Width of the marked wall in cm, measured off the furniture—never guessed. */
  wallCm: number;
  /**
   * Height of the same wall. The corners imply it, but stating it stops the
   * first render using a height carried over from the room before this one.
   */
  wallHeightCm: number;
  /**
   * The wall in the photo, bottom edge on the skirting. Everything is hung
   * against this, so a piece's height above the floor is a real number.
   */
  quad: Quad;
  /** What we put the tape to, shown to the customer so the scale is checkable. */
  measuredAgainst: string;
}

/**
 * The sample rooms, each one calibrated rather than estimated.
 *
 * A frame is drawn at cm per pixel, so the whole illusion rests on how wide the
 * wall really is. These three were measured against furniture of known size—a
 * sofa, a sideboard—which is why a 20 × 30 in print lands at the size it would
 * actually be in the room instead of a third too big.
 */
const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: "lilac-lounge",
    label: "Lilac corner",
    src: "/media/rooms/lilac-lounge.jpg",
    wallCm: 310,
    wallHeightCm: 554,
    // A real corner, so the wall recedes: the right-hand edge is the corner
    // itself, traced along the cornice above and the skirting below.
    quad: [
      { x: 0, y: 0 },
      { x: 0.657, y: 0.169 },
      { x: 0.657, y: 0.817 },
      { x: 0, y: 0.851 },
    ],
    measuredAgainst: "the 200 cm sofa against it",
  },
  {
    id: "loft-sofa",
    label: "Loft lounge",
    src: "/media/rooms/loft-sofa.jpg",
    wallCm: 595,
    wallHeightCm: 319,
    quad: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.951 },
      { x: 0, y: 0.951 },
    ],
    measuredAgainst: "the 230 cm sofa in front of it",
  },
  {
    id: "warm-sideboard",
    label: "Warm sideboard",
    src: "/media/rooms/warm-sideboard.jpg",
    wallCm: 403,
    wallHeightCm: 216,
    quad: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.951 },
      { x: 0, y: 0.951 },
    ],
    measuredAgainst: "the 155 cm sideboard below it",
  },
];

let counter = 1;
const uid = () => `p${counter++}`;

export function WallVisualizer() {
  const router = useRouter();

  const [roomSrc, setRoomSrc] = React.useState(SAMPLE_ROOMS[0].src);
  const [wallCm, setWallCm] = React.useState(SAMPLE_ROOMS[0].wallCm);
  const [wallHeightCm, setWallHeightCm] = React.useState(SAMPLE_ROOMS[0].wallHeightCm);
  const [quad, setQuad] = React.useState<Quad>(SAMPLE_ROOMS[0].quad);
  const [quadMode, setQuadMode] = React.useState<"fitted" | "custom">("custom");
  const [scaleNote, setScaleNote] = React.useState<string | null>(
    `Measured against ${SAMPLE_ROOMS[0].measuredAgainst}.`,
  );
  const [imgSize, setImgSize] = React.useState({ w: 0, h: 0 });
  const [adjustingWall, setAdjustingWall] = React.useState(false);
  const [adjustingArt, setAdjustingArt] = React.useState(false);
  const [measuring, setMeasuring] = React.useState(false);
  const [measure, setMeasure] = React.useState<{ a: Point; b: Point } | null>(null);
  const [referenceKey, setReferenceKey] = React.useState("sofa-3");
  const [referenceCm, setReferenceCm] = React.useState(200);
  const [calibrated, setCalibrated] = React.useState(true);
  const [showRule, setShowRule] = React.useState(false);
  const [wallNote, setWallNote] = React.useState<string | null>(null);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<FrameStyle>("black-mat");
  const [sizeLabel, setSizeLabel] = React.useState("");
  const [installation, setInstallation] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<Panel>("frames");

  const stageRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<{ id: string; dxPct: number; dyPct: number } | null>(null);
  const cornerRef = React.useRef<number | null>(null);
  const measureRef = React.useRef<"a" | "b" | null>(null);
  const artRef = React.useRef<{ id: string; x: number; y: number; artX: number; artY: number } | null>(null);
  const pendingDetect = React.useRef(false);

  // Letting go of a piece puts the inspector back on choosing frames.
  React.useEffect(() => {
    if (!selectedId) setPanel((p) => (p === "piece" ? "frames" : p));
  }, [selectedId]);

  const product = getProduct(STYLE_PRODUCT[style]);
  const selected = pieces.find((p) => p.id === selectedId) ?? null;
  const cost = costOf(pieces, installation);

  // Offer a size that suits the wall rather than a fixed rung on the list. The
  // smallest frames are only ever right on a small wall, and starting there is
  // what makes a visualizer look broken: the piece is correct but invisible.
  React.useEffect(() => {
    if (!product) return;
    if (product.sizes.some((s) => s.label === sizeLabel)) return;

    // Roughly a fifth of the wall: the proportion a single piece usually wants,
    // and it lands on 20 × 30 in for an ordinary living-room wall.
    const target = wallCm * 0.18;
    const fits = product.sizes.filter((s) => s.widthIn * CM_PER_INCH <= target);
    const pick = fits.length > 0 ? fits[fits.length - 1] : product.sizes[0];
    setSizeLabel(pick.label);
  }, [product, sizeLabel, wallCm]);

  // Track the photo's rendered size so an untouched wall can be fitted to it.
  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const measure = () => setImgSize({ w: img.clientWidth, h: img.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(img);
    measure();
    return () => observer.disconnect();
  }, [roomSrc]);

  // While nobody has placed the corners themselves, keep the wall rectangle
  // shaped like the wall, so a portrait piece stays portrait.
  React.useEffect(() => {
    if (quadMode !== "fitted" || imgSize.w === 0 || imgSize.h === 0) return;
    setQuad(fittedQuad(imgSize.w, imgSize.h, wallCm, wallHeightCm));
  }, [quadMode, imgSize, wallCm, wallHeightCm]);

  // Once the corners sit on a real rectangle, the photo already knows its
  // proportions—so the height follows from the width rather than a second guess.
  React.useEffect(() => {
    if (quadMode !== "custom" || imgSize.w === 0 || imgSize.h === 0) return;
    const aspect = aspectFromQuad(quad, imgSize.w, imgSize.h);
    if (!aspect) return;
    const derived = Math.round(clamp(wallCm / aspect, 150, 700));
    setWallHeightCm((prev) => (Math.abs(prev - derived) > 1 ? derived : prev));
  }, [quadMode, quad, imgSize, wallCm]);

  /** Reads the wall out of the photograph; falls back to a flat rectangle. */
  const detect = React.useCallback((announce: boolean) => {
    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) {
      pendingDetect.current = true;
      return;
    }

    const found = detectWallQuad(img);
    if (found) {
      setQuad(found);
      setQuadMode("custom");
      setWallNote("We read the wall from your photo. Drag the gold corners if it is not quite right.");
    } else {
      setQuadMode("fitted");
      if (announce) {
        setWallNote("We could not read the angle of this wall. Drag the gold corners onto it and the frames will follow.");
      }
    }
  }, []);

  /**
   * Loads a sample room with the wall we already measured, or an uploaded photo
   * whose scale is still unknown. Nothing is auto-detected over a sample: we
   * traced its corners by hand and a guess would only make it worse.
   */
  function loadRoom(src: string, sample?: SampleRoom) {
    setRoomSrc(src);
    setPieces([]);
    setSelectedId(null);
    setWallNote(null);
    setMeasuring(false);
    setMeasure(null);

    if (sample) {
      setWallCm(sample.wallCm);
      setWallHeightCm(sample.wallHeightCm);
      setQuad(sample.quad);
      setQuadMode("custom");
      setCalibrated(true);
      setScaleNote(`Measured against ${sample.measuredAgainst}.`);
      pendingDetect.current = false;
      return;
    }

    // A new photo is a new room; the old measurement no longer applies.
    setQuadMode("fitted");
    setCalibrated(false);
    setScaleNote(null);
    pendingDetect.current = true;
  }

  function startMeasuring() {
    // Lay the line across the lower middle of the photo, where furniture
    // usually sits, so both ends start somewhere useful.
    setMeasure({ a: { x: 0.3, y: 0.72 }, b: { x: 0.7, y: 0.72 } });
    setMeasuring(true);
    setAdjustingWall(false);
    setAdjustingArt(false);
    setPanel("wall");
  }

  function cancelMeasuring() {
    setMeasuring(false);
    setMeasure(null);
  }

  /** Turns the measured line into the wall's width, which sets every size. */
  function finishMeasuring() {
    if (measure) {
      const aspect = wallHeightCm > 0 ? wallCm / wallHeightCm : 1;
      const derived = wallWidthFromReference(quad, measure.a, measure.b, referenceCm, aspect);

      if (derived) {
        const rounded = Math.round(derived);
        // Keep the wall's shape: the corners fixed the proportions, so the
        // height has to move with the width rather than stay put.
        setWallHeightCm(Math.round(clamp(rounded / aspect, 150, 700)));
        setWallCm(clamp(rounded, 100, 900));
        setCalibrated(true);
        setScaleNote(
          `Measured against ${referenceCm} cm of ${
            SCALE_REFERENCES.find((r) => r.key === referenceKey)?.label.toLowerCase() ?? "your reference"
          }.`,
        );
        setNotice(null);
      } else {
        setNotice("That measurement did not land on the wall. Put both dots inside the room and try again.");
      }
    }

    setMeasuring(false);
    setMeasure(null);
  }

  function currentSize() {
    return product?.sizes.find((s) => s.label === sizeLabel) ?? product?.sizes[0];
  }

  function basePiece(): Omit<Piece, "id" | "xPct" | "yPct"> | null {
    const size = currentSize();
    if (!product || !size) return null;
    return {
      productId: product.id as ProductId,
      sizeLabel: size.label,
      rotation: 0,
      style,
      rotated: false,
    };
  }

  /** The hanging line, in wall percent. New pieces land on it by default. */
  const eyeLevelPct = yPctForHang(EYE_LEVEL_CM, wallHeightCm);

  function addPiece() {
    const base = basePiece();
    if (!base) return;
    const piece: Piece = {
      ...base,
      id: uid(),
      // Straight onto the hanging line, offset sideways so a second piece does
      // not land exactly on the first. Starting at a believable height is half
      // of what makes the mockup read as real.
      xPct: clamp(42 + (pieces.length % 4) * 6, 5, 95),
      yPct: clamp(eyeLevelPct, 5, 95),
    };
    setPieces((prev) => [...prev, piece]);
    setSelectedId(piece.id);
  }

  function applyPreset(preset: Preset) {
    const base = basePiece();
    const size = currentSize();
    if (!base || !size) return;

    // Percentages are of the wall itself now, so the arithmetic is just
    // centimetres over wall size—no screen pixels involved.
    const wPct = ((size.widthIn * CM_PER_INCH) / wallCm) * 100;
    const hPct = ((size.heightIn * CM_PER_INCH) / wallHeightCm) * 100;
    const gapXPct = (6 / wallCm) * 100;
    const gapYPct = (6 / wallHeightCm) * 100;

    // Every layout is centred on the hanging line, the way an installer would
    // set it out: the middle of the arrangement at 145 cm, not the top piece.
    const line = eyeLevelPct;
    const next: Piece[] = [];

    if (preset === "single") {
      next.push({ ...base, id: uid(), xPct: 50, yPct: line });
    }

    if (preset === "triptych") {
      const stepX = wPct + gapXPct;
      [-1, 0, 1].forEach((i) => next.push({ ...base, id: uid(), xPct: 50 + i * stepX, yPct: line }));
    }

    if (preset === "grid") {
      const stepX = wPct + gapXPct;
      const stepY = hPct + gapYPct;
      [-1, 0].forEach((row) =>
        [-1, 0, 1].forEach((col) =>
          next.push({ ...base, id: uid(), xPct: 50 + col * stepX, yPct: line + (row + 0.5) * stepY }),
        ),
      );
    }

    if (preset === "stair") {
      const stepX = wPct + gapXPct;
      const stepY = hPct * 0.45;
      const startX = 50 - stepX * 2;
      // A stair climbs past the hanging line rather than sitting on it, so
      // centre the run on it instead.
      const startY = line + stepY * 2;
      [0, 1, 2, 3, 4].forEach((i) =>
        next.push({ ...base, id: uid(), xPct: startX + i * stepX, yPct: startY - i * stepY }),
      );
    }

    setPieces(next.map((p) => ({ ...p, xPct: clamp(p.xPct, 3, 97), yPct: clamp(p.yPct, 3, 97) })));
    setSelectedId(null);
  }

  function updateSelected(patch: Partial<Piece>) {
    if (!selectedId) return;
    setPieces((prev) => prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)));
  }

  function tiltAll(rotation: number) {
    setPieces((prev) => prev.map((p) => ({ ...p, rotation })));
  }

  async function onRoomFile(file?: File) {
    if (!file) return;
    setNotice(null);
    try {
      const src = await downscaleImage(file);
      loadRoom(src);
    } catch {
      setNotice("We couldn't read that image. Try a JPG or PNG from your camera roll.");
    }
  }

  async function onArtFile(file?: File) {
    if (!file || !selectedId) return;
    try {
      updateSelected({ artUrl: await downscaleImage(file, 900) });
    } catch {
      setNotice("We couldn't read that image.");
    }
  }

  /** Pointer position as a fraction of the room photo. */
  function pointerOnImage(event: React.PointerEvent): Point | null {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }

  /** …and the same point in wall coordinates, as percentages. */
  function pointerOnWall(event: React.PointerEvent) {
    const onImage = pointerOnImage(event);
    if (!onImage) return null;
    const onPlane = imageToPlane(quad, onImage);
    return onPlane ? { x: onPlane.x * 100, y: onPlane.y * 100 } : null;
  }

  const onPointerDownPiece = (id: string) => (event: React.PointerEvent) => {
    const piece = pieces.find((p) => p.id === id);
    const at = pointerOnWall(event);
    if (!piece || !at) return;

    setSelectedId(id);
    setPanel("piece");

    // While the photo is being framed, a drag inside the piece moves the photo
    // rather than the frame—the frame is where the customer wants it by then.
    if (adjustingArt && piece.id === selectedId && piece.artUrl) {
      artRef.current = { id, x: at.x, y: at.y, artX: piece.artX ?? 0, artY: piece.artY ?? 0 };
    } else {
      dragRef.current = { id, dxPct: at.x - piece.xPct, dyPct: at.y - piece.yPct };
    }

    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  /** Zooming the photo with the wheel, the way any photo cropper behaves. */
  const onWheel = (event: React.WheelEvent) => {
    if (!adjustingArt || !selected?.artUrl) return;
    const zoom = clamp((selected.artZoom ?? 1) - event.deltaY * 0.0015, 1, 4);
    const limit = artPanLimit({ ...selected, artZoom: zoom });
    updateSelected({
      artZoom: zoom,
      artX: clamp(selected.artX ?? 0, -limit, limit),
      artY: clamp(selected.artY ?? 0, -limit, limit),
    });
  };

  const onMeasurePointerDown = (end: "a" | "b") => (event: React.PointerEvent) => {
    measureRef.current = end;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const onCornerPointerDown = (index: number) => (event: React.PointerEvent) => {
    cornerRef.current = index;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (measureRef.current) {
      const at = pointerOnImage(event);
      if (!at) return;
      const end = measureRef.current;
      setMeasure((prev) =>
        prev ? { ...prev, [end]: { x: clamp(at.x, 0, 1), y: clamp(at.y, 0, 1) } } : prev,
      );
      return;
    }

    if (cornerRef.current !== null) {
      const at = pointerOnImage(event);
      if (!at) return;
      const index = cornerRef.current;
      setQuadMode("custom");
      setQuad((prev) => {
        const next = [...prev] as Quad;
        next[index] = { x: clamp(at.x, 0, 1), y: clamp(at.y, 0, 1) };
        return next;
      });
      return;
    }

    const art = artRef.current;
    if (art) {
      const at = pointerOnWall(event);
      const piece = pieces.find((p) => p.id === art.id);
      if (!at || !piece) return;

      // Pointer movement arrives in wall percent; the photo pans in percent of
      // its own frame, so scale by how much wall this piece covers.
      const { wCm, hCm } = pieceCm(piece);
      const widthPct = (wCm / wallCm) * 100;
      const heightPct = (hCm / wallHeightCm) * 100;
      if (widthPct === 0 || heightPct === 0) return;

      const limit = artPanLimit(piece);
      setPieces((prev) =>
        prev.map((p) =>
          p.id === art.id
            ? {
                ...p,
                artX: clamp(art.artX + ((at.x - art.x) / widthPct) * 100, -limit, limit),
                artY: clamp(art.artY + ((at.y - art.y) / heightPct) * 100, -limit, limit),
              }
            : p,
        ),
      );
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;

    const at = pointerOnWall(event);
    if (!at) return;

    let xPct = at.x - drag.dxPct;
    let yPct = at.y - drag.dyPct;

    // Snap to the 145 cm hanging line first, so letting go anywhere near it
    // gives a height a real installer would have used.
    if (Math.abs(yPct - eyeLevelPct) < 1.2) yPct = eyeLevelPct;

    // Then to the line the other pieces share. In wall coordinates this is a
    // real hanging line, not just something that looks aligned on screen.
    const others = pieces.filter((p) => p.id !== drag.id);
    if (others.length > 0) {
      const line = others.reduce((sum, p) => sum + p.yPct, 0) / others.length;
      if (Math.abs(yPct - line) < 1.5) yPct = line;
      const nearestX = others.reduce(
        (best, p) => (Math.abs(p.xPct - xPct) < Math.abs(best - xPct) ? p.xPct : best),
        Infinity,
      );
      if (Math.abs(nearestX - xPct) < 1) xPct = nearestX;
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === drag.id ? { ...p, xPct: clamp(xPct, -5, 105), yPct: clamp(yPct, -5, 105) } : p)),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
    cornerRef.current = null;
    artRef.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!selected) return;

    if (event.key === "Escape") {
      setSelectedId(null);
      event.preventDefault();
      return;
    }
    const step = event.shiftKey ? 2 : 0.4;

    if (event.key === "Delete" || event.key === "Backspace") {
      setPieces((prev) => prev.filter((p) => p.id !== selected.id));
      setSelectedId(null);
      event.preventDefault();
      return;
    }

    if (event.key === "[" || event.key === "]") {
      updateSelected({ rotation: clamp(selected.rotation + (event.key === "[" ? -1 : 1), -60, 60) });
      event.preventDefault();
      return;
    }

    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    const move = moves[event.key];
    if (!move) return;
    updateSelected({ xPct: clamp(selected.xPct + move[0], -5, 105), yPct: clamp(selected.yPct + move[1], -5, 105) });
    event.preventDefault();
  };

  function openPreview() {
    const ok = saveComposition({
      roomSrc,
      wallCm,
      wallHeightCm,
      quad,
      installation,
      pieces,
      savedAt: new Date().toISOString(),
    });
    if (!ok) {
      setNotice("That room photo is too large to carry to the preview. Try a smaller image.");
      return;
    }
    router.push("/visualizer/preview");
  }

  const sizes = product?.sizes ?? [];
  const tallest = Math.max(1, ...sizes.map((s) => Math.max(s.widthIn, s.heightIn)));
  const chosen = currentSize();
  const styleLabel = STYLES.find((s) => s.key === style)?.label ?? "";
  const isSample = SAMPLE_ROOMS.some((r) => r.src === roomSrc);
  const reference = SCALE_REFERENCES.find((r) => r.key === referenceKey);

  // A tag that follows the selected piece, just under its bottom edge.
  const selectedTag = (() => {
    if (!selected || adjustingArt) return null;
    const { wCm, hCm } = pieceCm(selected);
    const hPct = (hCm / wallHeightCm) * 100;
    const at = planeToImage(quad, { x: selected.xPct / 100, y: (selected.yPct + hPct / 2) / 100 });
    if (!Number.isFinite(at.x) || !Number.isFinite(at.y)) return null;
    return (
      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-bone/10 bg-ink/85 px-3 py-1.5 text-[12px] tabular-nums text-bone shadow-card backdrop-blur-md"
        style={{ left: `${clamp(at.x, 0.12, 0.88) * 100}%`, top: `calc(${clamp(at.y, 0, 0.9) * 100}% + 12px)` }}
      >
        {Math.round(wCm)} × {Math.round(hCm)} cm
        <span className="text-bone/50"> · </span>
        {Math.round(hangHeightCm(selected.yPct, wallHeightCm))} cm up
      </div>
    );
  })();

  const tabs: { key: Panel; label: string; disabled?: boolean }[] = [
    { key: "frames", label: "Frames" },
    { key: "piece", label: "Piece", disabled: !selected },
    { key: "wall", label: "Wall" },
  ];

  return (
    <div>
      {/* The studio. On a phone it is one column with the wall stuck under the
          header; from lg the inspector sits to the right of the wall. The wall
          is a direct child here so it can stay put while everything below it
          scrolls. */}
      <div className="rounded-[28px] border border-bone/10 bg-ink-raised lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr_auto] xl:grid-cols-[minmax(0,1fr)_396px]">
        <h2 className="sr-only">The wall studio</h2>
        {/* Rooms */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-bone/10 px-3 py-3 sm:px-4 lg:col-start-1 lg:row-start-1">
          {SAMPLE_ROOMS.map((sample) => {
            const on = roomSrc === sample.src;
            return (
              <button
                key={sample.id}
                type="button"
                aria-pressed={on}
                onClick={() => loadRoom(sample.src, sample)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-[13px] transition-[border-color,background-color,color,transform] duration-200 active:scale-[0.97]",
                  on
                    ? "border-bone/50 bg-bone/[0.07] text-bone"
                    : "border-bone/10 text-bone/60 hover:border-bone/30 hover:text-bone",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.src} alt="" className="h-9 w-9 rounded-full object-cover" />
                {sample.label}
              </button>
            );
          })}
          <label
            className={cn(
              "relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-dashed px-4 py-2 text-[13px] transition-[border-color,color] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bone",
              isSample ? "border-bone/25 text-bone/70 hover:border-bone/50 hover:text-bone" : "border-bone/50 text-bone",
            )}
          >
            {isSample ? <Upload className="h-4 w-4" /> : <Check className="h-4 w-4 text-kasa-gold" />}
            {isSample ? "Use a photo of your wall" : "Your wall"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onRoomFile(e.target.files?.[0])} />
          </label>
        </div>

        {/* The wall */}
        <div className="sticky top-[72px] z-20 bg-ink-raised lg:static lg:col-start-1 lg:row-start-2">
          <div className="relative">
            <WallStage
              roomSrc={roomSrc}
              wallCm={wallCm}
              wallHeightCm={wallHeightCm}
              quad={quad}
              pieces={pieces}
              selectedId={selectedId}
              onPointerDownPiece={onPointerDownPiece}
              onCornerPointerDown={onCornerPointerDown}
              showCorners={adjustingWall}
              showRule={showRule}
              eyeLevelPct={eyeLevelPct}
              measure={measure}
              onMeasurePointerDown={onMeasurePointerDown}
              stageRef={stageRef}
              imgRef={imgRef}
              interactive
              tabIndex={0}
              aria-label="Your wall. Select a frame, then use the arrow keys to move it."
              onKeyDown={onKeyDown}
              onWheel={onWheel}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={(e) => {
                if (e.target === e.currentTarget || e.target === imgRef.current) setSelectedId(null);
              }}
              imageClassName="max-h-[40vh] rounded-[14px] sm:max-h-[52vh] lg:max-h-[min(68vh,720px)]"
              overlay={selectedTag}
              className="relative flex w-full touch-none items-center justify-center overflow-hidden bg-[radial-gradient(70%_60%_at_50%_45%,rgba(244,242,237,0.06),transparent_72%)] px-3 pb-3 pt-16 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bone/60 sm:px-6 sm:pb-6 lg:h-[min(76vh,800px)] lg:px-10 lg:pb-10 lg:pt-20"
            />

            {/* Floating controls over the stage. */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-4">
              <button
                type="button"
                onClick={() => setPanel("wall")}
                className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-bone/10 bg-ink/85 px-4 py-2 text-[13px] tabular-nums text-bone shadow-card backdrop-blur-md transition-[border-color,transform] duration-200 hover:border-bone/30 active:scale-[0.97]"
              >
                <span
                  aria-hidden
                  className={cn("h-1.5 w-1.5 rounded-full", calibrated ? "bg-emerald-400" : "bg-kasa-gold")}
                />
                {wallCm} × {wallHeightCm} cm
                <span className="text-bone/65">{calibrated ? "Measured" : "Estimated"}</span>
              </button>

              <div className="pointer-events-auto flex gap-1 rounded-full border border-bone/10 bg-ink/85 p-1 shadow-card backdrop-blur-md">
                <StageToggle
                  pressed={showRule}
                  onClick={() => setShowRule((v) => !v)}
                  label="Show a 1 metre rule and the 145 cm hanging line"
                >
                  <Ruler className="h-4 w-4" />
                </StageToggle>
                <StageToggle
                  pressed={adjustingWall}
                  onClick={() => {
                    setAdjustingWall((v) => !v);
                    setPanel("wall");
                  }}
                  label="Adjust the corners of the wall"
                >
                  <Scan className="h-4 w-4" />
                </StageToggle>
              </div>
            </div>

            {/* First visit: the wall is ready and waiting. */}
            {pieces.length === 0 && !measuring && !adjustingWall ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-6 lg:inset-y-0 lg:items-center">
                <div className="pointer-events-auto w-full max-w-sm rounded-[20px] border border-bone/10 bg-ink/90 p-4 text-center shadow-lift backdrop-blur-md sm:p-6">
                  <p className="text-[17px] tracking-[-0.02em] text-bone sm:text-title">Your wall is ready.</p>
                  <p className="mt-1.5 hidden text-[14px] leading-relaxed text-bone/60 sm:block">
                    Hang a {chosen?.label} in {styleLabel.toLowerCase()}, or start from a layout and move things
                    around.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button onClick={addPiece}>
                      <ImagePlus />
                      Hang a piece
                    </Button>
                    <Button variant="secondary" onClick={() => applyPreset("triptych")}>
                      Try a triptych
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Measuring: the instruction sits on the photo, where the dots are. */}
            {measuring ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-5">
                <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-3 rounded-[20px] border border-emerald-400/30 bg-ink/85 p-4 shadow-lift backdrop-blur-md sm:flex-row sm:items-center">
                  <p className="flex-1 text-[14px] leading-relaxed text-bone/80">
                    Drag <span className="text-emerald-300">A</span> and <span className="text-emerald-300">B</span> to
                    each end of the {reference?.label.toLowerCase() ?? "thing you know"}, {referenceCm} cm long.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={cancelMeasuring}>
                      Cancel
                    </Button>
                    <Button onClick={finishMeasuring}>Use this scale</Button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* What the wall reader found, and anything that went wrong. */}
            {!measuring && (wallNote || notice) ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-5">
                <div
                  role={notice ? "alert" : "status"}
                  className={cn(
                    "pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-[16px] border bg-ink/85 py-2 pl-4 pr-1 text-[13px] leading-relaxed shadow-lift backdrop-blur-md",
                    notice ? "border-red-400/30 text-red-200" : "border-bone/10 text-bone/80",
                  )}
                >
                  <Info aria-hidden className={cn("mt-2.5 h-4 w-4 shrink-0", notice ? "text-red-300" : "text-kasa-gold")} />
                  <span className="flex-1 py-2">{notice ?? wallNote}</span>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => {
                      setNotice(null);
                      setWallNote(null);
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status line */}
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-bone/10 px-4 py-3 text-[13px] text-bone/50 sm:px-5 lg:col-start-1 lg:row-start-3">
          <p className="tabular-nums">
            {selected
              ? (() => {
                  const { wCm, hCm } = pieceCm(selected);
                  return `${getProduct(selected.productId)?.name ?? "Piece"} · ${Math.round(wCm)} × ${Math.round(hCm)} cm · centre ${Math.round(hangHeightCm(selected.yPct, wallHeightCm))} cm off the floor${Math.round(selected.rotation) !== 0 ? ` · ${Math.round(selected.rotation)}°` : ""}`;
                })()
              : pieces.length > 0
                ? `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} on a ${wallCm} cm wall. Tap one to edit it.`
                : `A ${wallCm} × ${wallHeightCm} cm wall, drawn in your photo's perspective.`}
          </p>
          <p className="hidden items-center gap-1.5 xl:flex">
            Drag to move <Kbd>←</Kbd>
            <Kbd>→</Kbd> nudge <Kbd>[</Kbd>
            <Kbd>]</Kbd> tilt <Kbd>Del</Kbd> remove
          </p>
        </div>

        {/* The inspector */}
        <aside
          aria-label="Visualizer controls"
          className="border-t border-bone/10 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:flex-col lg:border-l lg:border-t-0 lg:[contain:size]"
        >
          <div role="tablist" aria-label="Controls" className="flex gap-1 border-b border-bone/10 p-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                id={`viz-tab-${t.key}`}
                type="button"
                role="tab"
                aria-selected={panel === t.key}
                aria-controls="viz-panel"
                disabled={t.disabled}
                onClick={() => setPanel(t.key)}
                className={cn(
                  "relative h-11 flex-1 rounded-full text-[14px] transition-[background-color,color] duration-200 disabled:cursor-not-allowed disabled:text-bone/25",
                  panel === t.key ? "bg-bone text-ink" : "text-bone/60 hover:bg-bone/[0.05] hover:text-bone",
                )}
              >
                {t.label}
                {t.key === "wall" && !calibrated && panel !== "wall" ? (
                  <span aria-hidden className="absolute right-4 top-3 h-1.5 w-1.5 rounded-full bg-kasa-gold" />
                ) : null}
              </button>
            ))}
          </div>

          <div
            id="viz-panel"
            role="tabpanel"
            aria-labelledby={`viz-tab-${panel}`}
            className="[scrollbar-width:thin] lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
          >
            {panel === "frames" ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[15px] text-bone">Finish</h3>
                  <p className="truncate text-[13px] text-bone/50">{styleLabel}</p>
                </div>
                <div role="radiogroup" aria-label="Finish" className="mt-3 grid grid-cols-5 gap-2">
                  {STYLES.map((s) => {
                    const on = style === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={s.label}
                        title={s.label}
                        onClick={() => setStyle(s.key)}
                        className={cn(
                          "relative h-[4.5rem] overflow-hidden rounded-[12px] border transition-[border-color,background-color,transform] duration-200 active:scale-[0.96]",
                          on
                            ? "border-bone/70 bg-[#d9d4cb]"
                            : "border-bone/10 bg-[#c9c3b8]/80 hover:border-bone/40",
                        )}
                      >
                        <FrameView piece={swatchPiece(s.key)} pxPerCm={1.2} selected={false} interactive={false} />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-baseline justify-between gap-4">
                  <h3 className="text-[15px] text-bone">Size</h3>
                  {chosen ? (
                    <p className="text-[13px] tabular-nums text-bone/50">
                      {Math.round(chosen.widthIn * CM_PER_INCH)} × {Math.round(chosen.heightIn * CM_PER_INCH)} cm ·{" "}
                      {Math.round(((chosen.widthIn * CM_PER_INCH) / wallCm) * 100)}% of the wall
                    </p>
                  ) : null}
                </div>
                {/* A shelf of sizes, each drawn to scale against the largest. */}
                <div role="radiogroup" aria-label="Size in inches" className="mt-3 grid grid-cols-3 gap-2">
                  {sizes.map((s) => {
                    const on = s.label === sizeLabel;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={`${s.label} inches, ${formatGhs(s.frameGhs)}`}
                        onClick={() => setSizeLabel(s.label)}
                        className={cn(
                          "flex h-[6.25rem] flex-col items-center justify-end gap-1 rounded-[12px] border px-1 pb-2.5 transition-[border-color,background-color,transform] duration-200 active:scale-[0.96]",
                          on ? "border-bone/70 bg-bone/[0.07]" : "border-bone/10 hover:border-bone/35",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn("mb-1.5 block rounded-[1px] border", on ? "border-bone bg-bone/25" : "border-bone/40 bg-bone/10")}
                          style={{ width: (s.widthIn / tallest) * 40, height: (s.heightIn / tallest) * 40 }}
                        />
                        <span className="text-[13px] tabular-nums text-bone">{s.label}</span>
                        <span className="text-[12px] tabular-nums text-bone/50">{formatGhs(s.frameGhs)}</span>
                      </button>
                    );
                  })}
                </div>

                <Button size="lg" onClick={addPiece} className="mt-6 w-full">
                  <ImagePlus />
                  Hang it on the wall
                </Button>

                <h3 className="mt-9 text-[15px] text-bone">Or start from a layout</h3>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.key)}
                      className="flex h-[4.75rem] flex-col items-center justify-center gap-2 rounded-[12px] border border-bone/10 text-[12px] text-bone/60 transition-[border-color,color,transform] duration-200 hover:border-bone/35 hover:text-bone active:scale-[0.96]"
                    >
                      <LayoutGlyph kind={p.key} />
                      {p.label}
                    </button>
                  ))}
                </div>

                {pieces.length > 0 ? (
                  <>
                    <h3 className="mt-9 text-[15px] text-bone">Tilt every piece</h3>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {[0, 15, 30, 45].map((deg) => (
                        <Button key={deg} variant="secondary" onClick={() => tiltAll(deg)} className="px-0 tabular-nums">
                          {deg}°
                        </Button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {panel === "piece" && selected ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-title">{getProduct(selected.productId)?.name}</p>
                    <p className="mt-1 text-[13px] text-bone/50">{styleMetaLabel(selected.style)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Deselect this piece"
                    onClick={() => setSelectedId(null)}
                    className="-mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-[border-color,color,transform] duration-200 hover:border-bone/40 hover:text-bone active:scale-[0.95]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 grid gap-1">
                  <Label htmlFor="viz-piece-size">Size</Label>
                  <Select value={selected.sizeLabel} onValueChange={(v) => updateSelected({ sizeLabel: v })}>
                    <SelectTrigger id="viz-piece-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(getProduct(selected.productId)?.sizes ?? []).map((s) => (
                        <SelectItem key={s.label} value={s.label}>
                          {s.label} in · {formatGhs(s.frameGhs)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-7">
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="viz-tilt">Tilt</Label>
                    <span className="text-[13px] tabular-nums text-bone">{Math.round(selected.rotation)}°</span>
                  </div>
                  <Range
                    id="viz-tilt"
                    min={-60}
                    max={60}
                    step={1}
                    value={selected.rotation}
                    onChange={(v) => updateSelected({ rotation: v })}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" onClick={() => updateSelected({ rotation: selected.rotation - 5 })}>
                      <RotateCcw />5°
                    </Button>
                    <Button variant="secondary" onClick={() => updateSelected({ rotation: 0 })}>
                      Level
                    </Button>
                    <Button variant="secondary" onClick={() => updateSelected({ rotation: selected.rotation + 5 })}>
                      <RotateCw />5°
                    </Button>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] text-bone/60">Height off the floor</p>
                    <span className="text-[13px] tabular-nums text-bone">
                      {Math.round(hangHeightCm(selected.yPct, wallHeightCm))} cm to the centre
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => updateSelected({ yPct: clamp(eyeLevelPct, 3, 97) })}
                  >
                    <Ruler />
                    Hang at eye level, {EYE_LEVEL_CM} cm
                  </Button>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2">
                  <Button variant="secondary" onClick={() => updateSelected({ rotated: !selected.rotated })}>
                    {selected.rotated ? <RectangleVertical /> : <RectangleHorizontal />}
                    Turn
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const copy = { ...selected, id: uid(), xPct: clamp(selected.xPct + 8, 3, 97) };
                      setPieces((prev) => [...prev, copy]);
                      setSelectedId(copy.id);
                    }}
                  >
                    <Copy />
                    Copy
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPieces((prev) => prev.filter((p) => p.id !== selected.id));
                      setSelectedId(null);
                    }}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>

                <div className="mt-8 border-t border-bone/10 pt-7">
                  <h3 className="text-[15px] text-bone">Your photo inside</h3>
                  <label className="relative mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-dashed border-bone/25 px-4 text-[14px] text-bone/80 transition-[border-color,color] hover:border-bone/50 hover:text-bone has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bone">
                    <ImagePlus className="h-4 w-4" />
                    {selected.artUrl ? "Change the photo" : "Choose a photo"}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => onArtFile(e.target.files?.[0])} />
                  </label>

                  {selected.artUrl ? (
                    <div className="mt-4 grid gap-5">
                      <Button
                        variant={adjustingArt ? "primary" : "secondary"}
                        onClick={() => setAdjustingArt((v) => !v)}
                        className="w-full"
                      >
                        <Crop />
                        {adjustingArt ? "Done framing" : "Frame the photo"}
                      </Button>
                      {adjustingArt ? (
                        <p className="-mt-2 text-[13px] leading-relaxed text-bone/50">
                          Drag inside the frame to move the photo, or scroll to zoom. The frame stays put.
                        </p>
                      ) : null}

                      <div>
                        <div className="flex items-baseline justify-between">
                          <Label htmlFor="viz-zoom">Zoom</Label>
                          <span className="text-[13px] tabular-nums text-bone">{(selected.artZoom ?? 1).toFixed(2)}×</span>
                        </div>
                        <Range
                          id="viz-zoom"
                          min={1}
                          max={4}
                          step={0.05}
                          value={selected.artZoom ?? 1}
                          onChange={(zoom) => {
                            const limit = artPanLimit({ ...selected, artZoom: zoom });
                            updateSelected({
                              artZoom: zoom,
                              artX: clamp(selected.artX ?? 0, -limit, limit),
                              artY: clamp(selected.artY ?? 0, -limit, limit),
                            });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="viz-pan-x">Left and right</Label>
                          <Range
                            id="viz-pan-x"
                            min={-artPanLimit(selected)}
                            max={artPanLimit(selected)}
                            step={0.5}
                            value={selected.artX ?? 0}
                            disabled={artPanLimit(selected) === 0}
                            onChange={(v) => updateSelected({ artX: v })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="viz-pan-y">Up and down</Label>
                          <Range
                            id="viz-pan-y"
                            min={-artPanLimit(selected)}
                            max={artPanLimit(selected)}
                            step={0.5}
                            value={selected.artY ?? 0}
                            disabled={artPanLimit(selected) === 0}
                            onChange={(v) => updateSelected({ artY: v })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            updateSelected({ artFit: (selected.artFit ?? "cover") === "cover" ? "contain" : "cover" })
                          }
                        >
                          {(selected.artFit ?? "cover") === "cover" ? "Show it all" : "Fill the frame"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => updateSelected({ artZoom: 1, artX: 0, artY: 0, artFit: "cover" })}
                        >
                          Reset
                        </Button>
                      </div>
                      <p className="text-[13px] leading-relaxed text-bone/50">
                        {(selected.artFit ?? "cover") === "cover"
                          ? "Filling the frame crops the edges. Zoom in to choose which part is kept."
                          : "The whole photo shows, so there may be a margin inside the frame."}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] leading-relaxed text-bone/50">
                      It stays on your device. Nothing is uploaded until you send the wall to us.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {panel === "wall" ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-title">The scale</h3>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px]",
                      calibrated ? "bg-emerald-400/10 text-emerald-300" : "bg-kasa-gold/10 text-kasa-goldsoft",
                    )}
                  >
                    {calibrated ? <Check className="h-3 w-3" /> : null}
                    {calibrated ? "Measured" : "Estimated"}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-bone/60 text-pretty">
                  {scaleNote
                    ? `${scaleNote} Every frame is drawn to that scale, so what you see is the size it will be.`
                    : "Measure one thing in the photo, a door or a sofa, and every frame follows. It beats guessing the wall in metres."}
                </p>

                {measuring ? (
                  <div className="mt-5 grid gap-5 rounded-[16px] border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
                    <div className="grid gap-1">
                      <Label htmlFor="viz-reference">What are you measuring?</Label>
                      <Select
                        value={referenceKey}
                        onValueChange={(v) => {
                          setReferenceKey(v);
                          const preset = SCALE_REFERENCES.find((r) => r.key === v);
                          if (preset && v !== "custom") setReferenceCm(preset.cm);
                        }}
                      >
                        <SelectTrigger id="viz-reference">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCALE_REFERENCES.map((r) => (
                            <SelectItem key={r.key} value={r.key}>
                              {r.label}
                              {r.key === "custom" ? "" : ` · ${r.cm} cm`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="pt-1 text-[13px] text-bone/50">{reference?.hint}</p>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="viz-reference-cm">How long is it, in centimetres?</Label>
                      <Input
                        id="viz-reference-cm"
                        type="number"
                        inputMode="numeric"
                        min={5}
                        max={2000}
                        value={referenceCm}
                        onChange={(e) => setReferenceCm(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="ghost" onClick={cancelMeasuring}>
                        Cancel
                      </Button>
                      <Button onClick={finishMeasuring}>Use this scale</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" className="mt-5 w-full" onClick={startMeasuring}>
                    <Ruler />
                    {calibrated ? "Measure again" : "Measure something in the photo"}
                  </Button>
                )}

                <div className="mt-8 grid gap-6">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="viz-wall-w">Wall width</Label>
                      <span className="text-[13px] tabular-nums text-bone">{wallCm} cm</span>
                    </div>
                    <Range
                      id="viz-wall-w"
                      min={100}
                      max={900}
                      step={5}
                      value={wallCm}
                      onChange={(v) => {
                        setWallCm(v);
                        setCalibrated(false);
                        setScaleNote(null);
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="viz-wall-h">Wall height</Label>
                      <span className="text-[13px] tabular-nums text-bone">
                        {wallHeightCm} cm{quadMode === "custom" ? ", from the corners" : ""}
                      </span>
                    </div>
                    <Range
                      id="viz-wall-h"
                      min={150}
                      max={700}
                      step={5}
                      value={wallHeightCm}
                      onChange={setWallHeightCm}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-bone/10 pt-4">
                  <p id="viz-rule-label" className="text-[14px] text-bone/70">
                    Show a 1 m rule and the {EYE_LEVEL_CM} cm line
                  </p>
                  <Switch checked={showRule} onCheckedChange={setShowRule} aria-labelledby="viz-rule-label" />
                </div>

                <div className="mt-6 border-t border-bone/10 pt-7">
                  <h3 className="text-title">The wall in your photo</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-bone/60 text-pretty">
                    We read the ceiling and skirting lines to work out how your wall recedes, then hang everything on
                    that plane. If the guess is off, drag the gold corners onto the wall.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button variant={adjustingWall ? "primary" : "secondary"} onClick={() => setAdjustingWall((v) => !v)}>
                      <Scan />
                      {adjustingWall ? "Done" : "Adjust corners"}
                    </Button>
                    <Button variant="secondary" onClick={() => detect(true)}>
                      <ScanLine />
                      Read again
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuadMode("fitted");
                      setWallNote(null);
                    }}
                    className="mt-2 inline-flex min-h-11 items-center text-[13px] text-bone/50 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-bone hover:decoration-bone/60"
                  >
                    Reset to a flat wall
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* The running total, always in reach. */}
          <div className="border-t border-bone/10 bg-ink-overlay p-5 sm:p-6 lg:rounded-br-[28px]">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] text-bone/50">
                  {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
                  {pieces.length > 0 ? (installation ? ", installed" : ", frames only") : ""}
                </p>
                <p className="mt-1 text-display-sm tabular-nums">{formatGhs(cost.totalGhs)}</p>
              </div>
              <div className="flex items-center">
                <p id="viz-install-label" className="text-right text-[13px] leading-snug text-bone/60">
                  Installation
                  <br />
                  <span className="text-bone/50">{formatGhs(INSTALLATION_GHS)} a frame</span>
                </p>
                <Switch checked={installation} onCheckedChange={setInstallation} aria-labelledby="viz-install-label" />
              </div>
            </div>
            <Button size="lg" onClick={openPreview} disabled={pieces.length === 0} className="mt-5 w-full">
              Preview the finished wall
              <ArrowRight />
            </Button>
          </div>
        </aside>
      </div>

      {/* The estimate, line by line, once there is something to add up. */}
      {pieces.length > 0 ? (
        <section aria-labelledby="viz-breakdown" className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="viz-breakdown" className="text-title">
              The estimate, line by line
            </h2>
            <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-bone/50 text-pretty">
              From our published price list. A 50% deposit confirms the order; site visit transport is charged at the
              Uber or Bolt fare and agreed with you first.
            </p>
            <button
              type="button"
              onClick={() => {
                setPieces([]);
                setSelectedId(null);
              }}
              className="mt-3 inline-flex min-h-11 items-center text-[13px] text-bone/50 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-bone hover:decoration-bone/60"
            >
              Start the wall again
            </button>
          </div>
          <div className="min-w-0 lg:col-span-8">
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[34rem] text-left text-[15px]">
                <thead className="text-[13px] text-bone/50">
                  <tr className="border-b border-bone/15">
                    <th scope="col" className="py-3 pr-4 font-normal">
                      Piece
                    </th>
                    <th scope="col" className="px-4 py-3 font-normal">
                      Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-normal">
                      Frame
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-normal">
                      Install
                    </th>
                    <th scope="col" className="py-3 pl-4 text-right font-normal">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {cost.lines.map((line) => (
                    <tr
                      key={line.piece.id}
                      onClick={() => {
                        setSelectedId(line.piece.id);
                        setPanel("piece");
                      }}
                      className={cn(
                        "cursor-pointer border-b border-bone/10 transition-colors hover:bg-bone/[0.03]",
                        line.piece.id === selectedId && "bg-bone/[0.04]",
                      )}
                    >
                      <th scope="row" className="py-4 pr-4 font-normal text-bone">
                        {line.name}
                      </th>
                      <td className="px-4 py-4 text-bone/50">{line.piece.sizeLabel} in</td>
                      <td className="px-4 py-4 text-right text-bone/70">{formatGhs(line.frameGhs)}</td>
                      <td className="px-4 py-4 text-right text-bone/50">
                        {line.installGhs > 0 ? formatGhs(line.installGhs) : "None"}
                      </td>
                      <td className="py-4 pl-4 text-right text-bone">{formatGhs(line.totalGhs)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={4} className="py-4 pr-4 text-right text-[13px] font-normal text-bone/50">
                      Total
                    </th>
                    <td className="py-4 pl-4 text-right text-title tabular-nums">{formatGhs(cost.totalGhs)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* The photo may already be decoded before the handler is attached. */}
      <ImageReadyProbe imgRef={imgRef} onReady={() => detect(true)} pending={pendingDetect} />
    </div>
  );
}

/** A piece used only to draw a finish swatch, at a size every frame type offers. */
function swatchPiece(style: FrameStyle): Piece {
  return {
    id: `swatch-${style}`,
    productId: STYLE_PRODUCT[style],
    sizeLabel: "12 × 16",
    xPct: 50,
    yPct: 50,
    rotation: 0,
    style,
    rotated: false,
  };
}

function styleMetaLabel(style: FrameStyle) {
  return STYLES.find((s) => s.key === style)?.label ?? "";
}

function StageToggle({
  pressed,
  onClick,
  label,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 active:scale-[0.94] sm:h-10 sm:w-10",
        pressed ? "bg-bone text-ink" : "text-bone/70 hover:bg-bone/10 hover:text-bone",
      )}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-bone/15 px-1 font-sans text-[11px] text-bone/70">
      {children}
    </kbd>
  );
}

/** A thin bone track that fills up to the value, with a round thumb. */
function Range({
  id,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range"
      style={{ "--fill": `${clamp(fill, 0, 100)}%` } as React.CSSProperties}
    />
  );
}

/** Tiny drawings of the four starting layouts. */
function LayoutGlyph({ kind }: { kind: Preset }) {
  const rects: [number, number, number, number][] =
    kind === "single"
      ? [[15, 5, 10, 14]]
      : kind === "triptych"
        ? [
            [4, 7, 9, 12],
            [15.5, 7, 9, 12],
            [27, 7, 9, 12],
          ]
        : kind === "grid"
          ? [
              [6, 3, 8, 7],
              [16, 3, 8, 7],
              [26, 3, 8, 7],
              [6, 13, 8, 7],
              [16, 13, 8, 7],
              [26, 13, 8, 7],
            ]
          : [
              [1, 14, 6, 8],
              [9, 11, 6, 8],
              [17, 8, 6, 8],
              [25, 5, 6, 8],
              [33, 2, 6, 8],
            ];
  return (
    <svg aria-hidden viewBox="0 0 40 24" className="h-6 w-10">
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={0.6} fill="currentColor" fillOpacity={0.18} stroke="currentColor" strokeWidth={1} />
      ))}
    </svg>
  );
}

/**
 * Runs the wall detection once the photo is actually decoded. A cached image can
 * be complete before React attaches anything, so polling briefly is more
 * reliable here than an onLoad handler alone.
 */
function ImageReadyProbe({
  imgRef,
  onReady,
  pending,
}: {
  imgRef: React.RefObject<HTMLImageElement | null>;
  onReady: () => void;
  pending: React.RefObject<boolean>;
}) {
  React.useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const img = imgRef.current;
      if (pending.current && img?.complete && img.naturalWidth > 0) {
        pending.current = false;
        onReady();
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [imgRef, onReady, pending]);

  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
