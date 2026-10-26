import type { Metadata } from "next";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-slate-950">{children}<PublicFooter dark /></div>;
}
