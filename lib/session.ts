import { createAdminClient } from "@/lib/supabase";
import { CourtEvaluation, CourtStep, Score } from "@/lib/types";

export const COURT_STEPS: CourtStep[] = ["name", "deny", "renounce", "resist", "declare", "stand", "seal"];

export function emptyScore(): Score {
  return {
    completedCharges: 0,
    groundGiven: 0,
    steps: {
      name: 0,
      deny: 0,
      renounce: 0,
      resist: 0,
      declare: 0,
      stand: 0,
      seal: 0
    },
    teaching: []
  };
}

export function applyEvaluationToScore(score: Score | null, evaluation: CourtEvaluation, completedCharges: number, groundGiven: number): Score {
  const next = score ?? emptyScore();
  if (evaluation.passed) {
    next.steps[evaluation.step] += 1;
  }
  next.completedCharges = completedCharges;
  next.groundGiven = groundGiven;
  next.teaching = buildTeaching(next);
  return next;
}

export function buildTeaching(score: Score): string[] {
  const strongest = COURT_STEPS.filter((step) => score.steps[step] > 0);
  const lines = [
    `You completed ${score.completedCharges} of 3 charges.`,
    `Ground was given ${score.groundGiven} time${score.groundGiven === 1 ? "" : "s"}.`
  ];

  if (strongest.length) {
    lines.push(`Your clearest steps were: ${strongest.map((step) => step.replace("_", " ")).join(", ")}.`);
  } else {
    lines.push("Practice naming the accusation plainly before responding to it.");
  }

  return lines;
}

export async function endSession(sessionId: string, status: "verdict" | "adjourned" | "stopped", score?: Score) {
  const admin = createAdminClient();

  await admin.from("messages").delete().eq("session_id", sessionId);

  const updates: Record<string, unknown> = { status };
  if (score) updates.score = score;

  const { error } = await admin.from("sessions").update(updates).eq("id", sessionId);
  if (error) {
    throw error;
  }
}
