import { NextResponse } from "next/server";
import { requireMember } from "@/lib/supabase";

export async function POST() {
  const { user, supabase } = await requireMember();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      status: "deposition"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("messages").insert({
    session_id: data.id,
    speaker: "clerk",
    content: "State the recurring problem in roles only. Who is involved, and what keeps repeating?"
  });

  return NextResponse.json({ id: data.id });
}
