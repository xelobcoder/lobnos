"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { customFetch } from "../../../components/Auth/customFetch";

interface RawTest { id: number; name: string; category: number | null; testprice?: number; price?: number; }
interface TestItem { id: string; name: string; category: string; }
interface Department { id: number; department: string; }
interface CompanyInfo { name?: string; email?: string; phonenumber?: string; address?: string; street?: string; motto?: string; }

function groupByCategory(tests: TestItem[]): Record<string, TestItem[]> {
  return tests.reduce<Record<string, TestItem[]>>((acc, t) => {
    const cat = t.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});
}

const TODAY = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const NAVY = "#162236"; const BLUE = "#2563eb"; const BORDER = "#cbd5e1"; const MUTED = "#64748b";

/* ── Reusable paper-form field box (used in the capture zone) ── */
function PaperField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div style={{ flex: wide ? "2 1 200px" : "1 1 110px", minWidth: 0 }}>
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: MUTED, marginBottom: 2 }}>{label}</div>
      <div style={{
        border: `1.2px solid #94a3b8`, borderRadius: 3, minHeight: 26, padding: "3px 6px",
        fontSize: 12, fontWeight: 600, color: "#0f172a", background: "#fff",
      }}>
        {value || "\u00a0"}
      </div>
    </div>
  );
}

