import type { Metadata } from "next";
import "./globals.css";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const metadata: Metadata = {
  title: "UB-Mager Admin",
  description: "Admin dashboard for UB-Mager ride-hailing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4A843" />
      </head>
      <body className="antialiased">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
