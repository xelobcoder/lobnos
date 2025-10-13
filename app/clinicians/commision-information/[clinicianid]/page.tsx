"use client";
import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
// PDF export function for detailed records with chart
async function exportClinicianCommissionToPDF(commissionData, clinicianName, startDate, endDate) {
	const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
	// Use Times New Roman if available
	if (doc.getFontList && doc.getFontList()['Times New Roman']) {
		doc.setFont('Times New Roman', 'bold');
	} else {
		doc.setFont('times', 'bold');
	}
	doc.setFontSize(22);
	doc.text(`Commission Report: ${clinicianName.toUpperCase()}`, 14, 18);
	doc.setFontSize(14);
	doc.setFont('times', 'normal');
	doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);

	// Try to find the chart container and render it to image
	const chartElem = document.querySelector('.CommissionLineChart-to-pdf') as HTMLElement;
	let tableStartY = 36;
	if (chartElem) {
		try {
			const canvas = await html2canvas(chartElem, { backgroundColor: '#fff', scale: 2 });
			const imgData = canvas.toDataURL('image/png');
			// Fit image to PDF width (A4 landscape: 297mm)
			const pdfWidth = 277; // 297 - 2*10mm margins
			const imgProps = doc.getImageProperties(imgData);
			const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
			doc.addImage(imgData, 'PNG', 10, 34, pdfWidth, imgHeight);
			tableStartY = 34 + imgHeight + 6;
		} catch (e) {
			tableStartY = 36;
		}
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
			record.total_value,
			record.commission_percent + '%',
			record.commission_earned,
		]),
		styles: { fontSize: 12, font: 'times', fontStyle: 'bold' },
		headStyles: { fillColor: [22, 160, 133], fontSize: 13, font: 'times', fontStyle: 'bold' },
		bodyStyles: { font: 'times', fontStyle: 'bold' },
	});
	doc.save(`commission-report-${clinicianName.replace(/\s+/g, '_')}-${startDate}-to-${endDate}.pdf`);
}
import { customFetch, currencyFormatter } from '../../../../components/Auth/customFetch';
import DateFilter from '../DateFilter';
import styles from '../CommissionReport.module.css';
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
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);
	const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
				<DateFilter
					startDate={startDate}
					endDate={endDate}
					onFilter={handleFilter}
					loading={loading}
				/>
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
				<DateFilter
					startDate={startDate}
					endDate={endDate}
					onFilter={handleFilter}
					loading={loading}
				/>
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
			<h1 className={styles.title}><RiUserLine /> {clinician_name} - Commission Details</h1>
			<DateFilter
				startDate={startDate}
				endDate={endDate}
				onFilter={handleFilter}
				loading={loading}
			/>
			{/* Summary Cards */}
			<div className={styles.statsGrid}>
				<div className={styles.statItem}><div className={styles.statIcon}><RiPhoneLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{clinician_phone}</span><span className={styles.statLabel}>Phone</span></div></div>
				<div className={styles.statItem}><div className={styles.statIcon}><RiBriefcaseLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{occupation}</span><span className={styles.statLabel}>Occupation</span></div></div>
				<div className={styles.statItem}><div className={styles.statIcon}><RiMoneyDollarCircleLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{currencyFormatter.format(summary.total_commission)}</span><span className={styles.statLabel}>Total Commission</span></div></div>
				<div className={styles.statItem}><div className={styles.statIcon}><RiServiceLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{summary.total_services}</span><span className={styles.statLabel}>Total Services</span></div></div>
				<div className={styles.statItem}><div className={styles.statIcon}><RiFileList3Line /></div><div className={styles.statInfo}><span className={styles.statValue}>{commissionData.length}</span><span className={styles.statLabel}>Records</span></div></div>
			</div>
			{/* Chart Section */}
			<div style={{ margin: '2rem 0 1.5rem 0' }}>
				<div style={{
					background: '#fff',
					borderRadius: '0.75rem',
					border: '1px solid #198754',
					boxShadow: '0 2px 12px 0 #19875422',
					padding: '1.5rem 1rem',
				}}>
					<h2 style={{ color: '#198754', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Commission Trend</h2>
					<div className="CommissionLineChart-to-pdf">
						<CommissionLineChart data={commissionData} />
					</div>
				</div>
			</div>
			<div className={styles.sectionDivider}></div>
			<h2 className={styles.cardTitle}>Detailed Records</h2>
			<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
				<button
					type="button"
					className={styles.exportButton || 'btn btn-primary'}
					onClick={async () => await exportClinicianCommissionToPDF(commissionData, clinician_name, startDate, endDate)}
					disabled={!commissionData || commissionData.length === 0}
				>
					Export PDF
				</button>
			</div>
			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.th}>Service Date</th>
							<th className={styles.th}>Services</th>
							<th className={styles.th}>Total Value</th>
							<th className={styles.th}>Commission %</th>
							<th className={styles.th}>Commission Earned</th>
						</tr>
					</thead>
					<tbody>
						{commissionData.map((record, idx) => (
							<tr key={idx}>
								<td className={`${styles.td} ${styles.dateCell}`}>{dayjs(record.service_date).format('YYYY-MM-DD')}</td>
								<td className={`${styles.td} ${styles.numberCell}`}>{record.total_services}</td>
								<td className={`${styles.td} ${styles.currencyCell}`}>{currencyFormatter.format(Number(record.total_value))}</td>
								<td className={`${styles.td} ${styles.numberCell}`}>{record.commission_percent}%</td>
								<td className={`${styles.td} ${styles.currencyCell}`}>{currencyFormatter.format(Number(record.commission_earned))}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</main>
	);
}
