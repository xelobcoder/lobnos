import { ImageResponse } from "next/og";

export const alt = "Prime Laboratory Software — connected laboratory operations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: "66px 78px", background: "linear-gradient(120deg, #edf2ea 0%, #f8f9f6 56%, #dce8ce 100%)", color: "#153f31", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", width: 54, height: 54, alignItems: "flex-end", gap: 5, borderRadius: 14, padding: 11, background: "#153f31" }}>
          <div style={{ width: 7, height: 18, borderRadius: 4, background: "#eff5e4" }} />
          <div style={{ width: 7, height: 31, borderRadius: 4, background: "#eff5e4" }} />
          <div style={{ width: 7, height: 24, borderRadius: 4, background: "#b9ce70" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 37, letterSpacing: "-3px" }}>prime</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px" }}>LABORATORY SOFTWARE</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span style={{ color: "#477050", fontSize: 15, fontWeight: 700, letterSpacing: "3px" }}>LABORATORY OPERATIONS, CONNECTED</span>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Georgia, serif", fontSize: 62, lineHeight: 1.04, letterSpacing: "-2px" }}>
          <span>One intelligent platform.</span>
          <span style={{ color: "#56805c" }}>Complete laboratory operations.</span>
        </div>
        <span style={{ maxWidth: 710, color: "#596b60", fontSize: 20 }}>Registration · Specimens · Results · Billing · Inventory · Reporting</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#607065", fontSize: 14 }}>
        <span>PRIMELABSYS.COM</span><span>PLS · LAB MANAGEMENT PLATFORM</span>
      </div>
      <div style={{ position: "absolute", right: -30, bottom: 30, color: "rgba(60,107,62,.07)", fontFamily: "Georgia, serif", fontSize: 320, letterSpacing: "-40px" }}>PLS</div>
    </div>,
    size,
  );
}
