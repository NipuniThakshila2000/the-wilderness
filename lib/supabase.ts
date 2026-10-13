import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createBrowserClient as createSupabaseBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)
  );
}

export function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies; route handlers can.
          }
        }
      }
    }
  );
}

export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceRoleKey),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function requireMember() {
  const supabase = createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: member, error } = await admin
    .from("members_allowlist")
    .select("email, active")
    .eq("email", user.email.toLowerCase())
    .eq("active", true)
    .maybeSingle();

  if (error || !member) {
    await supabase.auth.signOut();
    redirect("/login?error=not_allowed");
  }

  return { user, supabase };
}
