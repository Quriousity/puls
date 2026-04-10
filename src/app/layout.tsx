import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PULS",
  description: "Weight training & running tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-surface text-fg antialiased">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>

  );
}
