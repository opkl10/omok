import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מערכת בלוג",
  description: "מערכת ניהול תוכן",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
