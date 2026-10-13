"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not send magic link.");
      setState("error");
      return;
    }

    setState("sent");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-wilderness-sage" />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="member@example.com"
          className="h-12 w-full rounded-md border border-white/10 bg-black/25 pl-11 pr-4 text-wilderness-paper outline-none ring-wilderness-sage/40 transition placeholder:text-white/30 focus:ring-2"
        />
      </div>
      <Button disabled={state === "loading"}>{state === "loading" ? "Sending..." : "Send magic link"}</Button>
      {state === "sent" && <p className="text-sm text-wilderness-glass">Check your email for the secure sign-in link.</p>}
      {error && <p className="text-sm text-red-200">{error}</p>}
    </form>
  );
}
