import { notFound } from "next/navigation";
import { Header, Shell } from "@/components/ui";
import { SessionWorkspace } from "@/components/session-workspace";
import { requireMember } from "@/lib/supabase";
import { Message, PracticeSession } from "@/lib/types";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireMember();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", params.id).single();

  if (!session) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <Shell>
      <Header />
      <SessionWorkspace session={session as PracticeSession} messages={(messages ?? []) as Message[]} />
    </Shell>
  );
}
