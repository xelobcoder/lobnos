"use client";
import React, { useState } from "react";

// ─── Robinson-Fleming formula (most widely cited, AIUM/ISUOG standard) ───────
// GA (days) = 8.052 × √CRL(mm) + 23.73
// Source: Robinson HP, Fleming JEE. A critical evaluation of sonar crown-rump
//   length measurements. Br J Obstet Gynaecol. 1975.
// Valid range: CRL 10–84 mm (approx. 6+0 to 13+6 weeks).
// ─────────────────────────────────────────────────────────────────────────────

function calculateGestationalAge(crlMm: number) {
	if (isNaN(crlMm) || crlMm <= 0) return { days: 0, weeks: 0, daysRemainder: 0 };
	const gaDays = 8.052 * Math.sqrt(crlMm) + 23.73;
	const gaWeeks = Math.floor(gaDays / 7);
	const gaDaysRemainder = Math.round(gaDays % 7);
	return { days: Math.round(gaDays), weeks: gaWeeks, daysRemainder: gaDaysRemainder };
}

function gaFromLmp(lmpStr: string, scanDateStr: string) {
	if (!lmpStr || !scanDateStr) return null;
	const lmp = new Date(lmpStr);
	const scan = new Date(scanDateStr);
	const diffDays = Math.round((scan.getTime() - lmp.getTime()) / 86400000);
	if (diffDays < 0) return null;
	return { weeks: Math.floor(diffDays / 7), days: diffDays % 7 };
}

function addDays(dateStr: string, n: number) {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}

function formatWeeksDays(weeks: number, days: number) {
	return `${weeks} weeks + ${days} days (${weeks}w${days}d)`;
}