/* ── Paper checkbox ── */
function PaperCheck({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 4px" }}>
      <div style={{
        width: 13, height: 13, border: `1.5px solid ${checked ? NAVY : "#94a3b8"}`,
        borderRadius: 2, background: checked ? NAVY : "#fff", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1,5 3.5,7.5 8,2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>}
      </div>
      <span style={{ fontSize: 11, color: checked ? "#0f172a" : "#334155", fontWeight: checked ? 600 : 400 }}>{label}</span>
    </div>
  );
}

export default function TRFPAGE() {
  const [testList, setTestList] = useState<TestItem[]>([]);
  const [company, setCompany] = useState<CompanyInfo>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"idle" | "pdf" | "print">("idle");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientId, setPatientId] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split("T")[0]);
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  const captureRef = useRef<HTMLDivElement>(null);
  const letterheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      customFetch("testpanel/list/bulk").catch(() => null),
      customFetch("departments").catch(() => null),
      customFetch("settings/companyprofile").catch(() => null),
    ]).then(([pr, dr, cr]) => {
      const depts: Department[] = Array.isArray(dr?.data) ? dr.data : [];
      setDepartments(depts);
      const deptMap: Record<number, string> = {};
      depts.forEach((d) => { deptMap[d.id] = d.department; });
      const rawTests: RawTest[] = Array.isArray(pr?.data) ? pr.data : [];
      const mapped: TestItem[] = rawTests.map((t) => ({
        id: String(t.id),
        name: t.name,
        category: t.category != null && deptMap[t.category] ? deptMap[t.category] : "General",
      }));
      setTestList(mapped);
      if (cr && typeof cr === "object") setCompany(cr as CompanyInfo);
      setLoading(false);
    });
  }, []);

  const allGrouped = groupByCategory(testList);
  const sortedAllCats = Object.keys(allGrouped).sort();

  const filtered = searchTerm.trim()
    ? testList.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : testList;
  const grouped = groupByCategory(filtered);
  const sortedCats = Object.keys(grouped).sort();

  const toggle = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const toggleCategory = useCallback((cat: string, tests: TestItem[]) => {
    const ids = tests.map(t => t.id);
    setSelected(prev => {
      const allSel = ids.every(id => prev.has(id));
      const n = new Set(prev);
      allSel ? ids.forEach(id => n.delete(id)) : ids.forEach(id => n.add(id));
      return n;
    });
  }, []);

  const captureAndExport = useCallback(async (mode: "pdf" | "print") => {
    if (!captureRef.current || !letterheadRef.current) return;
    setBusy(mode);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"), import("jspdf"),
      ]);
      const opt = { scale: 2, useCORS: true, backgroundColor: "#fff", logging: false, scrollX: 0, scrollY: 0 };
      const [lhCanvas, mainCanvas] = await Promise.all([
        html2canvas(letterheadRef.current, { ...opt, windowWidth: letterheadRef.current.scrollWidth }),
        html2canvas(captureRef.current,    { ...opt, windowWidth: captureRef.current.scrollWidth }),
      ]);

      const A4_W = 210; const MARGIN = 10;
      const usableW = A4_W - MARGIN * 2;
      const mmPerPx = usableW / mainCanvas.width;
      const lhMmH   = (lhCanvas.height / lhCanvas.width) * usableW;
      const GAP = 4; // mm gap between letterhead and content on subsequent pages
      const page1H   = 297 - MARGIN * 2;               // mm usable on page 1
      const pageNH   = 297 - MARGIN * 2 - lhMmH - GAP; // mm usable on pages 2+
      const page1Px  = Math.round(page1H  / mmPerPx);
      const pageNPx  = Math.round(pageNH  / mmPerPx);

      const crop = (src: HTMLCanvasElement, sy: number, sh: number) => {
        const c = document.createElement("canvas");
        c.width = src.width; c.height = Math.max(1, Math.round(sh));
        c.getContext("2d")!.drawImage(src, 0, Math.round(sy), src.width, Math.round(sh), 0, 0, src.width, Math.round(sh));
        return c;
      };

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      let consumed = 0;
      let pageNum  = 0;

      while (consumed < mainCanvas.height) {
        if (pageNum > 0) doc.addPage();
        let contentY = MARGIN;

        if (pageNum > 0) {
          // Add letterhead on subsequent pages
          const lhScaled = usableW / lhCanvas.width * usableW; // keep ratio
          doc.addImage(lhCanvas.toDataURL("image/png"), "PNG", MARGIN, MARGIN, usableW, lhMmH);
          contentY = MARGIN + lhMmH + GAP;
        }

        const slicePx  = pageNum === 0 ? page1Px : pageNPx;
        const actualPx = Math.min(slicePx, mainCanvas.height - consumed);
        const slice    = crop(mainCanvas, consumed, actualPx);
        doc.addImage(slice.toDataURL("image/png"), "PNG", MARGIN, contentY, usableW, actualPx * mmPerPx);
        consumed += actualPx;
        pageNum++;
      }

      const fname = `TRF_${(company.name || "Lab").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      if (mode === "pdf") {
        doc.save(fname);
      } else {
        const url = URL.createObjectURL(doc.output("blob"));
        const win = window.open(url, "_blank");
        if (win) win.addEventListener("load", () => { win.focus(); win.print(); setTimeout(() => URL.revokeObjectURL(url), 6000); });
      }
    } catch (e) { console.error(e); alert("Export failed, please try again."); }
    finally { setBusy("idle"); }
  }, [company.name]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  const btnBase: React.CSSProperties = {
    border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    opacity: busy !== "idle" ? 0.6 : 1, pointerEvents: busy !== "idle" ? "none" : "auto",
  };

  /* ── Input style for screen form ── */
  const inp: React.CSSProperties = {
    width: "100%", border: `1px solid ${BORDER}`, borderRadius: 5,
    padding: "5px 8px", fontSize: 13, outline: "none", background: "#fff",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 920 }}>

      {/* ════ TOOLBAR ════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 800, color: NAVY }}>Patient Test Request Form</h4>
          <small style={{ color: MUTED }}>Fill in details · tick tests · Download PDF or Print</small>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="text" placeholder="🔍 Filter tests…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inp, width: 170 }} />
          <span style={{ background: BLUE, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{selected.size} selected</span>
          <button onClick={() => setSelected(new Set(testList.map(t => t.id)))} style={{ ...btnBase, background: "#fff", color: NAVY, border: `1px solid ${BORDER}` }}>Select All</button>
          {selected.size > 0 && <button onClick={() => setSelected(new Set())} style={{ ...btnBase, background: "#fff", color: NAVY, border: `1px solid ${BORDER}` }}>Clear</button>}
          <button onClick={() => captureAndExport("pdf")} style={{ ...btnBase, background: NAVY, color: "#fff" }}>
            {busy === "pdf" ? <><span className="spinner-border spinner-border-sm" /> Generating…</> : <>⬇ Download PDF</>}
          </button>
          <button onClick={() => captureAndExport("print")} style={{ ...btnBase, background: BLUE, color: "#fff" }}>
            {busy === "print" ? <><span className="spinner-border spinner-border-sm" /> Preparing…</> : <>🖨 Print</>}
          </button>
        </div>
      </div>

      {/* ════ SCREEN INTERACTIVE FORM ════ */}
      <div style={{ background: "#fff", padding: "20px 4px" }}>
        {/* accent */}
        <div style={{ height: 5, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: 3, marginBottom: 14 }} />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${NAVY}`, paddingBottom: 12, marginBottom: 14, gap: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: NAVY, textTransform: "uppercase" }}>{company.name || "Laboratory Services"}</div>
            {company.motto && <div style={{ fontSize: 11, color: MUTED, fontStyle: "italic", marginTop: 2 }}>{company.motto}</div>}
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
              {[company.address, company.street].filter(Boolean).join(", ")}
              {company.phonenumber && <> · Tel: {company.phonenumber}</>}
              {company.email && <> · {company.email}</>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1.2, borderBottom: `3px solid ${BLUE}`, paddingBottom: 3, marginBottom: 4 }}>Test Request Form</div>
            <div style={{ fontSize: 11, color: MUTED }}>Date: {TODAY}</div>
          </div>
        </div>

        {/* patient fields */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, borderBottom: `1px solid ${BORDER}`, paddingBottom: 5, marginBottom: 10 }}>Patient Information</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 180px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Patient Name</label><input style={inp} placeholder="Full name" value={patientName} onChange={e => setPatientName(e.target.value)} /></div>
            <div style={{ flex: "1 1 80px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Age</label><input style={inp} placeholder="e.g. 34" value={patientAge} onChange={e => setPatientAge(e.target.value)} /></div>
            <div style={{ flex: "1 1 100px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Gender</label>
              <select style={inp} value={patientGender} onChange={e => setPatientGender(e.target.value)}>
                <option value="">— select —</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{ flex: "1 1 110px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Patient ID</label><input style={inp} placeholder="Optional" value={patientId} onChange={e => setPatientId(e.target.value)} /></div>
            <div style={{ flex: "1 1 130px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Sample Date</label><input style={inp} type="date" value={sampleDate} onChange={e => setSampleDate(e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Referred By / Clinician</label><input style={inp} placeholder="Doctor / Ward / Facility" value={referredBy} onChange={e => setReferredBy(e.target.value)} /></div>
            <div style={{ flex: "1 1 240px" }}><label style={{ fontSize: 11, fontWeight: 700, color: MUTED, display: "block", marginBottom: 3 }}>Clinical Information</label><input style={inp} placeholder="Optional clinical notes" value={clinicalInfo} onChange={e => setClinicalInfo(e.target.value)} /></div>
          </div>
        </div>

        {/* test heading */}
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, borderBottom: `2px solid ${NAVY}`, paddingBottom: 5, marginBottom: 12 }}>
          Test / Investigation Selection <span style={{ fontWeight: 400, fontSize: 10, color: MUTED, textTransform: "none", letterSpacing: 0 }}>— click category header to select all in group</span>
        </div>

        {/* test grid — screen */}
        {sortedCats.map(cat => {
          const catTests = grouped[cat];
          const allCk = catTests.every(t => selected.has(t.id));
          const someCk = !allCk && catTests.some(t => selected.has(t.id));
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div onClick={() => toggleCategory(cat, catTests)} style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY, color: "#fff", borderRadius: "5px 5px 0 0", padding: "5px 12px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ width: 14, height: 14, border: "2px solid #fff", borderRadius: 2, background: allCk ? BLUE : someCk ? "rgba(255,255,255,.3)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(allCk || someCk) && <svg width="9" height="9" viewBox="0 0 9 9">{allCk ? <polyline points="1,5 3.5,7.5 8,2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /> : <line x1="1" y1="4.5" x2="8" y2="4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />}</svg>}
                </div>
                <span style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>{cat}</span>
                <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.75 }}>({catTests.length})</span>
              </div>
              <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 5px 5px", padding: "6px 10px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "1px 8px", background: "#fff" }}>
                {catTests.map(test => {
                  const ck = selected.has(test.id);
                  return (
                    <label key={test.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 5px", borderRadius: 4, cursor: "pointer", background: ck ? "#eff6ff" : "transparent" }}>
                      <div onClick={() => toggle(test.id)} style={{ width: 14, height: 14, border: `2px solid ${ck ? BLUE : "#94a3b8"}`, borderRadius: 3, background: ck ? BLUE : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        {ck && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1,5 3.5,7.5 8,2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>}
                      </div>
                      <span style={{ fontSize: 12, color: ck ? "#0f172a" : "#334155", fontWeight: ck ? 600 : 400 }}>{test.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* signatures */}
        <div style={{ marginTop: 22, borderTop: `1.5px dashed ${BORDER}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, marginBottom: 12 }}>Authorisation &amp; Signatures</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {["Requesting Clinician Signature & Date", "Patient / Guardian Signature & Date", "Lab Receiving Officer & Date"].map(lbl => (
              <div key={lbl}><div style={{ height: 48, borderBottom: `1.5px solid #334155` }} /><div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{lbl}</div></div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, borderTop: `1px solid ${BORDER}`, paddingTop: 7, display: "flex", justifyContent: "space-between", fontSize: 10, color: MUTED }}>
          <span>{company.name || "Laboratory Services"} — Confidential Medical Document</span>
          <span>Generated: {TODAY}</span>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: 3, marginTop: 7 }} />
      </div>

      {/* ════ HIDDEN OFF-SCREEN OFFICIAL CAPTURE ZONE ════
           This is what html2canvas captures. No inputs, no placeholders,
           just clean bordered fill boxes and proper checkboxes.         */}
      <div
        ref={captureRef}
        aria-hidden="true"
        style={{
          position: "absolute", left: -9999, top: 0, width: 794,
          background: "#fff", padding: "28px 36px", fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* top accent */}
        <div style={{ height: 5, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: 3, marginBottom: 16 }} />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${NAVY}`, paddingBottom: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: -0.5 }}>{company.name || "Laboratory Services"}</div>
            {company.motto && <div style={{ fontSize: 11, color: MUTED, fontStyle: "italic", marginTop: 2 }}>{company.motto}</div>}
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
              {[company.address, company.street].filter(Boolean).join(", ")}
              {company.phonenumber && <> · Tel: {company.phonenumber}</>}
              {company.email && <> · {company.email}</>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: 2, borderBottom: `3px solid ${BLUE}`, paddingBottom: 4, marginBottom: 5 }}>Test Request Form</div>
            <div style={{ fontSize: 11, color: MUTED }}>Date: {TODAY}</div>
          </div>
        </div>

        {/* patient info — bordered boxes */}
        <div style={{ border: `1.2px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, background: "#f8fafc" }}>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, borderBottom: `1px solid ${BORDER}`, paddingBottom: 5, marginBottom: 10 }}>Patient Information</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <PaperField label="Patient Name" value={patientName} wide />
            <PaperField label="Age" value={patientAge} />
            <PaperField label="Gender" value={patientGender} />
            <PaperField label="Patient ID" value={patientId} />
            <PaperField label="Sample Date" value={sampleDate} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PaperField label="Referred By / Requesting Clinician" value={referredBy} wide />
            <PaperField label="Clinical Information / Diagnosis" value={clinicalInfo} wide />
          </div>
        </div>

        {/* test selection heading */}
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, borderBottom: `2px solid ${NAVY}`, paddingBottom: 5, marginBottom: 12 }}>
          Test / Investigation Selection — tick required tests
        </div>

        {/* Show selected tests only (if any checked), otherwise show all */}
        {(() => {
          const testsToShow = selected.size > 0 ? testList.filter(t => selected.has(t.id)) : testList;
          const g = groupByCategory(testsToShow);
          return Object.keys(g).sort().map(cat => {
            const catTests = g[cat];
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ background: NAVY, color: "#fff", borderRadius: "4px 4px 0 0", padding: "4px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {cat} <span style={{ fontWeight: 400, opacity: 0.75 }}>({catTests.length})</span>
                </div>
                <div style={{ border: `1.2px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 4px 4px", padding: "6px 10px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1px 8px", background: "#fff" }}>
                  {catTests.map(t => <PaperCheck key={t.id} checked={selected.has(t.id)} label={t.name} />)}
                </div>
              </div>
            );
          });
        })()}

        {/* signatures */}
        <div style={{ marginTop: 22, borderTop: `1.5px dashed #cbd5e1`, paddingTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: NAVY, marginBottom: 14 }}>Authorisation &amp; Signatures</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
            {["Requesting Clinician Signature & Date", "Patient / Guardian Signature & Date", "Lab Receiving Officer & Date"].map(lbl => (
              <div key={lbl}>
                <div style={{ height: 52, borderBottom: `1.5px solid #334155` }} />
                <div style={{ fontSize: 9, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ marginTop: 18, borderTop: `1px solid ${BORDER}`, paddingTop: 7, display: "flex", justifyContent: "space-between", fontSize: 9, color: MUTED }}>
          <span>{company.name || "Laboratory Services"} — Confidential Medical Document</span>
          <span>Generated: {TODAY}</span>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: 3, marginTop: 7 }} />
      </div>

      {/* ════ HIDDEN LETTERHEAD — captured separately for page 2+ repetition ════ */}
      <div
        ref={letterheadRef}
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, top: 0, width: 794, background: "#fff", padding: "18px 36px 0 36px", fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >
        <div style={{ height: 5, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: 3, marginBottom: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: NAVY, textTransform: "uppercase" }}>{company.name || "Laboratory Services"}</div>
            {company.motto && <div style={{ fontSize: 10, color: MUTED, fontStyle: "italic", marginTop: 2 }}>{company.motto}</div>}
            <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>
              {[company.address, company.street].filter(Boolean).join(", ")}
              {company.phonenumber && <> · Tel: {company.phonenumber}</>}
              {company.email && <> · {company.email}</>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `3px solid ${BLUE}`, paddingBottom: 3, marginBottom: 4 }}>Test Request Form</div>
            <div style={{ fontSize: 10, color: MUTED }}>Date: {TODAY}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
