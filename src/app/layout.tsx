import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duet — outfits planned together",
  description: "Plan matching outfits with your partner using AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-aurora min-h-screen font-sans">{children}</body>
    </html>
  );
}
