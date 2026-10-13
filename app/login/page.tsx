import { LoginForm } from "@/components/login-form";
import { Panel, Shell } from "@/components/ui";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <Shell>
      <div className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center">
        <Panel className="w-full">
          <p className="text-xs uppercase tracking-[0.34em] text-wilderness-sage">Members only</p>
          <h1 className="mt-3 text-3xl font-semibold text-wilderness-paper">Enter The Wilderness</h1>
          <p className="mt-3 text-sm leading-6 text-wilderness-glass">
            Use the email attached to your active Mighty Networks membership. Access is verified before a magic link is sent.
          </p>
          {searchParams.error === "not_allowed" && (
            <p className="mt-4 rounded-md border border-wilderness-danger/50 bg-wilderness-danger/10 p-3 text-sm text-red-100">
              Your session email is not currently active on the members allowlist.
            </p>
          )}
          <div className="mt-6">
            <LoginForm />
          </div>
        </Panel>
      </div>
    </Shell>
  );
}
