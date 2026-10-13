import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createServerClient } from "@/lib/supabase";

const LoginSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const body = LoginSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = body.data.email.toLowerCase();
  const admin = createAdminClient();
  const { data: member, error: memberError } = await admin
    .from("members_allowlist")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (memberError || !member) {
    return NextResponse.json({ error: "This email is not on the members allowlist." }, { status: 403 });
  }

  const supabase = createServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/wilderness`
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
