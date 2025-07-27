"use client"
import { useState, useEffect, Suspense } from "react"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { customFetch, getResultSettings, readyToPrint } from "../../../components/Auth/customFetch"
import { useSearchParams } from "next/navigation"
import UseClinicalLiteratureReview from "../../../components/ResutlUI/UseClinicalLiteratureReview"
import UseResultEntryScientist from "../../../components/ResutlUI/UseResultEntryFormat"
import UseDisclaimer from "../../../components/ResutlUI/useDisclaimer"
import VersionFooter from "../../../components/accessories/VersionFooter"
import { defaultResultSettings, ResultSettings } from "../../../components/ResultView/result-settings"
import styles from './../labreport/4/MDSLancet.Template.module.css'
import MdsCompanyInformation from "../../../components/ResultView/MdsCompanyInformation"
import MdsPersonalInformation from "../../../components/ResultView/MdsPersonalInformation"
import UseCustomResultTemplatingPreview from "../../../components/ResutlUI/useCustomResultTemplatingPreview"
import UseResultCommentSinglePreview from "../../../components/ResutlUI/useResultCommentSinglePreview"
import { useApplication } from "../../../components/Auth/useApplicationContext";

export default function LabReportPrintingMultiple() {
	const [loader, setLoader] = useState(false);
	const [resultdata, setResultData] = useState<any>(null);
	const employeeid = useApplication()?.user?.employeeid;
	const [resultSettings, setResultSettings] = useState<ResultSettings>(defaultResultSettings);
	const searchParams = useSearchParams();
	const billingid = searchParams?.get('csvid') || '';
	const test = searchParams?.get('testname') || '';
	const target = searchParams?.get('target') || '';
	const ascensionid = searchParams?.get('ascensionId') || '';
	const ptid = searchParams?.get('ptid') || '';
	const testid = searchParams?.get('testid');
	const csvid = searchParams?.get('csvid');

	const url = `result/printout/ascension/multiple/getResult?csvid=${csvid}&&testid=${testid}&&testname=${test}&tenantId=3&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&target=${target}&password=&&isBrowserPrintout=1&&employeeid=${employeeid}`;

	useEffect(() => {
		if (billingid && testid && ascensionid && employeeid) {
			setLoader(true);
			customFetch(url)
				.then((data) => setResultData(data))
				.catch((err) => console.error(err))
				.finally(() => { setLoader(false); });
		}
	}, []);




	// const handleCheck = (ev, item) => {
	// 	const checked = ev.target.checked
	// 	if (checked) {
	// 		setPrintList([...toprintList, item])
	// 	} else {
	// 		const printList = [...toprintList]
	// 		setPrintList(printList.filter((values, index) => values.testid != item.testid))
	// 	}
	// ...existing code...
	const [pdfUrl, setPdfUrl] = useState<{ url: string; filename: string } | null>(null);
	const [showPdf, setShowPdf] = useState(false);
	const [showPdfControls, setShowPdfControls] = useState(false);
	// selectedTests: array of indices, in the order selected
	const [selectedTests, setSelectedTests] = useState<number[]>([]);

	// Helper: are all tests selected?
	const allTestsSelected = resultdata && Array.isArray(resultdata.test) && selectedTests.length === resultdata.test.length && selectedTests.every((v, i) => v === i);

	useEffect(() => {
		if (!loader && resultdata && Array.isArray(resultdata.test)) {
			const resultElement = document.querySelector('.result') as HTMLElement | null;
			if (!resultElement) return;
			const images = Array.from(resultElement.querySelectorAll('img'));
			const unloaded = images.filter(img => !img.complete);
			if (unloaded.length > 0) {
				let loadedCount = 0;
				unloaded.forEach(img => {
					img.onload = img.onerror = () => {
						loadedCount++;
						if (loadedCount === unloaded.length) generatePDF();
					};
				});
			} else {
				generatePDF();
			}
		}

		function generatePDF() {
			setTimeout(() => {
				const resultElement = document.querySelector('.result') as HTMLElement | null;
				if (!resultElement) return;
				html2canvas(resultElement, { scale: 2, useCORS: true }).then(canvas => {
					const imgData = canvas.toDataURL('image/png');
					const pdf = new jsPDF('p', 'mm', 'a4');
					const pageWidth = pdf.internal.pageSize.getWidth();
					const pageHeight = pdf.internal.pageSize.getHeight();
					const margin = 10;
					const usableWidth = pageWidth - margin * 2;
					const usableHeight = pageHeight - margin * 2;
					const imgProps = pdf.getImageProperties(imgData);
					const imgWidth = usableWidth;
					const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

					let remainingHeight = imgHeight;
					let imgY = margin;
					let pageNum = 1;

					while (remainingHeight > 0) {
						pdf.addImage(
							imgData,
							'PNG',
							margin,
							imgY,
							imgWidth,
							imgHeight
						);
						pdf.saveGraphicsState();
						pdf.setTextColor(225, 225, 225);
						pdf.setFontSize(9);
						pdf.restoreGraphicsState();
						pdf.setTextColor(60, 60, 60);
						pdf.setFontSize(10);
						pdf.text(` ${pageNum}`, pageWidth / 2, pageHeight - 14, { align: 'center' });
						pdf.setFontSize(8);
						pdf.setTextColor(65, 105, 225);
						const copyright = `Software by leonides intell,PLS v0.0.1 copyright @${new Date().getFullYear()}. Tell: 0249434803 || 0595964565`;
						pdf.text(copyright, pageWidth / 2, pageHeight - 6, { align: 'center' });
						pageNum++;
						remainingHeight -= usableHeight;
						imgY -= usableHeight;
						if (remainingHeight > 0) pdf.addPage();
					}
					const patientName = (resultdata?.patientInformation?.firstname || '') + '_' + (resultdata?.patientInformation?.lastname || '');
					const safePatientName = patientName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
					const safeBillingId = (resultdata?.billingid || '').toString().replace(/[^a-zA-Z0-9_]/g, '');
					const safeAscensionId = (ascensionid || '').toString().replace(/[^a-zA-Z0-9_]/g, '');
					const now = new Date();
					const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
					const filename = `${safePatientName}-${safeBillingId}-${safeAscensionId}-${dateStr}.pdf`;
					const blob = pdf.output('blob');
					const blobUrl = URL.createObjectURL(blob);
					setPdfUrl({ url: blobUrl, filename });
				});
			}, 500);
		}
	}, [loader, resultdata]);

	// When resultdata loads, select all tests by default
	useEffect(() => {
		if (resultdata && Array.isArray(resultdata.test)) {
			setSelectedTests(resultdata.test.map((_, idx) => idx));
		}
	}, [resultdata]);

	let pdfControls;
	if (pdfUrl && showPdfControls) {
		pdfControls = (
			<div style={{ width: '100vw', height: '100vh', position: 'relative', paddingTop: 60 }}>
				<div style={{
					position: 'absolute',
					top: 16,
					right: 16,
					zIndex: 10000,
					display: 'flex',
					gap: 12
				}}>
					<a
						href={pdfUrl.url}
						download={pdfUrl.filename}
						style={{
							background: '#fff',
							border: '1px solid #ccc',
							borderRadius: 4,
							padding: '8px 16px',
							fontWeight: 'bold',
							textDecoration: 'none',
							boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
						}}
					>
						Download PDF
					</a>
					<button
						onClick={() => setShowPdf(v => !v)}
						style={{
							background: '#4169e1',
							color: '#fff',
							border: 'none',
							borderRadius: 4,
							padding: '8px 16px',
							fontWeight: 'bold',
							cursor: 'pointer',
							boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
						}}
					>
						{showPdf ? 'Hide PDF' : 'Show PDF'}
					</button>
					<button
						onClick={() => setShowPdfControls(false)}
						style={{
							background: '#aaa',
							color: '#fff',
							border: 'none',
							borderRadius: 4,
							padding: '8px 16px',
							fontWeight: 'bold',
							cursor: 'pointer',
							boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
						}}
					>
						Back to Report
					</button>
				</div>
				{showPdf && (
					<iframe src={pdfUrl.url} title="Lab Report PDF" style={{ width: '100vw', height: '100vh', border: 'none' }} />
				)}
			</div>
		);
	}

	return (
		<Suspense>
			{pdfControls}
			{!showPdfControls && (
				loader ? (
					<div style={{ textAlign: 'center', marginTop: 40 }}>
						<span>Loading...</span>
					</div>
				) : resultdata && Array.isArray(resultdata.test) ? (
					<div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
						{/* Sidebar for test selection */}
						<aside className="no-print" style={{ width: 240, background: '#f7f7fa', borderRight: '1px solid #e0e0e0', padding: 16, minHeight: '100vh', position: 'sticky', top: 0 }}>
							<h4 style={{ marginBottom: 16, fontWeight: 700, fontSize: 18 }}>Select Tests</h4>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
								{resultdata.test.map((testItem, idx) => (
									<label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, cursor: 'pointer', background: selectedTests.includes(idx) ? '#e6f0ff' : 'transparent', borderRadius: 4, padding: '4px 8px' }}>
										<input
											type="checkbox"
											checked={selectedTests.includes(idx)}
											onChange={e => {
												if (e.target.checked) {
													setSelectedTests(prev => prev.concat(idx));
												} else {
													setSelectedTests(prev => prev.filter(i => i !== idx));
												}
											}}
										/>
										<span>{testItem.testname}</span>
									</label>
								))}
							</div>
							<div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
								<button
									onClick={() => setSelectedTests(resultdata.test.map((_, idx) => idx))}
									style={{ marginRight: 8, padding: '4px 12px', borderRadius: 4, border: '1px solid #4169e1', background: '#4169e1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
								>
									Select All
								</button>
								<button
									onClick={() => setSelectedTests([])}
									style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #aaa', background: '#fff', color: '#333', fontWeight: 600, cursor: 'pointer' }}
								>
									Deselect All
								</button>
								<button
									className="no-print"
									onClick={() => window.print()}
									style={{ marginTop: 12, padding: '6px 16px', borderRadius: 4, border: '1px solid #28a745', background: '#28a745', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
								>
									Print
								</button>
							</div>
						</aside>
						{/* Main report area */}
						<div style={{ flex: 1, position: 'relative', minHeight: '100vh' }}>
							<div className={styles.page} style={{ fontFamily: resultSettings.fontfamily, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
								<div className='result' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
									<MdsCompanyInformation
										styles={styles}
										logourl={resultdata.logourl}
										companyInfo={resultdata.companyInfo}
									/>
									<div className={styles.reportTitleBar}
										style={{
											backgroundColor: resultSettings.mainReportHeaderBgColor,
											color: resultSettings.mainReportHeaderColor
										}}>
										MEDICAL LABORATORY REPORT
									</div>
									<MdsPersonalInformation
										styles={styles}
										patientInformation={resultdata.patientInformation}
										labRef={`BILL${resultdata.billingid}`}
										collectionDate={resultdata.samplingInformation?.collectionEndDate}
										finalReportDate={resultdata.samplingInformation?.resultEntryEnd}
									/>
									<div style={{ flex: 1 }}>
										{(() => {
											// selectedTests already contains the indices in the order of selection
											const selected = selectedTests.filter(idx => idx >= 0 && idx < resultdata.test.length);
											// Gather all comments from selected tests
											let allComments: string[] = [];
											if (allTestsSelected && resultdata.generalComments) {
												// Use generalComments as a single HTML string, split into array for compatibility
												allComments = [resultdata.generalComments];
											} else {
												allComments = selected
													.map(idx => resultdata.test[idx]?.comments)
													.filter(Boolean)
													.flat();
											}

											// Determine which validators to use
											const useGeneralValidation = selected.length > 1 && resultdata.generalValidation;
											const getValidators = (idx: number) => useGeneralValidation ? [resultdata.generalValidation] : resultdata.test[idx].validators;

											return selected.map((idx, i) => (
												<section
													key={idx}
													style={{
														marginBottom: 40,
														borderBottom: '1px dashed #ccc',
														paddingBottom: 24,
														breakInside: 'avoid',
														pageBreakInside: 'avoid',
													}}
												>
													<UseCustomResultTemplatingPreview
														test={resultdata.test[idx].testname}
														records={resultdata.test[idx].records}
														resultsettings={resultSettings}
													/>
													{/* Clinical note (literature review) should come before comments */}
													{resultdata.test[idx].literatureReview && <UseClinicalLiteratureReview literature={resultdata.test[idx].literatureReview} />}
													{/* Only show all comments in the last selected section */}
													{i === selected.length - 1 && allComments.length > 0 && (
														<UseResultCommentSinglePreview comments={allComments} />
													)}
													<UseResultEntryScientist
														lastupdatedon={resultdata.test[idx].lastupdatedon}
														validators={getValidators(idx)}
														resultentry={resultdata.test[idx].resultentry}
														enteredOn={resultdata.test[idx].enteredOn}
														ascensionid={ascensionid}
														billingid={resultdata.billingid}
														patientid={resultdata.patientInformation?.patientid}
													/>
													<span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
												</section>
											));
										})()}
										{resultSettings.includeLimitations && <UseDisclaimer />}
									</div>
								</div>
								<footer className={styles.footerSection}>
									<VersionFooter />
									<div className={styles.pageNumber}>
										<span className="pageNumber"></span>
									</div>
								</footer>
							</div>
							{pdfUrl && (
								<button
									className='printing-button no-print'
									onClick={() => setShowPdfControls(true)}
									style={{
										position: 'absolute',
										top: 16,
										right: 16,
										zIndex: 10000,
										background: '#4169e1',
										color: '#fff',
										border: 'none',
										borderRadius: 4,
										padding: '8px 16px',
										fontWeight: 'bold',
										cursor: 'pointer',
										boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
									}}
								>
									PDF Options
								</button>
							)}
						</div>
					</div>
				) : (
					<div style={{ textAlign: 'center', marginTop: 40 }}>
						<span>No report data found.</span>
					</div>
				)
			)}
		</Suspense>
	);
}
