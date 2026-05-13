import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "huntFlow",
  description: "Track and manage your job applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
