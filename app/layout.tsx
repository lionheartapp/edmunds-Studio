import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "AdGenAI — Edmunds",
  description:
    "Turn a brand name into a complete, scheduled ad campaign in under 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
