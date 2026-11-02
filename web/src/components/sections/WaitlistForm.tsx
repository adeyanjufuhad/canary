"use client";

import { useRef, useState, type FormEvent } from "react";
import { en } from "@/content/en";
import { GITHUB_URL } from "@/lib/site";

const t = en.waitlist;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "submitting" | "success" | "invalid" | "closed" | "failed";

export default function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "");
    if (!EMAIL.test(email)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      if (res.ok) {
        const { status: result } = (await res.json()) as { status?: string };
        setStatus(result === "closed" ? "closed" : "success");
      } else if (res.status === 400) {
        setStatus("invalid");
        inputRef.current?.focus();
      } else setStatus("failed");
    } catch {
      setStatus("failed");
    }
  }

  const invalid = status === "invalid";
  const message = { success: t.success, closed: t.closed, failed: t.failed } as Partial<Record<Status, string>>;

  return (
    <form onSubmit={onSubmit} noValidate className="relative w-full">
      {/* honeypot for bots: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-email" className="label text-ink">
          {t.label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            id="waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder={t.placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "waitlist-error" : "waitlist-hint"}
            disabled={status === "success"}
            onChange={() => invalid && setStatus("idle")}
            className={`h-12 w-full min-w-0 shrink-0 bg-paper sm:w-auto sm:flex-1 px-4 text-base text-ink ring-1 placeholder:text-ink-2/60 focus-visible:outline-ink ${invalid ? "ring-2 ring-broken" : "ring-ink"}`}
          />
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="label inline-flex h-12 items-center justify-center gap-2 bg-ink px-6 text-[12px] text-paper transition-colors hover:bg-coal-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "submitting" && (
              <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            )}
            {status === "submitting" ? t.submitting : t.submit}
          </button>
        </div>
        {invalid ? (
          <p id="waitlist-error" className="text-sm font-medium text-broken">
            {t.invalid}
          </p>
        ) : (
          <p id="waitlist-hint" className="text-sm text-ink/70">
            {t.hint}
          </p>
        )}
      </div>

      <div aria-live="polite" className="mt-4 min-h-6">
        {message[status] && (
          <p className={`text-base font-medium ${status === "failed" ? "text-broken" : "text-ink"}`}>
            {message[status]}{" "}
            {status === "closed" && (
              <a href={GITHUB_URL} className="underline decoration-2 underline-offset-4 hover:decoration-ink/40">
                {t.star} <span aria-hidden="true">↗</span>
              </a>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
