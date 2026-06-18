import type { Metadata } from "next";

import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";

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
      <body>
        <ScrollToTopOnNavigate />
        {children}
      </body>
    </html>
  );
}
