import React from "react";

const Report = () => {
	const lab = {
		logo: "https://via.placeholder.com/100",
		name: "SMART PATHOLOGY LAB",
		tagline: "Accurate | Caring | Instant",
		phone: "9123456789 / 8912345678",
		email: "smartpatholab@gmail.com",
	};

	const patient = {
		name: "Yash M. Patel",
		age: 21,
		sex: "Male",
		pid: 555,
	};

	const sample = {
		location: "125, Shivam Bungalow, S G Road, Mumbai",
		ref_by: "Dr. Hiren Shah",
	};

	const report = {
		title: "Complete Blood Count (CBC)",
		tests: [
			{ name: "Hemoglobin (Hb)", result: "12.5", reference: "13.0 - 17.0", unit: "g/dL" },
			{ name: "Total RBC count", result: "5.2", reference: "4.5 - 5.5", unit: "mill/cumm" },
			{ name: "Packed Cell Volume (PCV)", result: "57.5", reference: "40 - 50", unit: "%" },
			{ name: "Platelet Count", result: "320000", reference: "150000 - 410000", unit: "cumm" },
		],
		instruments: "Fully automated cell counter - Mindray 300",
		interpretation: "Further confirm for Anemia",
		signatures: [
			{ name: "Medical Lab Technician", title: "(DMLT, BMLT)" },
			{ name: "Dr. Payal Shah", title: "(MD, Pathologist)" },
		],
	};

	return (
		<div style={{ fontFamily: "Arial, sans-serif", color: "#000", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
			<style>
				{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
            .report-container {
              border: none !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 12px;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
              text-align: left;
            }
          }
        `}
			</style>

			{/* Lab Header */}
			<div style={{ textAlign: "center", marginBottom: "20px" }}>
				<img src={lab.logo} alt="Lab Logo" style={{ height: "70px", marginBottom: "10px" }} />
				<h1 style={{ fontSize: "24px", marginBottom: "5px" }}>{lab.name}</h1>
				<p style={{ fontSize: "14px", margin: "5px 0" }}>{lab.tagline}</p>
				<p style={{ fontSize: "14px", margin: "5px 0" }}>📞 {lab.phone} | 📧 {lab.email}</p>
				<hr style={{ margin: "20px 0", border: "1px solid black" }} />
			</div>

			{/* Patient Details */}
			<div style={{ marginBottom: "20px" }}>
				<h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Patient Details</h2>
				<p style={{ margin: "5px 0" }}>
					<strong>Name:</strong> {patient.name}
				</p>
				<p style={{ margin: "5px 0" }}>
					<strong>Age:</strong> {patient.age} | <strong>Sex:</strong> {patient.sex}
				</p>
				<p style={{ margin: "5px 0" }}>
					<strong>PID:</strong> {patient.pid}
				</p>
			</div>

			{/* Sample Information */}
			<div style={{ marginBottom: "20px" }}>
				<h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Sample Information</h2>
				<p style={{ margin: "5px 0" }}>
					<strong>Location:</strong> {sample.location}
				</p>
				<p style={{ margin: "5px 0" }}>
					<strong>Referred By:</strong> {sample.ref_by}
				</p>
			</div>

			{/* Report Details */}
			<div style={{ marginBottom: "20px" }}>
				<h2 style={{ fontSize: "18px", marginBottom: "10px" }}>{report.title}</h2>
				<table style={{ width: "100%", border: "1px solid black", borderCollapse: "collapse", marginBottom: "20px" }}>
					<thead>
						<tr style={{ backgroundColor: "#f2f2f2" }}>
							<th style={{ border: "1px solid black", padding: "8px" }}>Test</th>
							<th style={{ border: "1px solid black", padding: "8px" }}>Result</th>
							<th style={{ border: "1px solid black", padding: "8px" }}>Reference</th>
							<th style={{ border: "1px solid black", padding: "8px" }}>Unit</th>
						</tr>
					</thead>
					<tbody>
						{report.tests.map((test, index) => (
							<tr key={index}>
								<td style={{ border: "1px solid black", padding: "8px" }}>{test.name}</td>
								<td style={{ border: "1px solid black", padding: "8px" }}>{test.result}</td>
								<td style={{ border: "1px solid black", padding: "8px" }}>{test.reference}</td>
								<td style={{ border: "1px solid black", padding: "8px" }}>{test.unit}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Additional Information */}
			<div style={{ marginBottom: "20px" }}>
				<h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Instruments</h3>
				<p>{report.instruments}</p>
				<h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Interpretation</h3>
				<p>{report.interpretation}</p>
			</div>

			{/* Signatures */}
			<div>
				<h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Signatures</h3>
				{report.signatures.map((signature, index) => (
					<p key={index}>
						{signature.name} {signature.title}
					</p>
				))}
			</div>
		</div>
	);
};

export default Report;
