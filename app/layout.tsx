import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wilderness",
  description: "Members-only authority practice courtroom."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
