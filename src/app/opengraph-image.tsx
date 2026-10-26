import { ImageResponse } from "next/og";

export const alt = "FlowPilot CRM — track clients, deals, projects, and tasks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, background: "#020617", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}><div style={{ width: 72, height: 72, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#22d3ee", color: "#020617", fontSize: 42, fontWeight: 900 }}>F</div><div style={{ fontSize: 34, fontWeight: 800 }}>FlowPilot CRM</div></div>
      <div style={{ marginTop: 48, maxWidth: 960, fontSize: 76, lineHeight: 1.05, fontWeight: 900 }}>Track clients. Move deals. Deliver projects.</div>
      <div style={{ marginTop: 30, fontSize: 28, color: "#cbd5e1" }}>Self-hosted CRM &amp; project management starter for freelancers and small agencies.</div>
    </div>,
    size,
  );
}
