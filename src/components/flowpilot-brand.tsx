import Link from "next/link";
import { Orbit } from "lucide-react";

export default function FlowPilotBrand({ href = "/" }: { href?: "/" | "/dashboard" }) {
  return (
    <Link href={href} className="flow-brand" aria-label="FlowPilot home">
      <span className="flow-mark"><Orbit size={22} aria-hidden="true" /></span>
      <span>FlowPilot <span className="flow-brand-crm">CRM</span></span>
    </Link>
  );
}
