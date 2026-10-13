import { NextResponse } from "next/server";
import { z } from "zod";
import { endSession } from "@/lib/session";
import { requireMember } from "@/lib/supabase";

const RecessSchema = z.object({
  sessionId: z.string().uuid()
});

export async function POST(request: Request) {
  const body = RecessSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid recess request." }, { status: 400 });
  }

  const { supabase } = await requireMember();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", body.data.sessionId)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  await endSession(body.data.sessionId, "adjourned");
  return NextResponse.json({ status: "adjourned" });
}
