import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
