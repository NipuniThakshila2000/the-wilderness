"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Circle, Gavel, Pause, Send, ShieldAlert } from "lucide-react";
import { Button, FieldLabel, Panel } from "@/components/ui";
import { LEGAL_RIGHTS, getRightsByIds } from "@/lib/rights";
import { CaseFile, Message, PracticeSession } from "@/lib/types";

export function ConsentStart() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/session", { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Could not start session.");
      setLoading(false);
      return;
    }
    router.push(`/wilderness/session/${payload.id}`);
  }

  return (
    <div className="mt-6 space-y-5">
      <label className="flex items-start gap-3 rounded-md border border-white/10 bg-black/20 p-4 text-sm text-wilderness-glass">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black"
        />
        <span>I accept the age, scope, and transcript retention boundaries.</span>
      </label>
      <Button disabled={!accepted || loading} onClick={start}>
        {loading ? "Opening..." : "Open deposition"}
      </Button>
      {error && <p className="text-sm text-red-200">{error}</p>}
    </div>
  );
}

export function SessionWorkspace({ session, messages }: { session: PracticeSession; messages: Message[] }) {
  if (session.status === "deposition") return <DepositionScreen sessionId={session.id} initialMessages={messages} />;
  if (session.status === "casefile" && session.case_file) return <CaseFileScreen sessionId={session.id} caseFile={session.case_file} />;
  if (session.status === "selecting") return <ChargesScreen sessionId={session.id} />;
  if (session.status === "trial" && session.case_file && session.charges) {
    return <TrialScreen session={session} initialMessages={messages} />;
  }
  if (session.status === "stopped") return <SupportScreen />;
  if (session.status === "verdict") return <VerdictScreen session={session} />;
  if (session.status === "adjourned") return <AdjournedScreen />;

  return (
    <Panel>
      <p className="text-sm text-wilderness-glass">This session is not ready for display.</p>
    </Panel>
  );
}

