import { NextResponse } from "next/server";
import { z } from "zod";
import { requireMember } from "@/lib/supabase";

const CaseFileSchema = z.object({
  sessionId: z.string().uuid(),
  caseFile: z.object({
    title: z.string().min(1),
    problem: z.string().min(1),
    roles: z.array(z.string()).default([]),
    recurringPattern: z.string().min(1),
    pressurePoints: z.array(z.string()).default([]),
    desiredAuthority: z.string().min(1)
  })
});

export async function POST(request: Request) {
  const body = CaseFileSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid case file." }, { status: 400 });
  }

  const { supabase } = await requireMember();
  const { error } = await supabase
    .from("sessions")
    .update({ case_file: body.data.caseFile, status: "selecting" })
    .eq("id", body.data.sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "selecting" });
}
