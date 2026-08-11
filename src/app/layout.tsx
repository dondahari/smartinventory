import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartResale AI - Resale Inventory & Liquid Capital Tracker",
  description: "Track liquid capital stored in resale inventory, snap photo AI vision auto-tagging, live pricing comps on eBay, Depop, and Poshmark, and storage location tracking.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 flex flex-col">{children}</body>
    </html>
  );
}
