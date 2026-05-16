import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KiranaLink — Apni Kirana Shop Online Karo",
  description: "Chhote kirana shopkeepers ke liye simple digital ordering system. 30 din FREE.",
  keywords: "kirana shop, online order, digital kirana, WhatsApp order",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-noto-sans)]">{children}</body>
    </html>
  );
}
