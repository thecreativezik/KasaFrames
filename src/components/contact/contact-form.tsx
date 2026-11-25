"use client";

import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLead } from "@/lib/lead-client";
import type { FieldErrors } from "@/lib/leads";

/**
 * The one "send a note" form, shared by the home page and /contact so the two
 * can never drift apart. Posts a `contact` lead; `source` says where it came from.
 */
export function ContactForm({ source }: { source: string }) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const result = await submitLead({ type: "contact", name, email, message, company, source });

    setPending(false);

    if (result.ok) {
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      return;
    }

    setSent(false);
    setError(result.error);
    setFields(result.fields ?? {});
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
        <div className="grid gap-1">
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input
            id={`${id}-name`}
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(fields.name)}
            aria-describedby={fields.name ? `${id}-name-error` : undefined}
          />
          {fields.name ? (
            <p id={`${id}-name-error`} className="pt-1 text-[13px] text-red-300">
              {fields.name}
            </p>
          ) : null}
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
            aria-describedby={fields.email ? `${id}-email-error` : undefined}
          />
          {fields.email ? (
            <p id={`${id}-email-error`} className="pt-1 text-[13px] text-red-300">
              {fields.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3">
        <Label htmlFor={`${id}-message`}>Message</Label>
        <Textarea
          id={`${id}-message`}
          required
          placeholder="The wall, the room, roughly how wide…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(fields.message)}
          aria-describedby={fields.message ? `${id}-message-error` : undefined}
        />
        {fields.message ? (
          <p id={`${id}-message-error`} className="text-[13px] text-red-300">
            {fields.message}
          </p>
        ) : null}
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
          {!pending ? <ArrowRight /> : null}
        </Button>
        <p className="text-[13px] text-bone/50">We reply within 48 hours, often sooner.</p>
      </div>

      <p aria-live="polite" className="sr-only">
        {pending ? "Sending your message" : sent ? "Message sent" : (error ?? "")}
      </p>

      {sent ? (
        <p className="flex items-start gap-3 text-[15px] text-bone">
          <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-kasa-gold" />
          Thank you. Your note is with the studio.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[15px] text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
