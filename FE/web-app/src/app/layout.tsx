// Force rebuild: 2025-11-13 05:15 UTC - Eliminate chunk 153 cache
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SocketIOLoader from "@/components/SocketIOLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVWarranty - Comprehensive Electric Vehicle Protection",
  description:
    "Leading provider of EV warranty solutions. Protect your electric vehicle investment with our comprehensive coverage, fast claims processing, and nationwide service network.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketIOLoader />
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
