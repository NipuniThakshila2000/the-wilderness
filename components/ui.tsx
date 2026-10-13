import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
    </main>
  );
}

export function Header({ action }: { action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 pb-5">
      <Link href="/wilderness" className="group">
        <p className="text-xs uppercase tracking-[0.34em] text-wilderness-sage">The Wilderness</p>
        <h1 className="mt-1 text-2xl font-semibold text-wilderness-paper">Courtroom Practice</h1>
      </Link>
      {action}
    </header>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-wilderness-pine/78 p-5 shadow-court backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-wilderness-glass text-wilderness-ink hover:bg-white",
    secondary: "border border-white/15 bg-white/5 text-wilderness-paper hover:bg-white/10",
    danger: "border border-wilderness-danger/60 bg-wilderness-danger/10 text-red-100 hover:bg-wilderness-danger/20"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-xs font-semibold uppercase tracking-[0.22em] text-wilderness-sage">{children}</label>;
}
