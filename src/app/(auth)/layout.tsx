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
  return <div className="flow-auth">{children}<PublicFooter /></div>;
}
