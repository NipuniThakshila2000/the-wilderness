import Link from "next/link";
import { FileText, Scale, ShieldCheck } from "lucide-react";
import { Header, Panel, Shell } from "@/components/ui";
import { requireMember } from "@/lib/supabase";
import { PracticeSession } from "@/lib/types";

export default async function WildernessHome() {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);
  const sessions = (data ?? []) as PracticeSession[];

  return (
    <Shell>
      <Header />
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="flex min-h-[360px] flex-col justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-wilderness-glass text-wilderness-ink">
              <Scale className="h-6 w-6" />
            </div>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-wilderness-paper">
              Practice standing in authority against selected accusations.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-wilderness-glass">
              A private exercise for active members: deposition, case file, three charges, trial turns, verdict.
            </p>
          </div>
          <Link
            href="/wilderness/new"
            className="mt-8 inline-flex min-h-11 w-fit items-center justify-center rounded-md bg-wilderness-glass px-4 text-sm font-semibold text-wilderness-ink transition hover:bg-white"
          >
            Start new session
          </Link>
        </Panel>

        <div className="grid gap-5">
          <Panel>
            <ShieldCheck className="h-6 w-6 text-wilderness-sage" />
            <h3 className="mt-4 text-lg font-semibold">Consent Boundary</h3>
            <p className="mt-2 text-sm leading-6 text-wilderness-glass">
              This tool is not emergency, pastoral, legal, or medical care. Safety concerns stop the exercise.
            </p>
          </Panel>
          <Panel>
            <FileText className="h-6 w-6 text-wilderness-sage" />
            <h3 className="mt-4 text-lg font-semibold">Recent Scores</h3>
            <div className="mt-4 space-y-3">
              {sessions.length === 0 && <p className="text-sm text-wilderness-glass">No sessions yet.</p>}
              {sessions.map((session) => (
                <Link
                  href={`/wilderness/session/${session.id}`}
                  key={session.id}
                  className="block rounded-md border border-white/10 bg-black/15 p-3 transition hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium capitalize">{session.status}</span>
                    <span className="text-xs text-wilderness-sage">{new Date(session.created_at).toLocaleDateString()}</span>
                  </div>
                  {session.score && (
                    <p className="mt-2 text-xs text-wilderness-glass">
                      {session.score.completedCharges}/3 charges, {session.score.groundGiven} ground given
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
