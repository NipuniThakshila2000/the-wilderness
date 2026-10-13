import { NextResponse } from "next/server";
import { z } from "zod";
import { askJSON, askText } from "@/lib/claude";
import { caseFilePrompt, clerkTurnPrompt, CLERK_PROMPT, SAFETY_STOP } from "@/lib/prompts";
import { endSession } from "@/lib/session";
import { requireMember } from "@/lib/supabase";
import { CaseFile, Message } from "@/lib/types";

const ClerkSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(4000)
});

export async function POST(request: Request) {
  const body = ClerkSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid clerk request." }, { status: 400 });
  }

  const { supabase } = await requireMember();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", body.data.sessionId)
    .single();

  if (sessionError || !session || session.status !== "deposition") {
    return NextResponse.json({ error: "Deposition is not open." }, { status: 409 });
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

  const reply = await askText({
    system: CLERK_PROMPT,
    prompt: clerkTurnPrompt((messages ?? []) as Message[]),
    model: "claude-sonnet-5-5"
  });

  if (reply.trim() === SAFETY_STOP) {
    await endSession(body.data.sessionId, "stopped");
    return NextResponse.json({ status: "stopped" });
  }

  if (reply.includes("[[READY_FOR_CASE_FILE]]")) {
    const caseFile = await askJSON<CaseFile>({
      system: "You turn depositions into structured case files.",
      prompt: caseFilePrompt((messages ?? []) as Message[]),
      model: "claude-sonnet-5-5"
    });

    await supabase
      .from("sessions")
      .update({ status: "casefile", case_file: caseFile })
      .eq("id", body.data.sessionId);

    await supabase.from("messages").insert({
      session_id: body.data.sessionId,
      speaker: "clerk",
      content: "The deposition is complete. Review the case file for accuracy."
    });

    return NextResponse.json({ status: "casefile", caseFile });
  }

  await supabase.from("messages").insert({
    session_id: body.data.sessionId,
    speaker: "clerk",
    content: reply
  });

  return NextResponse.json({ status: "deposition", reply });
}
