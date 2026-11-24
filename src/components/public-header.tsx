import Link from "next/link";
import FlowPilotBrand from "@/components/flowpilot-brand";

export default function PublicHeader() {
  return (
    <header className="flow-public-nav flow-wrap">
      <FlowPilotBrand />
      <Link href="/login" className="flow-button flow-button-outline">Live Demo</Link>
    </header>
  );
}