function DepositionScreen({ sessionId, initialMessages }: { sessionId: string; initialMessages: Message[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      session_id: sessionId,
      speaker: "user",
      content,
      created_at: new Date().toISOString()
    };

    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    setError("");
    const response = await fetch("/api/clerk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, content })
    });
    const payload = await response.json();
    setContent("");
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "The Clerk could not continue.");
      return;
    }
    if (payload.status !== "deposition") {
      router.refresh();
      return;
    }
    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        session_id: sessionId,
        speaker: "clerk",
        content: payload.reply,
        created_at: new Date().toISOString()
      }
    ]);
  }

  return (
    <Panel className="grid min-h-[620px] grid-rows-[auto_1fr_auto] gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Deposition</p>
        <h2 className="mt-2 text-2xl font-semibold">The Clerk is taking the record.</h2>
      </div>
      <MessageList messages={messages} />
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder="Answer with roles only; avoid personal names."
          className="w-full resize-none rounded-md border border-white/10 bg-black/25 p-4 text-sm text-wilderness-paper outline-none ring-wilderness-sage/40 placeholder:text-white/30 focus:ring-2"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-red-200">{error}</p>
          <Button disabled={loading || !content.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {loading ? "Recording..." : "Send"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function CaseFileScreen({ sessionId, caseFile }: { sessionId: string; caseFile: CaseFile }) {
  const router = useRouter();
  const [draft, setDraft] = useState(caseFile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CaseFile>(key: K, value: CaseFile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function confirm() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/case-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, caseFile: draft })
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not confirm case file.");
      return;
    }
    router.refresh();
  }

  return (
    <Panel className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Case File Review</p>
        <h2 className="mt-2 text-2xl font-semibold">Confirm the record.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Title" value={draft.title} onChange={(value) => update("title", value)} />
        <TextField label="Roles" value={draft.roles.join(", ")} onChange={(value) => update("roles", splitList(value))} />
        <TextArea label="Problem" value={draft.problem} onChange={(value) => update("problem", value)} />
        <TextArea label="Recurring Pattern" value={draft.recurringPattern} onChange={(value) => update("recurringPattern", value)} />
        <TextArea label="Pressure Points" value={draft.pressurePoints.join("\n")} onChange={(value) => update("pressurePoints", splitLines(value))} />
        <TextArea label="Desired Authority" value={draft.desiredAuthority} onChange={(value) => update("desiredAuthority", value)} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-red-200">{error}</p>
        <Button onClick={confirm} disabled={loading} className="gap-2">
          <Check className="h-4 w-4" />
          {loading ? "Confirming..." : "This is accurate"}
        </Button>
      </div>
    </Panel>
  );
}

function ChargesScreen({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  async function openTrial() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, charges: selected })
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not open trial.");
      return;
    }
    router.refresh();
  }

  return (
    <Panel className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Choose Charges</p>
          <h2 className="mt-2 text-2xl font-semibold">Select exactly 3 legal rights.</h2>
        </div>
        <div className="text-sm text-wilderness-glass">{selected.length}/3 selected</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {LEGAL_RIGHTS.map((right) => {
          const active = selected.includes(right.id);
          return (
            <button
              key={right.id}
              type="button"
              onClick={() => toggle(right.id)}
              className={`min-h-32 rounded-md border p-4 text-left transition ${
                active ? "border-wilderness-glass bg-wilderness-glass/15" : "border-white/10 bg-black/15 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-wilderness-paper">{right.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-wilderness-sage">{right.principality}</p>
                </div>
                {active ? <Check className="h-5 w-5 text-wilderness-glass" /> : <Circle className="h-5 w-5 text-white/25" />}
              </div>
              <p className="mt-3 text-sm leading-5 text-wilderness-glass">{right.pattern}</p>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-red-200">{error}</p>
        <Button onClick={openTrial} disabled={selected.length !== 3 || loading} className="gap-2">
          <Gavel className="h-4 w-4" />
          {loading ? "Opening trial..." : "Open trial"}
        </Button>
      </div>
    </Panel>
  );
}

function TrialScreen({ session, initialMessages }: { session: PracticeSession; initialMessages: Message[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [currentCharge, setCurrentCharge] = useState(session.current_charge);
  const [groundGiven, setGroundGiven] = useState(session.ground_given);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const charges = useMemo(() => getRightsByIds(session.charges ?? []), [session.charges]);
  const latestCourt = [...messages].reverse().find((message) => message.speaker === "court")?.content;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim()) return;
    const content = reply;
    setReply("");
    setLoading(true);
    setError("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), session_id: session.id, speaker: "user", content, created_at: new Date().toISOString() }
    ]);

    const response = await fetch("/api/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, content })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "The turn could not be evaluated.");
      return;
    }
    if (payload.status === "verdict") {
      router.refresh();
      return;
    }
    setCurrentCharge(payload.currentCharge);
    setGroundGiven(payload.groundGiven);
    setMessages((current) => [
      ...current,
      { id: Date.now() + 1, session_id: session.id, speaker: "court", content: payload.guidance, created_at: new Date().toISOString() },
      { id: Date.now() + 2, session_id: session.id, speaker: "accusations", content: payload.accusation, created_at: new Date().toISOString() }
    ]);
  }

  async function recess() {
    await fetch("/api/recess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id })
    });
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel className="space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">The Court</p>
        <div className="grid gap-3">
          {charges.map((charge, index) => (
            <div
              key={charge.id}
              className={`rounded-md border p-4 ${
                index < currentCharge
                  ? "border-wilderness-glass bg-wilderness-glass/15"
                  : index === currentCharge
                    ? "border-wilderness-warning bg-wilderness-warning/10"
                    : "border-white/10 bg-black/15"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{charge.label}</p>
                <span className="text-xs uppercase tracking-[0.16em] text-wilderness-sage">{index < currentCharge ? "cast down" : "pending"}</span>
              </div>
              <p className="mt-2 text-sm leading-5 text-wilderness-glass">{charge.pattern}</p>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-wilderness-sage">Guidance</p>
          <p className="mt-2 text-sm leading-6 text-wilderness-glass">{latestCourt ?? "Name the accusation plainly."}</p>
          <p className="mt-3 text-xs text-wilderness-sage">Ground given: {groundGiven}</p>
        </div>
        <Button variant="secondary" onClick={recess} className="w-full gap-2">
          <Pause className="h-4 w-4" />
          Recess
        </Button>
      </Panel>

      <Panel className="grid min-h-[620px] grid-rows-[auto_1fr_auto] gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Trial</p>
          <h2 className="mt-2 text-2xl font-semibold">Answer Accusations.</h2>
        </div>
        <MessageList messages={messages.filter((message) => message.speaker !== "clerk")} />
        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={3}
            placeholder="Stand, answer, and refuse ground."
            className="w-full resize-none rounded-md border border-white/10 bg-black/25 p-4 text-sm text-wilderness-paper outline-none ring-wilderness-sage/40 placeholder:text-white/30 focus:ring-2"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-red-200">{error}</p>
            <Button disabled={loading || !reply.trim()} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              {loading ? "Evaluating..." : "Answer"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function VerdictScreen({ session }: { session: PracticeSession }) {
  const score = session.score;
  return (
    <Panel className="mx-auto w-full max-w-3xl space-y-5">
      <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Verdict</p>
      <h2 className="text-3xl font-semibold">Session complete.</h2>
      {score ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-wilderness-glass">Charges completed</p>
              <p className="mt-2 text-3xl font-semibold">{score.completedCharges}/3</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-wilderness-glass">Ground given</p>
              <p className="mt-2 text-3xl font-semibold">{score.groundGiven}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-7">
            {Object.entries(score.steps).map(([step, value]) => (
              <div key={step} className="rounded-md border border-white/10 bg-black/15 p-3 text-center">
                <p className="text-xs capitalize text-wilderness-sage">{step}</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {score.teaching.map((line) => (
              <p key={line} className="text-sm leading-6 text-wilderness-glass">{line}</p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-wilderness-glass">No score was recorded.</p>
      )}
      <a className="inline-flex min-h-11 items-center rounded-md bg-wilderness-glass px-4 text-sm font-semibold text-wilderness-ink" href="/wilderness">
        Return home
      </a>
    </Panel>
  );
}

function SupportScreen() {
  return (
    <Panel className="mx-auto w-full max-w-3xl">
      <ShieldAlert className="h-8 w-8 text-wilderness-warning" />
      <p className="mt-4 text-xs uppercase tracking-[0.3em] text-wilderness-sage">Safety Stop</p>
      <h2 className="mt-2 text-3xl font-semibold">This exercise has been stopped.</h2>
      <p className="mt-4 text-sm leading-6 text-wilderness-glass">
        This app is not built for crisis care, severe abuse, coercive control, or imminent danger. If anyone is in immediate danger,
        stop using this tool and contact local emergency services or a trusted crisis service in your country now.
      </p>
      <a className="mt-6 inline-flex min-h-11 items-center rounded-md bg-wilderness-glass px-4 text-sm font-semibold text-wilderness-ink" href="/wilderness">
        Return home
      </a>
    </Panel>
  );
}

function AdjournedScreen() {
  return (
    <Panel className="mx-auto w-full max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Adjourned</p>
      <h2 className="mt-2 text-3xl font-semibold">The session is closed.</h2>
      <p className="mt-4 text-sm leading-6 text-wilderness-glass">The transcript has been wiped for privacy.</p>
      <a className="mt-6 inline-flex min-h-11 items-center rounded-md bg-wilderness-glass px-4 text-sm font-semibold text-wilderness-ink" href="/wilderness">
        Return home
      </a>
    </Panel>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="overflow-y-auto rounded-md border border-white/10 bg-black/15 p-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[86%] rounded-md border p-3 ${
              message.speaker === "user"
                ? "ml-auto border-wilderness-glass/30 bg-wilderness-glass/10"
                : message.speaker === "accusations"
                  ? "border-wilderness-danger/35 bg-wilderness-danger/10"
                  : "border-white/10 bg-white/5"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wilderness-sage">{message.speaker}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-wilderness-paper">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm outline-none ring-wilderness-sage/40 focus:ring-2"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-md border border-white/10 bg-black/25 p-3 text-sm outline-none ring-wilderness-sage/40 focus:ring-2"
      />
    </div>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
