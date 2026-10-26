import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FlowPilot CRM — Projects, Tasks & Sales Pipeline",
    template: "%s | FlowPilot CRM",
  },
  description:
    "A self-hosted CRM and project management starter for projects, Kanban tasks, client opportunities, and workspace analytics.",
  applicationName: "FlowPilot CRM",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FlowPilot CRM",
    title: "FlowPilot CRM — Self-hosted CRM & Project Management Starter",
    description: "Track clients, move deals, and deliver projects in one self-hosted workspace.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FlowPilot CRM product preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowPilot CRM — Self-hosted CRM & Project Management Starter",
    description: "Track clients, move deals, and deliver projects in one self-hosted workspace.",
    images: ["/opengraph-image"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
        />
      </body>
    </html>
  );
}
