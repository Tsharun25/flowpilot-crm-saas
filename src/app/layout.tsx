import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "FlowPilot CRM — Projects, Tasks & Sales Pipeline",
    template: "%s | FlowPilot CRM",
  },
  description:
    "A self-hosted CRM and project management starter for projects, Kanban tasks, client opportunities, and workspace analytics.",
  applicationName: "FlowPilot CRM",
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
