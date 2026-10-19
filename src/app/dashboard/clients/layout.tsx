import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM clients",
  description: "Manage client opportunities and deal stages in your workspace.",
};

export default function ClientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
