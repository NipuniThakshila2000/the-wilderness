import { NextResponse } from "next/server";
import { z } from "zod";
import { askJSON, askText } from "@/lib/claude";
import { accusationsPrompt, courtPrompt } from "@/lib/prompts";
import { applyEvaluationToScore, endSession } from "@/lib/session";
import { requireMember } from "@/lib/supabase";
import { CaseFile, CourtEvaluation, Message, Score } from "@/lib/types";

const TurnSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(4000)
});

export async function POST(request: Request) {
  const body = TurnSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid trial turn." }, { status: 400 });
  }

  const { supabase } = await requireMember();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", body.data.sessionId)
    .single();

  if (sessionError || !session || session.status !== "trial" || !session.case_file || !session.charges) {
    return NextResponse.json({ error: "Trial is not open." }, { status: 409 });
  }

  await supabase.from("messages").insert({
    session_id: body.data.sessionId,
    speaker: "user",
    content: body.data.content
  });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", body.data.sessionId)
    .order("created_at", { ascending: true });

  const evaluation = await askJSON<CourtEvaluation>({
    system: "You are The Court and return strict JSON only.",
    prompt: courtPrompt({
      caseFile: session.case_file as CaseFile,
      charges: session.charges as string[],
      currentCharge: session.current_charge,
      messages: (messages ?? []) as Message[],
      userReply: body.data.content
    }),
    model: "claude-haiku-5-5"
  });

  const groundGiven = session.ground_given + (evaluation.groundGiven ? 1 : 0);
  const completedCharges = evaluation.completeCharge ? session.current_charge + 1 : session.current_charge;
  const currentCharge = Math.min(completedCharges, 2);
  const score = applyEvaluationToScore(session.score as Score | null, evaluation, completedCharges, groundGiven);

  await supabase.from("messages").insert({
    session_id: body.data.sessionId,
    speaker: "court",
    content: evaluation.guidance
  });

  if (completedCharges >= 3) {
    await endSession(body.data.sessionId, "verdict", score);
    return NextResponse.json({ status: "verdict", score, evaluation });
  }

  const accusation = await askText({
    system: "You are Accusations in a bounded courtroom practice.",
    prompt: accusationsPrompt({
      caseFile: session.case_file as CaseFile,
      charges: session.charges as string[],
      currentCharge,
      evaluation
    }),
    model: "claude-sonnet-5-5"
  });

  await supabase.from("messages").insert({
    session_id: body.data.sessionId,
    speaker: "accusations",
    content: accusation
  });

  const { error } = await supabase
    .from("sessions")
    .update({
      current_charge: currentCharge,
      ground_given: groundGiven,
      score
    })
    .eq("id", body.data.sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    status: "trial",
    accusation,
    guidance: evaluation.guidance,
    currentCharge,
    groundGiven,
    score,
    evaluation
  });
}
