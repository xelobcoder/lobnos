"use client";
import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import styles from '../CommissionReport.module.css';
// PDF export function for detailed records with chart
async function exportClinicianCommissionToPDF(commissionData, clinicianName, startDate, endDate) {
	const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
	// Use Times New Roman if available
	if (doc.getFontList && doc.getFontList()['Consolas']) {
		doc.setFont('Consolas', 'bold');
	} else {
		doc.setFont('times', 'bold');
	}
	doc.setFontSize(26);
	doc.setFont('times', 'bold');
	const reportTitle = `COMMISSION REPORT: ${clinicianName.toUpperCase()}`;
	doc.text(reportTitle, 14, 18, { maxWidth: 270 });
	// Underline the title
	const titleWidth = doc.getTextWidth(reportTitle);
	doc.setLineWidth(1.2);
	doc.line(14, 20, 14 + titleWidth, 20);

	doc.setFontSize(16);
	doc.setFont('times', 'bold');
	const periodText = `PERIOD: ${startDate.toUpperCase()} TO ${endDate.toUpperCase()}`;
	doc.text(periodText, 14, 28, { maxWidth: 270 });
	const periodWidth = doc.getTextWidth(periodText);
	doc.setLineWidth(0.8);
	doc.line(14, 30, 14 + periodWidth, 30);

	// Always try to add the chart to the PDF if present
	let tableStartY = 36;
	// As a last resort, render a hidden static chart image and capture that for the PDF
	let chartImgData: string | null = null;
	try {
		// Create a hidden container for the static chart
		const hiddenDiv = document.createElement('div');
		hiddenDiv.style.position = 'fixed';
		hiddenDiv.style.left = '-9999px';
		hiddenDiv.style.top = '0';
		hiddenDiv.style.width = '900px';
		hiddenDiv.style.height = '350px';
		hiddenDiv.style.background = '#fff';
		hiddenDiv.style.zIndex = '-1';
		hiddenDiv.id = 'pdf-chart-capture';

		// Copy the chart SVG from the visible chart (if present)
		const chartSvg = document.querySelector('.CommissionLineChart-to-pdf svg');
		if (chartSvg) {
			const cloneSvg = chartSvg.cloneNode(true);
			hiddenDiv.appendChild(cloneSvg);
			document.body.appendChild(hiddenDiv);

			await new Promise(res => setTimeout(res, 400));

			const canvas = await html2canvas(hiddenDiv, {
				backgroundColor: '#fff',
				scale: 2,
				useCORS: true,
				allowTaint: true,
				logging: false
			});
			chartImgData = canvas.toDataURL('image/png');
			document.body.removeChild(hiddenDiv);
		}
	} catch (e) {
		chartImgData = null;
	}
	if (chartImgData) {
		const pdfWidth = 277; // 297 - 2*10mm margins
		const imgProps = doc.getImageProperties(chartImgData);
		const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
		doc.addImage(chartImgData, 'PNG', 10, 34, pdfWidth, imgHeight);
		tableStartY = 34 + imgHeight + 6;
	}

	autoTable(doc, {
		startY: tableStartY,
		head: [[
			'Service Date',
			'Services',
			'Total Value',
			'Commission %',
			'Commission Earned',
		]],
		body: commissionData.map(record => [
			dayjs(record.service_date).format('YYYY-MM-DD'),
			record.total_services,
			"GHC " + parseFloat(record.total_value).toFixed(2),
			record.commission_percent + '%',
			"GHC " + parseFloat(record.commission_earned).toFixed(2),
		]),
		styles: { fontSize: 12, font: 'times', fontStyle: 'bold' },
		headStyles: { fillColor: [168, 120, 44], fontSize: 13, font: 'times', fontStyle: 'bold' }, // oklch(0.646 0.222 41.116) ≈ rgb(168,120,44)
		bodyStyles: { font: 'times', fontStyle: 'bold', textColor: [0, 0, 0] },
	});
	doc.save(`commission-report-${clinicianName.replace(/\s+/g, '_')}-${startDate}-to-${endDate}.pdf`);
}
import { customFetch, currencyFormatter } from '../../../../components/Auth/customFetch';


