"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, Check, ImagePlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLead } from "@/lib/lead-client";
import type { FieldErrors } from "@/lib/leads";
import { cn, whatsappLink } from "@/lib/utils";

/** The studio sees people Tuesday to Saturday, 10:00 to 18:00 GMT. */
const STUDIO_DAYS = new Set([2, 3, 4, 5, 6]);
const TIMES = ["10:00", "12:30", "15:00", "17:00"];

type Day = { key: string; weekday: string; label: string };

/** The next `count` studio days, starting tomorrow. Worked out in the browser so it is never stale. */
function upcomingDays(count: number): Day[] {
  const days: Day[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (!STUDIO_DAYS.has(d.getDay())) continue;
    days.push({
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    });
  }
  return days;
}

const modes = [
  { value: "visit", label: "Home visit", hint: "Greater Accra" },
  { value: "virtual", label: "Video call", hint: "Anywhere" },
] as const;

export function ConsultationBooker() {
  const id = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<"visit" | "virtual">("visit");
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => setDays(upcomingDays(4)), []);

  const waPrefill = useMemo(() => {
    const kind = mode === "visit" ? "home visit" : "video call";
    return whatsappLink(
      `Hello KasaFrames — I'd like to book a ${kind} consultation.${slot ? ` Preferred time: ${slot}.` : ""}`,
    );
  }, [mode, slot]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const result = await submitLead({
      type: "consultation",
      name,
      email,
      phone,
      consultationMode: mode,
      slot: slot ?? undefined,
      dimensions,
      preferences,
      photoCount,
      company,
      source: "book-page",
    });

    setPending(false);

    if (result.ok) {
      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setDimensions("");
      setPreferences("");
      setPhotoCount(0);
      return;
    }

    setSubmitted(false);
    setError(result.error);
    setFields(result.fields ?? {});
  }

  const fieldError = (key: keyof FieldErrors) =>
    fields[key] ? (
      <p id={`${id}-${key}-error`} className="pt-1 text-[13px] text-red-300">
        {fields[key]}
      </p>
    ) : null;
  const describedBy = (key: keyof FieldErrors) => (fields[key] ? `${id}-${key}-error` : undefined);

  return (
    <form className="grid gap-16 lg:grid-cols-12 lg:gap-10" onSubmit={handleSubmit} noValidate>
      <section aria-labelledby={`${id}-details`} className="lg:col-span-7 lg:pr-10">
        <h2 className="text-title" id={`${id}-details`}>
          Your project
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-bone/60">
          Share the wall and what you like. The studio replies within 48 hours, often sooner.
        </p>

        <div className="mt-10 grid gap-8">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            <div className="grid gap-1">
              <Label htmlFor={`${id}-name`}>Full name</Label>
              <Input
                id={`${id}-name`}
                required
                autoComplete="name"
                placeholder="Ama Serwaa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(fields.name)}
                aria-describedby={describedBy("name")}
              />
              {fieldError("name")}
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`${id}-phone`}>Phone</Label>
              <Input
                id={`${id}-phone`}
                type="tel"
                required
                autoComplete="tel"
                placeholder="+233 …"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={Boolean(fields.phone)}
                aria-describedby={describedBy("phone")}
              />
              {fieldError("phone")}
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fields.email)}
              aria-describedby={describedBy("email")}
            />
            {fieldError("email")}
          </div>

          <div className="grid gap-1">
            <Label htmlFor={`${id}-dims`}>Wall size (cm)</Label>
            <Input
              id={`${id}-dims`}
              placeholder="420 wide × 280 high"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              aria-invalid={Boolean(fields.dimensions)}
              aria-describedby={describedBy("dimensions")}
            />
            {fieldError("dimensions")}
          </div>

          <div className="grid gap-3">
            <Label htmlFor={`${id}-prefs`}>What you like</Label>
            <Textarea
              id={`${id}-prefs`}
              placeholder="Minimal, warm neutrals, ring frames, a stair gallery…"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              aria-invalid={Boolean(fields.preferences)}
              aria-describedby={describedBy("preferences")}
            />
            {fieldError("preferences")}
          </div>

          <div className="grid gap-3">
            <p className="text-[13px] text-bone/60">Photos of the wall</p>
            <label
              htmlFor={`${id}-photos`}
              className="group flex min-h-16 cursor-pointer items-center gap-4 rounded-[16px] border border-dashed border-bone/20 px-5 py-4 transition-colors hover:border-bone/40 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bone"
            >
              <ImagePlus className="h-5 w-5 shrink-0 text-bone/60 transition-colors group-hover:text-bone" />
              <span className="min-w-0">
                <span className="block text-[15px] text-bone">
                  {photoCount ? `${photoCount} ${photoCount === 1 ? "photo" : "photos"} chosen` : "Choose photos"}
                </span>
                <span className="mt-0.5 block text-[13px] text-bone/50">
                  They stay on your device. We will ask you to send them on WhatsApp.
                </span>
              </span>
              <input
                id={`${id}-photos`}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
              />
            </label>
          </div>

          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor={`${id}-company`}>Company</Label>
            <Input
              id={`${id}-company`}
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
      </section>

      <aside className="lg:col-span-5">
        <div className="rounded-panel border border-bone/10 bg-ink-raised p-6 sm:p-8 lg:sticky lg:top-28">
          <fieldset>
            <legend className="text-title">How we meet</legend>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {modes.map((m) => (
                <label key={m.value} className="group/mode relative block cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-mode`}
                    value={m.value}
                    checked={mode === m.value}
                    onChange={() => setMode(m.value)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-16 flex-col justify-center rounded-[14px] border border-bone/15 px-4 py-3 transition-[background-color,border-color,color] peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bone">
                    <span className="text-[15px]">{m.label}</span>
                    <span className="text-[12px] text-bone/50 group-has-[:checked]/mode:text-ink/60">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="text-title">Preferred time</legend>
            <p className="mt-4 text-[13px] leading-relaxed text-bone/50">
              Pick a starting point. We confirm the exact time with you before anything is booked.
            </p>
            <div className="mt-6 grid gap-5">
              {days.length === 0
                ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[4.5rem] rounded-tile bg-bone/[0.04]" />)
                : days.map((d) => (
                    <div key={d.key} className="grid gap-2 sm:grid-cols-[5.5rem_1fr] sm:items-center">
                      <p className="text-[13px] text-bone/60">
                        <span className="text-bone">{d.weekday}</span> {d.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TIMES.map((t) => {
                          const value = `${d.weekday} ${d.label}, ${t}`;
                          const active = slot === value;
                          return (
                            <button
                              key={t}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSlot(active ? null : value)}
                              className={cn(
                                "min-h-11 rounded-full border px-4 text-[14px] tabular-nums transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97]",
                                active
                                  ? "border-bone bg-bone text-ink"
                                  : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
                              )}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
            </div>
          </fieldset>

          <div className="mt-10 grid gap-3 border-t border-bone/10 pt-8">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Sending…" : "Request consultation"}
              {!pending ? <ArrowRight /> : null}
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={waPrefill} target="_blank" rel="noreferrer">
                <MessageCircle />
                Or arrange it on WhatsApp
              </a>
            </Button>
            <p className="text-[13px] text-bone/50">
              {slot ? `Preferred: ${slot} GMT.` : "No time chosen yet. That's fine, we can find one together."}
            </p>
          </div>

          <p aria-live="polite" className="sr-only">
            {pending ? "Sending your request" : submitted ? "Request sent" : (error ?? "")}
          </p>

          {submitted ? (
            <p className="mt-6 flex items-start gap-3 text-[15px] text-bone">
              <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-kasa-gold" />
              <span>
                Thank you. Your request is with the studio.
                {slot ? ` We will confirm ${slot} by email or WhatsApp.` : " We will be in touch to find a time."}
              </span>
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-6 text-[15px] text-red-300">
              {error}
            </p>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
