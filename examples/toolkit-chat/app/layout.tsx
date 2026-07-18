import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Toolkit Chat",
  description: "A Next.js chat example powered by AI Toolkit SDK.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