import { RiUserLine, RiPhoneLine, RiBriefcaseLine, RiMoneyDollarCircleLine, RiServiceLine, RiFileList3Line } from '@remixicon/react';
import CommissionLineChart from "../CommissionLineChart";
import dayjs from 'dayjs';

interface CommissionData {
	service_date: string;
	clinician_id: number;
	clinician_name: string;
	clinician_phone: string;
	occupation: string;
	organization: number;
	total_services: number;
	total_value: string;
	commission_percent: number;
	commission_earned: string;
}


async function getClinicianCommission({ clinicianid, startDate, endDate }: { clinicianid: string, startDate: string, endDate: string }) {
	try {
		const url = `clinician/anal/commissions/range/single?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&clinicianId=${encodeURIComponent(clinicianid)}`;
		const response = await customFetch(url);
		if (!response || !response.success) {
			throw new Error('API returned no data or failed.');
		}
		// New structure: response.data is a flat array of records
		const records = Array.isArray(response.data) ? response.data : [];
		return records as CommissionData[];
	} catch (error: any) {
		return { error: error.message || 'An unknown error occurred' };
	}
}


export default function ClinicianCommissionPage({ params }: { params: { clinicianid: string } }) {
	const today = dayjs().format('YYYY-MM-DD');
	const currentYear = dayjs().year();
	const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
	const [startDate, setStartDate] = useState(defaultStart);
	const [endDate, setEndDate] = useState(today);
	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setStartDate(e.target.value);
	};
	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEndDate(e.target.value);
	};
	const handleResetFilters = () => {
		setStartDate(defaultStart);
		setEndDate(today);
	};
	const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [chartView, setChartView] = useState<'bar' | 'line'>('bar');

	useEffect(() => {
		setLoading(true);
		setError(null);
		getClinicianCommission({ clinicianid: params.clinicianid, startDate, endDate })
			.then(res => {
				if ((res as any).error) {
					setError((res as any).error);
					setCommissionData([]);
				} else {
					setCommissionData(res as CommissionData[]);
				}
			})
			.catch(e => {
				setError(e.message || 'An unknown error occurred');
				setCommissionData([]);
			})
			.finally(() => setLoading(false));
	}, [params.clinicianid]);

	const handleFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		setLoading(true);
		setError(null);
		getClinicianCommission({ clinicianid: params.clinicianid, startDate: start, endDate: end })
			.then(res => {
				if ((res as any).error) {
					setError((res as any).error);
					setCommissionData([]);
				} else {
					setCommissionData(res as CommissionData[]);
				}
			})
			.catch(e => {
				setError(e.message || 'An unknown error occurred');
				setCommissionData([]);
			})
			.finally(() => setLoading(false));
	};

	if (error) {
		return (
			<main className={styles.container}>
				<h1 className={styles.title}>Could Not Load Clinician Commission Data</h1>
				<div className={styles.errorBox}>
					<RiUserLine size={40} />
					<div>
						<p><strong>There was a problem connecting to the API.</strong></p>
						<p>{error}</p>
					</div>
				</div>
			</main>
		);
	}
	if (!commissionData.length) {
		return (
			<main className={styles.container}>
				<h1 className={styles.title}>No Commission Data Found</h1>
				<div className={styles.emptyState}>
					<RiUserLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
					<p>No commission records found for this clinician.</p>
				</div>
			</main>
		);
	}
	const summary = commissionData.reduce((acc, item) => {
		acc.total_commission += Number(item.commission_earned);
		acc.total_value += Number(item.total_value);
		acc.total_services += item.total_services;
		return acc;
	}, { total_commission: 0, total_value: 0, total_services: 0 });
	const { clinician_name, clinician_phone, occupation } = commissionData[0];
	return (
		<main className={styles.container}>
			<h1 className={styles.title}><RiUserLine /> {clinician_name.toUpperCase()} - Commission Details</h1>
			<hr />
			{/* Date Picker and Summary Cards */}
			<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3 gap-3">

				<div className={styles.statsGrid} style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'flex-end' }}>
					<div className={styles.statItem}><div className={styles.statIcon}><RiPhoneLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{clinician_phone}</span><span className={styles.statLabel}>Phone</span></div></div>
					<div className={styles.statItem}><div className={styles.statIcon}><RiBriefcaseLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{occupation}</span><span className={styles.statLabel}>Occupation</span></div></div>
					<div className={styles.statItem}><div className={styles.statIcon}><RiMoneyDollarCircleLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{currencyFormatter.format(summary.total_commission)}</span><span className={styles.statLabel}>Total Commission</span></div></div>
					<div className={styles.statItem}><div className={styles.statIcon}><RiServiceLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{summary.total_services}</span><span className={styles.statLabel}>Total Services</span></div></div>
					<div className={styles.statItem}><div className={styles.statIcon}><RiFileList3Line /></div><div className={styles.statInfo}><span className={styles.statValue}>{commissionData.length}</span><span className={styles.statLabel}>Records</span></div></div>
				</div>
			</div>
			{/* Chart Section - Modern Analytics Style (Card) */}
			<div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', background: 'none' }}>
				<div className="card-header py-3 px-4" style={{ borderColor: 'var(--bs-border-color)', background: 'none' }}>
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center" style={{ color: 'inherit' }}>
							Commission Trend
						</h2>
						<div className="d-flex flex-row align-items-center gap-2">
							<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
								<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
									Start
								</span>
								<input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
							</div>
							<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
								<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
									End
								</span>
								<input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
							</div>
							<button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
								Reset
							</button>
						</div>
						<div className="btn-group btn-group-sm" role="group" aria-label="Chart view toggle">
							<button type="button" className={`btn ${chartView === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'bar' ? {} : { fontWeight: 500 }} onClick={() => setChartView('bar')}>
								Bar
							</button>
							<button type="button" className={`btn ${chartView === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'line' ? {} : { fontWeight: 500 }} onClick={() => setChartView('line')}>
								Line
							</button>
						</div>
					</div>
				</div>
				<div className="card-body p-3 p-md-4" style={{ background: 'none' }}>
					<div className="CommissionLineChart-to-pdf">
						<CommissionLineChart data={commissionData} view={chartView} />
					</div>
				</div>
			</div>
			<div className={styles.sectionDivider}></div>
			<h2 >Detailed Records</h2>
			<div className="d-flex justify-content-end" style={{ marginBottom: 12, marginTop: 12 }}>
				<button
					type="button"
					className={styles.exportButton || 'btn btn-primary btn-sm'}
					onClick={async () => await exportClinicianCommissionToPDF(commissionData, clinician_name, startDate, endDate)}
					disabled={!commissionData || commissionData.length === 0}
				>
					Export PDF
				</button>
			</div>
			<div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
				<h4 className="fs-6 fw-medium mb-3">Commission Records</h4>
				<div className="table-responsive">
					<table className="table table-sm table-hover table-striped small">
						<thead className="sticky-top bg-body-tertiary">
							<tr>
								<th className="py-2">Service Date</th>
								<th className="py-2 text-end">Services</th>
								<th className="py-2 text-end">Total Value</th>
								<th className="py-2 text-end">Commission %</th>
								<th className="py-2 text-end">Commission Earned</th>
							</tr>
						</thead>
						<tbody>
							{commissionData.map((record, idx) => (
								<tr key={idx}>
									<td className="py-2">{dayjs(record.service_date).format('YYYY-MM-DD')}</td>
									<td className="py-2 text-end">{record.total_services}</td>
									<td className="py-2 text-end">{currencyFormatter.format(Number(record.total_value))}</td>
									<td className="py-2 text-end">{record.commission_percent}%</td>
									<td className="py-2 text-end">{currencyFormatter.format(Number(record.commission_earned))}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

		</main>
	);
}
