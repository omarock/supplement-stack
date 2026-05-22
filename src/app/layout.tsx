import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VitalStack — AI-Powered Supplement Recommendations",
  description:
    "Get your personalized supplement stack in 2 minutes. AI-powered recommendations based on your health goals, lifestyle, and biology. Free, science-backed, and tailored to you.",
  keywords:
    "supplement recommendations, personalized supplements, AI supplement stack, health optimization, wellness",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
