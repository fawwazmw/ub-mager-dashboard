import type { Metadata } from "next";
import "./globals.css";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const metadata: Metadata = {
  title: {
    default: "UB Mager Operations Center",
    template: "%s | UB Mager",
  },
  description: "Admin dashboard for UB Mager ride-hailing platform — real-time tracking, driver management, and analytics",
  applicationName: "UB Mager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UB Mager",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/ubmagerlogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ubmagerlogo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4A843" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