export default function FirstTrimesterComprehensive() {
	const [form, setForm] = useState({
		// Scan metadata
		date: new Date().toISOString().slice(0, 10),
		externalRef: "",
		referredBy: "",
		indication: "",
		// Clinical
		patientAge: "",
		lmp: "",
		// Biometry
		crl: "",
		crlUnit: "mm" as "mm" | "cm",
		nt: "",          // Nuchal Translucency (mm)
		bpd: "",         // Biparietal Diameter if visible (mm)
		// Gestational sac
		gestationalSacs: "",
		sacMsd: "",      // Mean sac diameter (mm)
		// Embryo/Fetal
		fetalNumber: "1",
		fetalPole: "",
		yolkSac: "",
		cardiacActivity: "",
		fetalHeartRate: "",  // bpm
		amnioticFluid: "",
		// Uterus
		uterusPosition: "",
		uterusEchogenicity: "",
		subchronicHemorrhage: "",
		fibroids: "",
		// Adnexa
		rightOvary: "",
		leftOvary: "",
		adnexalMass: "",
		freeFluids: "",
		// Cervix
		cervix: "",
		// Conclusion
		impression: "",
		recommendation: "",
		sonographer: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const crlParsed = parseFloat(form.crl);
	const crlMm = form.crlUnit === "cm" ? crlParsed * 10 : crlParsed;
	const crlValid = !isNaN(crlMm) && crlMm >= 10 && crlMm <= 84;
	const crlOutOfRange = !isNaN(crlMm) && crlMm > 0 && !crlValid;

	const { days: gaDays, weeks: gaWeeks, daysRemainder: gaRem } = calculateGestationalAge(crlMm);

	// EDD by CRL = scan date + (280 - gaDays)
	const eddByCrl = crlValid ? addDays(form.date, 280 - gaDays) : "";

	// GA by LMP
	const gaByLmp = gaFromLmp(form.lmp, form.date);

	// EDD by LMP = LMP + 280 days
	const eddByLmp = form.lmp ? addDays(form.lmp, 280) : "";

	return (
		<div className="container-fluid px-4 py-4">
			<h5 className="mb-1 fw-bold">First Trimester Ultrasound Report</h5>
			<p className="text-muted small mb-4">Gestational age 6–14 weeks | Robinson-Fleming (1975) formula</p>

			<form autoComplete="off">
				{/* ── Section 1: Scan Info ─────────────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Scan Information</div>
					<div className="row g-3">
						<div className="col-md-3">
							<label className="form-label fw-semibold">Date of Scan</label>
							<input type="date" className="form-control custom-input" name="date" value={form.date} onChange={handleChange} />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">External / Lab Ref</label>
							<input type="text" className="form-control custom-input" name="externalRef" value={form.externalRef} onChange={handleChange} placeholder="Ref. number" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Referred By</label>
							<input type="text" className="form-control custom-input" name="referredBy" value={form.referredBy} onChange={handleChange} placeholder="Clinician / Facility" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Indication</label>
							<input type="text" className="form-control custom-input" name="indication" value={form.indication} onChange={handleChange} placeholder="e.g. Dating, viability" />
						</div>
					</div>
				</div>

				{/* ── Section 2: Clinical Data ─────────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Clinical Data</div>
					<div className="row g-3">
						<div className="col-md-2">
							<label className="form-label fw-semibold">Patient Age (yrs)</label>
							<input type="number" min="0" className="form-control custom-input" name="patientAge" value={form.patientAge} onChange={handleChange} />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">LMP</label>
							<input type="date" className="form-control custom-input" name="lmp" value={form.lmp} onChange={handleChange} />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">GA by LMP</label>
							<div className="form-control custom-input bg-light" style={{ minHeight: 38 }}>
								{gaByLmp ? (
									<span className="fw-semibold">{gaByLmp.weeks}w {gaByLmp.days}d</span>
								) : <span className="text-muted">—</span>}
							</div>
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">EDD by LMP</label>
							<div className="form-control custom-input bg-light" style={{ minHeight: 38 }}>
								{eddByLmp ? <span className="fw-semibold">{eddByLmp}</span> : <span className="text-muted">—</span>}
							</div>
						</div>
					</div>
				</div>

				{/* ── Section 3: Biometry ──────────────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Fetal Biometry</div>
					<div className="row g-3 align-items-end">
						<div className="col-md-2">
							<label className="form-label fw-semibold">CRL Unit</label>
							<select className="form-select custom-select" name="crlUnit" value={form.crlUnit} onChange={handleChange}>
								<option value="mm">mm</option>
								<option value="cm">cm</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">CRL ({form.crlUnit})</label>
							<input type="number" min="0" step="0.1" className={`form-control custom-input ${crlOutOfRange ? "border-warning" : ""}`} name="crl" value={form.crl} onChange={handleChange} />
							{crlOutOfRange && <small className="text-warning">CRL outside 10–84 mm range</small>}
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">GA by CRL (Sonographic)</label>
							<div className="form-control custom-input bg-light fw-bold" style={{ minHeight: 38, fontSize: "1rem" }}>
								{crlValid
									? <span>{gaWeeks}w {gaRem}d <small className="text-secondary fw-normal">({gaDays} days)</small></span>
									: <span className="text-muted fw-normal">Enter valid CRL ({form.crlUnit})</span>
								}
							</div>
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">EDD by CRL</label>
							<div className="form-control custom-input bg-light" style={{ minHeight: 38 }}>
								{eddByCrl ? <span className="fw-semibold">{eddByCrl}</span> : <span className="text-muted">—</span>}
							</div>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">NT (mm)</label>
							<input type="number" min="0" step="0.01" className="form-control custom-input" name="nt" value={form.nt} onChange={handleChange} placeholder="e.g. 1.2" />
							{form.nt && parseFloat(form.nt) >= 3.0 && (
								<small className="text-danger fw-semibold">Elevated NT ≥ 3.0 mm</small>
							)}
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">BPD (mm)</label>
							<input type="number" min="0" step="0.1" className="form-control custom-input" name="bpd" value={form.bpd} onChange={handleChange} placeholder="if visible" />
						</div>
					</div>
				</div>

				{/* ── Section 4: Gestational Sac ──────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Gestational Sac</div>
					<div className="row g-3">
						<div className="col-md-3">
							<label className="form-label fw-semibold">Number of Sacs</label>
							<input type="text" className="form-control custom-input" name="gestationalSacs" value={form.gestationalSacs} onChange={handleChange} placeholder="e.g. 1" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Mean Sac Diameter / MSD (mm)</label>
							<input type="number" min="0" step="0.1" className="form-control custom-input" name="sacMsd" value={form.sacMsd} onChange={handleChange} />
						</div>
					</div>
				</div>

				{/* ── Section 5: Embryo / Fetal ───────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Embryo / Fetal Assessment</div>
					<div className="row g-3">
						<div className="col-md-2">
							<label className="form-label fw-semibold">Number of Fetuses</label>
							<select className="form-select custom-select" name="fetalNumber" value={form.fetalNumber} onChange={handleChange}>
								<option value="0">0</option>
								<option value="1">1 (singleton)</option>
								<option value="2">2 (twin)</option>
								<option value="3">3 (triplet)</option>
								<option value="4+">4+</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">Fetal Pole</label>
							<select className="form-select custom-select" name="fetalPole" value={form.fetalPole} onChange={handleChange}>
								<option value="">Select</option>
								<option value="Seen">Seen</option>
								<option value="Not seen">Not seen</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">Yolk Sac</label>
							<select className="form-select custom-select" name="yolkSac" value={form.yolkSac} onChange={handleChange}>
								<option value="">Select</option>
								<option value="Seen - normal">Seen – normal</option>
								<option value="Seen - enlarged">Seen – enlarged</option>
								<option value="Not seen">Not seen</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">Cardiac Activity</label>
							<select className="form-select custom-select" name="cardiacActivity" value={form.cardiacActivity} onChange={handleChange}>
								<option value="">Select</option>
								<option value="Present">Present</option>
								<option value="Absent">Absent</option>
								<option value="Not assessed">Not assessed</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">FHR (bpm)</label>
							<input type="number" min="0" step="1" className="form-control custom-input" name="fetalHeartRate" value={form.fetalHeartRate} onChange={handleChange} placeholder="e.g. 162" />
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">Amniotic Fluid</label>
							<select className="form-select custom-select" name="amnioticFluid" value={form.amnioticFluid} onChange={handleChange}>
								<option value="">Select</option>
								<option value="Normal">Normal</option>
								<option value="Reduced">Reduced</option>
								<option value="Increased">Increased</option>
							</select>
						</div>
					</div>
				</div>

				{/* ── Section 6: Uterus ───────────────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Uterus</div>
					<div className="row g-3">
						<div className="col-md-3">
							<label className="form-label fw-semibold">Position</label>
							<select className="form-select custom-select" name="uterusPosition" value={form.uterusPosition} onChange={handleChange}>
								<option value="">Select</option>
								<option value="Anteverted">Anteverted</option>
								<option value="Retroverted">Retroverted</option>
								<option value="Axial">Axial</option>
							</select>
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Echogenicity / Appearance</label>
							<input type="text" className="form-control custom-input" name="uterusEchogenicity" value={form.uterusEchogenicity} onChange={handleChange} placeholder="e.g. Normal, Heterogeneous" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Subchorionic Hemorrhage</label>
							<select className="form-select custom-select" name="subchronicHemorrhage" value={form.subchronicHemorrhage} onChange={handleChange}>
								<option value="">Select</option>
								<option value="None">None</option>
								<option value="Present - small">Present – small</option>
								<option value="Present - moderate">Present – moderate</option>
								<option value="Present - large">Present – large</option>
							</select>
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Fibroids / Other</label>
							<input type="text" className="form-control custom-input" name="fibroids" value={form.fibroids} onChange={handleChange} placeholder="e.g. None, single intramural" />
						</div>
					</div>
				</div>

				{/* ── Section 7: Adnexa & Cervix ──────────────────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Adnexa &amp; Cervix</div>
					<div className="row g-3">
						<div className="col-md-3">
							<label className="form-label fw-semibold">Right Ovary</label>
							<input type="text" className="form-control custom-input" name="rightOvary" value={form.rightOvary} onChange={handleChange} placeholder="e.g. Normal, CL cyst seen" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Left Ovary</label>
							<input type="text" className="form-control custom-input" name="leftOvary" value={form.leftOvary} onChange={handleChange} placeholder="e.g. Normal" />
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Adnexal Mass</label>
							<select className="form-select custom-select" name="adnexalMass" value={form.adnexalMass} onChange={handleChange}>
								<option value="">Select</option>
								<option value="None">None</option>
								<option value="Present - right">Present – right</option>
								<option value="Present - left">Present – left</option>
								<option value="Present - bilateral">Present – bilateral</option>
							</select>
						</div>
						<div className="col-md-3">
							<label className="form-label fw-semibold">Free Fluid</label>
							<select className="form-select custom-select" name="freeFluids" value={form.freeFluids} onChange={handleChange}>
								<option value="">Select</option>
								<option value="None">None</option>
								<option value="Minimal">Minimal</option>
								<option value="Moderate">Moderate</option>
								<option value="Significant">Significant</option>
							</select>
						</div>
					</div>
					<div className="row g-3 mt-1">
						<div className="col-md-4">
							<label className="form-label fw-semibold">Cervix</label>
							<input type="text" className="form-control custom-input" name="cervix" value={form.cervix} onChange={handleChange} placeholder="e.g. Closed, adequate length" />
						</div>
					</div>
				</div>

				{/* ── Section 8: Impression & Recommendation ──────────────── */}
				<div className="border rounded p-3 mb-3">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Impression &amp; Recommendation</div>
					<div className="row g-3">
						<div className="col-md-6">
							<label className="form-label fw-semibold">Impression / Conclusion</label>
							<textarea className="form-control custom-input" name="impression" value={form.impression} onChange={handleChange} rows={3} placeholder="e.g. Single live intrauterine gestation at 8w3d by CRL. Normal first trimester scan." />
						</div>
						<div className="col-md-4">
							<label className="form-label fw-semibold">Recommendation</label>
							<textarea className="form-control custom-input" name="recommendation" value={form.recommendation} onChange={handleChange} rows={3} placeholder="e.g. Routine antenatal follow-up. Repeat scan at 11–13+6 weeks for NT screening." />
						</div>
						<div className="col-md-2">
							<label className="form-label fw-semibold">Sonographer</label>
							<input type="text" className="form-control custom-input" name="sonographer" value={form.sonographer} onChange={handleChange} />
						</div>
					</div>
				</div>

				{/* ── Summary Panel ────────────────────────────────────────── */}
				<div className="border rounded p-3 bg-body-tertiary">
					<div className="fw-semibold mb-2 text-uppercase small text-secondary">Report Summary</div>
					<div className="row">
						<div className="col-md-6">
							<table className="table table-sm table-borderless mb-0 small">
								<tbody>
									<tr><td className="fw-semibold" style={{ width: 180 }}>Date of Scan</td><td>{form.date || "—"}</td></tr>
									<tr><td className="fw-semibold">Ref</td><td>{form.externalRef || "—"}</td></tr>
									<tr><td className="fw-semibold">Referred By</td><td>{form.referredBy || "—"}</td></tr>
									<tr><td className="fw-semibold">Indication</td><td>{form.indication || "—"}</td></tr>
									<tr><td className="fw-semibold">Age</td><td>{form.patientAge ? `${form.patientAge} yrs` : "—"}</td></tr>
									<tr><td className="fw-semibold">LMP</td><td>{form.lmp || "—"}</td></tr>
									<tr><td className="fw-semibold">EDD by LMP</td><td>{eddByLmp || "—"}</td></tr>
									<tr><td className="fw-semibold">GA by LMP</td><td>{gaByLmp ? `${gaByLmp.weeks}w ${gaByLmp.days}d` : "—"}</td></tr>
								</tbody>
							</table>
						</div>
						<div className="col-md-6">
							<table className="table table-sm table-borderless mb-0 small">
								<tbody>
									<tr><td className="fw-semibold" style={{ width: 200 }}>CRL</td><td>{form.crl ? `${form.crl} ${form.crlUnit}` : "—"}</td></tr>
									<tr><td className="fw-semibold">GA by CRL (Sonographic)</td><td className="fw-bold">{crlValid ? `${gaWeeks}w ${gaRem}d` : "—"}</td></tr>
									<tr><td className="fw-semibold">EDD by CRL</td><td>{eddByCrl || "—"}</td></tr>
									<tr><td className="fw-semibold">NT</td><td>{form.nt ? `${form.nt} mm` : "—"}</td></tr>
									<tr><td className="fw-semibold">Cardiac Activity</td><td>{form.cardiacActivity || "—"}</td></tr>
									<tr><td className="fw-semibold">FHR</td><td>{form.fetalHeartRate ? `${form.fetalHeartRate} bpm` : "—"}</td></tr>
									<tr><td className="fw-semibold">Impression</td><td>{form.impression || "—"}</td></tr>
									<tr><td className="fw-semibold">Sonographer</td><td>{form.sonographer || "—"}</td></tr>
								</tbody>
							</table>
						</div>
					</div>
					<div className="mt-2">
						<small className="text-muted fst-italic">
							Formula: GA (days) = 8.052 × √CRL(mm) + 23.73 | Robinson &amp; Fleming, Br J Obstet Gynaecol 1975 | Valid: CRL 10–84 mm
						</small>
					</div>
				</div>
			</form>
		</div>
	);
}
