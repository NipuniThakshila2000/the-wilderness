import { NextResponse } from "next/server";
import { z } from "zod";
import { askText } from "@/lib/claude";
import { accusationsPrompt } from "@/lib/prompts";
import { getRightsByIds, LEGAL_RIGHTS } from "@/lib/rights";
import { emptyScore } from "@/lib/session";
import { requireMember } from "@/lib/supabase";
import { CaseFile, CourtEvaluation } from "@/lib/types";

const ChargesSchema = z.object({
  sessionId: z.string().uuid(),
  charges: z.array(z.string()).length(3)
});

export async function POST(request: Request) {
  const body = ChargesSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Select exactly 3 rights." }, { status: 400 });
  }

  const selected = getRightsByIds(body.data.charges);
  if (selected.length !== 3 || new Set(body.data.charges).size !== 3) {
    return NextResponse.json({ error: "Selected rights must be unique and valid." }, { status: 400 });
  }

  const { supabase } = await requireMember();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", body.data.sessionId)
    .single();

  if (sessionError || !session?.case_file || session.status !== "selecting") {
    return NextResponse.json({ error: "Case file is not ready." }, { status: 409 });
  }

  const openingEvaluation: CourtEvaluation = {
    step: "name",
    passed: false,
    groundGiven: false,
    groundType: "none",
    guidance: "Name the accusation without arguing with it.",
    accusationInstruction: "Open the first charge using one fact from the case file and one false conclusion.",
    completeCharge: false
  };

  const accusation = await askText({
    system: "You are Accusations in a bounded courtroom practice.",
    prompt: accusationsPrompt({
      caseFile: session.case_file as CaseFile,
      charges: body.data.charges,
      currentCharge: 0,
      evaluation: openingEvaluation
    }),
    model: "claude-sonnet-5-5"
  });

  const { error } = await supabase
    .from("sessions")
    .update({
      charges: body.data.charges,
      status: "trial",
      current_charge: 0,
      ground_given: 0,
      score: emptyScore()
    })
    .eq("id", body.data.sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("messages").insert([
    {
      session_id: body.data.sessionId,
      speaker: "court",
      content: openingEvaluation.guidance
    },
    {
      session_id: body.data.sessionId,
      speaker: "accusations",
      content: accusation
    }
  ]);

  return NextResponse.json({
    status: "trial",
    rights: LEGAL_RIGHTS,
    accusation,
    guidance: openingEvaluation.guidance
  });
}
