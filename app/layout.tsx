import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antigravity | Horse Racing Prediction",
  description: "Official Antigravity Horse Racing Prediction Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen text-white`}
        suppressHydrationWarning
      >
        {/* Fixed Background Image */}
        <div
          className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/race-bg.jpg')" }}
        />

        {/* Dark Overlay for Readability */}
        <div className="fixed inset-0 z-[-1] bg-black/60 backdrop-blur-[2px]" />

        {children}
      </body>
    </html>
  );
}
