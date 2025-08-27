"use client"
import { useState, useEffect, Suspense, useRef } from "react"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { customFetch } from "../../../components/Auth/customFetch"
import { useSearchParams } from "next/navigation"
import UseDisclaimer from "../../../components/ResutlUI/useDisclaimer"
import { defaultResultSettings, ResultSettings } from "../../../components/ResultView/result-settings"
import styles from './MDSLancet.Template-multiple.module.css';
import MdsCompanyInformation from "../../../components/ResultView/MdsCompanyInformation"
import MdsPersonalInformation from "../../../components/ResultView/MdsPersonalInformation"
import UseCustomResultTemplatingPreview from "../../../components/ResutlUI/useCustomResultTemplatingPreview"
import UseClinicalLiteratureReview from "../../../components/ResutlUI/UseClinicalLiteratureReview"
import UseResultCommentSinglePreview from "../../../components/ResutlUI/useResultCommentSinglePreview"
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { trackReportView, trackReportPrint } from "../../../lib/printingTracker";
import DrugsList from "../../../components/Drugs/DrugsList";

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
				.then((data) => {
					if (data && data.resultsettings) {
						setResultSettings(data.resultsettings);
					}

					if (data && data.test && Array.isArray(data.test)) {

						// Sort each test's records array from lowest to largest
						for (const test of data.test) {
							if (Array.isArray(test.records)) {
								test.records.sort((a, b) => {
									// Give numeric ordering highest priority (appear last), null/undefined/zero lowest (appear first)
									const isNumeric = (val) => {
										if (val === null || val === undefined) return false;
										if (typeof val === 'number') return val !== 0;
										const parsed = parseInt(val, 10);
										return !isNaN(parsed) && parsed !== 0;
									};
									const getOrder = (val) => {
										if (val === null || val === undefined) return 0;
										if (typeof val === 'number') return Math.floor(val);
										const parsed = parseInt(val, 10);
										return isNaN(parsed) ? 0 : parsed;
									};
									const aIsNum = isNumeric(a.ordering);
									const bIsNum = isNumeric(b.ordering);
									if (aIsNum && !bIsNum) return 1;
									if (!aIsNum && bIsNum) return -1;
									// Both numeric or both not numeric, sort by value
									const orderA = getOrder(a.ordering);
									const orderB = getOrder(b.ordering);
									return orderA - orderB;
								});
							}
						}
						setResultData(data);
					}
				})
				.catch((err) => console.error(err))
				.finally(() => { setLoader(false); });
		}
	}, []);



	const [pdfUrl, setPdfUrl] = useState<{ url: string; filename: string } | null>(null);
	const [pdfError, setPdfError] = useState<string | null>(null);
	const [pdfLoading, setPdfLoading] = useState(false);
	const [showPdf, setShowPdf] = useState(false);
	const [showPdfControls, setShowPdfControls] = useState(false);
	const [selectedTests, setSelectedTests] = useState<number[]>([]);
	const viewTrackedRef = useRef<Set<string>>(new Set());
	const [printPageStarters, setPrintPageStarters] = useState<Set<number>>(new Set());
	const [footerForceBreak, setFooterForceBreak] = useState(false);
	const allTestsSelected = resultdata && Array.isArray(resultdata.test) && selectedTests.length === resultdata.test.length && selectedTests.every((v, i) => v === i);
	const getAscensionIdForTest = (idx: number): string | number | undefined => {
		const t: any = resultdata?.test?.[idx];
		return t?.ascensionid ?? t?.ascensionId ?? t?.ascension_id ?? ascensionid;
	};
	const getSelectedAscensionIds = (): Array<string | number> => {
		const ids = new Set<string | number>();
		selectedTests.forEach((idx) => {
			const id = getAscensionIdForTest(idx);
			if (id !== undefined && id !== null) ids.add(id);
		});
		return Array.from(ids);
	};

	const headerRef = useRef<HTMLDivElement | null>(null);
	const footerRef = useRef<HTMLDivElement | null>(null);
	const verifiedRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setPdfError(null);
		setPdfLoading(false);
		if (!loader && resultdata && Array.isArray(resultdata.test)) {
			setPdfLoading(true);
			setTimeout(async () => {
				try {
					const resultElement = document.querySelector('.result');
					const headerEl = headerRef.current;
					if (!resultElement || !headerEl) {
						setPdfError('Unable to find report content for PDF.');
						setPdfLoading(false);
						return;
					}

					// Wait for images to load to get accurate heights (tests include clinical info)
					const ensureImagesLoaded = async (rootEl: Element) => {
						const images = Array.from(rootEl.querySelectorAll('img')) as HTMLImageElement[];
						await Promise.all(images.map(img => new Promise<void>((resolve) => {
							if (img.complete && img.naturalHeight !== 0) return resolve();
							if (img.src.startsWith('http')) img.crossOrigin = 'anonymous';
							img.onload = () => resolve();
							img.onerror = () => resolve();
						})));
					};
					await ensureImagesLoaded(resultElement);

					// Hide print-only page headers inside sections while capturing PDF
					const _markers = Array.from(resultElement.querySelectorAll('.page-header-marker')) as HTMLElement[];
					const _markerDisplays = _markers.map(el => el.style.display);
					_markers.forEach(el => { el.style.display = 'none'; });

					const pdf = new jsPDF('p', 'mm', 'a4');
					const pageWidth = pdf.internal.pageSize.getWidth();
					const pageHeight = pdf.internal.pageSize.getHeight();
					const margin = 10;
					const usableWidth = pageWidth - margin * 2;

					const headerCanvas = await html2canvas(headerEl as HTMLElement, { scale: 2, useCORS: true });
					const headerImgData = headerCanvas.toDataURL('image/png');
					const headerHeightMm = (headerCanvas.height * usableWidth) / headerCanvas.width;

					const pageTopWithHeader = margin + headerHeightMm;
					const pageTopNoHeader = margin;
					const pageBottom = pageHeight - margin;
					const contentHeightMm = pageBottom - pageTopWithHeader;

					// First page uses header
					pdf.addImage(headerImgData, 'PNG', margin, margin, usableWidth, headerHeightMm);
					let y = pageTopWithHeader;

					const sectionEls: HTMLElement[] = Array.from(resultElement.querySelectorAll('.test-section')) as HTMLElement[];

					for (const sectionEl of sectionEls) {
						// Temporarily remove extra spacing for clean capture
						const prev = {
							marginTop: sectionEl.style.marginTop,
							marginBottom: sectionEl.style.marginBottom,
							paddingTop: sectionEl.style.paddingTop,
							paddingBottom: sectionEl.style.paddingBottom,
							borderBottom: sectionEl.style.borderBottom,
						};
						sectionEl.style.marginTop = '0px';
						sectionEl.style.marginBottom = '16px';
						sectionEl.style.paddingTop = '0px';
						sectionEl.style.paddingBottom = '0px';
						sectionEl.style.borderBottom = 'none';

						// Ensure images within this section are loaded
						await ensureImagesLoaded(sectionEl);

						const canvas = await html2canvas(sectionEl as HTMLElement, { scale: 2, useCORS: true });
						const imgWidthMm = usableWidth;
						const mmPerPx = imgWidthMm / canvas.width;
						const sectionMmHeight = canvas.height * mmPerPx;

						const drawWholeSection = async () => {
							const imgData = canvas.toDataURL('image/png');
							pdf.addImage(imgData, 'PNG', margin, y, imgWidthMm, sectionMmHeight);
							y += sectionMmHeight;
						};

						const sliceSectionAcrossPages = async () => {
							let srcY = 0;
							const totalPx = canvas.height;
							while (srcY < totalPx) {
								const availableMm = pageBottom - y;
								if (availableMm <= 0.5) {
									// Continuation of same test across pages: no header
									pdf.addPage();
									y = pageTopNoHeader;
								}
								const maxSlicePx = Math.floor((pageBottom - y) / mmPerPx);
								const slicePx = Math.min(Math.max(maxSlicePx, 1), totalPx - srcY);

								const sliceCanvas = document.createElement('canvas');
								sliceCanvas.width = canvas.width;
								sliceCanvas.height = slicePx;
								const ctx = sliceCanvas.getContext('2d');
								if (ctx) {
									ctx.drawImage(
										canvas,
										0,
										srcY,
										canvas.width,
										slicePx,
										0,
										0,
										sliceCanvas.width,
										sliceCanvas.height
									);
								}
								const sliceImgData = sliceCanvas.toDataURL('image/png');
								const sliceMmHeight = slicePx * mmPerPx;
								pdf.addImage(sliceImgData, 'PNG', margin, y, imgWidthMm, sliceMmHeight);
								y += sliceMmHeight;
								srcY += slicePx;
							}
						};

						const remainingMm = pageBottom - y;
						if (sectionMmHeight <= remainingMm) {
							await drawWholeSection();
						} else {
							// Start new test on a fresh page with header
							if (y !== pageTopWithHeader) {
								pdf.addPage();
								pdf.addImage(headerImgData, 'PNG', margin, margin, usableWidth, headerHeightMm);
								y = pageTopWithHeader;
							}
							if (sectionMmHeight <= contentHeightMm) {
								await drawWholeSection();
							} else {
								// Too tall: slice across pages; first page has header already, next pages omit header
								await sliceSectionAcrossPages();
							}
						}

						// Restore original spacing styles
						sectionEl.style.marginTop = prev.marginTop;
						sectionEl.style.marginBottom = prev.marginBottom;
						sectionEl.style.paddingTop = prev.paddingTop;
						sectionEl.style.paddingBottom = prev.paddingBottom;
						sectionEl.style.borderBottom = prev.borderBottom;

						// Gap between tests; if not enough room for gap, start new page with header for next test
						const gapMm = 2;
						if (y + gapMm <= pageBottom) {
							y += gapMm;
						} else {
							pdf.addPage();
							pdf.addImage(headerImgData, 'PNG', margin, margin, usableWidth, headerHeightMm);
							y = pageTopWithHeader;
						}
					}


					// Add Verified By and Disclaimer blocks before finishing PDF
					const verifiedEl = verifiedRef.current;
					const footerEl = footerRef.current;
					if (verifiedEl && footerEl) {
						pdf.setPage(pdf.getNumberOfPages());
						// Capture footer first to get its height
						const footerCanvas = await html2canvas(footerEl as HTMLElement, { scale: 2, useCORS: true });
						const footerImgData = footerCanvas.toDataURL('image/png');
						const footerHeightMm = (footerCanvas.height * usableWidth) / footerCanvas.width;
						// Capture Verified By block
						const verifiedCanvas = await html2canvas(verifiedEl as HTMLElement, { scale: 2, useCORS: true });
						const verifiedImgData = verifiedCanvas.toDataURL('image/png');
						const verifiedHeightMm = (verifiedCanvas.height * usableWidth) / verifiedCanvas.width;
						// Add Verified By block first
						let yVerified = pdf.internal.pageSize.getHeight() - margin - verifiedHeightMm - footerHeightMm - 5;
						pdf.addImage(verifiedImgData, 'PNG', margin, yVerified, usableWidth, verifiedHeightMm);
						// Then End of Report (footer)
						let yFooter = pdf.internal.pageSize.getHeight() - margin - footerHeightMm;
						pdf.addImage(footerImgData, 'PNG', margin, yFooter, usableWidth, footerHeightMm);
					}

					const pageCount = pdf.getNumberOfPages();
					for (let i = 1; i <= pageCount; i++) {
						pdf.setPage(i);
						pdf.setTextColor(60, 60, 60);
						pdf.setFontSize(10);
						pdf.text(` ${i}`, pageWidth / 2, pageHeight - 14, { align: 'center' });
						pdf.setFontSize(8);
						pdf.setTextColor(65, 105, 225);
						const copyright = `Software by leonides intell,PLS v0.0.1 copyright @${new Date().getFullYear()}. Tell: 0249434803 || 0595964565`;
						pdf.text(copyright, pageWidth / 2, pageHeight - 6, { align: 'center' });
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

					// Restore markers after capture
					_markers.forEach((el, i) => { el.style.display = _markerDisplays[i]; });
					setPdfLoading(false);
				} catch (err: any) {
					// Restore markers on error as well
					try {
						const resultElement = document.querySelector('.result');
						if (resultElement) {
							const _markers = Array.from(resultElement.querySelectorAll('.page-header-marker')) as HTMLElement[];
							_markers.forEach(el => { el.style.display = ''; });
						}
					} catch { }
					setPdfError('PDF generation failed: ' + (err?.message || err));
					setPdfLoading(false);
				}
			}, 500);
		}
	}, [loader, resultdata, selectedTests]);

	useEffect(() => {
		if (resultdata && Array.isArray(resultdata.test)) {
			setSelectedTests(resultdata.test.map((_, idx) => idx));
		}
	}, [resultdata]);

	useEffect(() => {
		if (!employeeid || !resultdata || !Array.isArray(resultdata.test)) return;
		const ids = getSelectedAscensionIds().map(id => String(id));
		const newIds = ids.filter(id => !viewTrackedRef.current.has(id));
		if (newIds.length === 0) return;
		newIds.forEach(id => {
			viewTrackedRef.current.add(id);
			try {
				trackReportView(id, employeeid);
			} catch {
				console.error('Failed to track report view:', id, employeeid);
			}
		});
	}, [selectedTests, resultdata, employeeid]);

	const computePrintPageStarters = () => {
		try {
			if (!resultdata || !Array.isArray(resultdata.test)) return;
			const selected = selectedTests.filter(idx => idx >= 0 && idx < resultdata.test.length);
			if (selected.length === 0) { setPrintPageStarters(new Set()); setFooterForceBreak(false); return; }

			const headerH = headerRef.current ? headerRef.current.offsetHeight : 0;
			const pageHeightPx = 1122;
			const marginPx = 38;
			const contentHeight = pageHeightPx - marginPx * 2;

			const starters: number[] = [];
			let remaining = contentHeight - headerH;

			for (let i = 0; i < selected.length; i++) {
				const idx = selected[i];
				const el = document.querySelector(`section.test-section[data-test-idx="${idx}"]`) as HTMLElement | null;
				const h = el ? el.offsetHeight : 0;

				if (i === 0) {
					starters.push(idx);
					remaining -= h;
					continue;
				}

				if (h <= remaining) {
					remaining -= h;
				} else {
					starters.push(idx);
					remaining = (contentHeight - headerH) - h;
				}
			}

			const extraEls = Array.from(document.querySelectorAll('section.test-section.extra-section')) as HTMLElement[];
			extraEls.forEach(el => {
				const h = el ? el.offsetHeight : 0;
				if (h <= remaining) {
					remaining -= h;
				} else {
					remaining = (contentHeight - headerH) - h;
				}
			});

			const footerH = (footerRef.current?.offsetHeight || 0) + 40;
			setFooterForceBreak(remaining < footerH);
			setPrintPageStarters(new Set(starters));
		} catch (e) {
			const first = selectedTests[0];
			setPrintPageStarters(new Set(typeof first === 'number' ? [first] : []));
			setFooterForceBreak(false);
		}
	};

	useEffect(() => {
		const handler = () => computePrintPageStarters();
		window.addEventListener('beforeprint', handler);
		return () => window.removeEventListener('beforeprint', handler);
	}, [resultdata, selectedTests]);

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
					<a href={pdfUrl.url}
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
						onClick={() => {
							if (employeeid) {
								const ids = getSelectedAscensionIds();
								ids.forEach((id) => trackReportPrint(String(id), employeeid));
							}
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
									onClick={async () => {
										if (employeeid) {
											const ids = getSelectedAscensionIds();
											await Promise.all(ids.map((id) => trackReportPrint(String(id), employeeid)));
										}
										computePrintPageStarters();
										setTimeout(() => window.print(), 50);
									}}
									style={{ marginTop: 12, padding: '6px 16px', borderRadius: 4, border: '1px solid #28a745', background: '#28a745', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
								>
									Print
								</button>
								<button
									className="no-print"
									disabled={!pdfUrl || pdfLoading || !!pdfError}
									onClick={() => setShowPdfControls(true)}
									style={{
										marginTop: 12,
										padding: '6px 16px',
										borderRadius: 4,
										border: '1px solid #4169e1',
										background: pdfUrl && !pdfLoading && !pdfError ? '#4169e1' : '#ccc',
										color: '#fff',
										fontWeight: 700,
										cursor: pdfUrl && !pdfLoading && !pdfError ? 'pointer' : 'not-allowed',
										fontSize: 16
									}}
								>
									{pdfLoading ? 'Generating PDF...' : pdfError ? 'PDF Error' : 'PDF Options'}
								</button>
								{pdfError && (
									<span style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{pdfError}</span>
								)}
							</div>
						</aside>
						<div style={{ flex: 1, position: 'relative', minHeight: '100vh', backgroundColor: 'white !important' }}>
							<div className={`${styles.page} print-page`} style={{
								fontFamily: resultSettings.fontfamily,
								minHeight: '100vh',
								display: 'flex',
								border: 'none !important',
								backgroundColor: 'white !important',
								boxShadow: 'none !important',
								padding: 16,
								flexDirection: 'column'
							}}>
								<div className='result' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
									<div ref={headerRef} className="screen-header">
										<MdsCompanyInformation
											styles={styles}
											logourl={resultdata.logourl}
											resultsettings={resultSettings}
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
											isBulk={true}
										/>
									</div>
									<div className="print-content" style={{ flex: 1 }}>
										{(() => {
											const selected = selectedTests.filter(idx => idx >= 0 && idx < resultdata.test.length);
											let allComments: string[] = [];
											if (allTestsSelected && resultdata.generalComments) {
												allComments = [resultdata.generalComments];
											} else {
												allComments = selected
													.map(idx => resultdata.test[idx]?.comments)
													.filter(Boolean)
													.flat();
											}

											const useGeneralValidation = selected.length > 1 && resultdata.generalValidation;
											const getValidators = (idx: number) => useGeneralValidation ? [resultdata.generalValidation] : resultdata.test[idx].validators;

											const nodes = selected.map((idx, i) => {
												const literature = resultdata.test[idx]?.literatureReview ?? resultdata?.literatureReview;
												return (
													<section
														key={idx}
														className="test-section"
														data-test-idx={idx}
														style={{
															marginBottom: 40,
															borderBottom: '1px dashed #ccc',
															paddingBottom: 24,
															breakInside: 'avoid',
															pageBreakInside: 'avoid',
														}}
													>
														{printPageStarters.has(idx) && (
															<div className={`page-header-marker ${i !== 0 ? 'break-before' : ''}`}>
																<MdsCompanyInformation
																	styles={styles}
																	logourl={resultdata.logourl}
																	resultsettings={resultSettings}
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
																	isBulk={true}
																	styles={styles}
																	patientInformation={resultdata.patientInformation}
																	labRef={`BILL${resultdata.billingid}`}
																/>
															</div>
														)}

														<UseCustomResultTemplatingPreview
															test={resultdata.test[idx].testInfo.reportTitle ? resultdata.test[idx].testInfo.reportTitle : resultdata.test[idx].testname}
															records={resultdata.test[idx].records}
															testInfo={resultdata.test[idx].testInfo}
															resultsettings={resultSettings}
															isScan={false}
															isResultView={true}
															testdetailcategory={resultdata.test[idx].testdetailcategory}
														/>

														{resultdata.test[idx].hasDrugs && Array.isArray(resultdata.test[idx].drugList) && resultdata.test[idx].drugList.length > 0 && <DrugsList hadDrugs={resultdata.test[idx].hasDrugs} drugList={resultdata.test[idx].drugList} />}

														{resultSettings.showMethod && resultdata.test[idx]?.testInfo?.method && (
															<div className='d-flex '>
																<div className='fw-bold'>Method: </div>
																<p className='mx-1'>{resultdata.test[idx].testInfo.method}</p>
															</div>
														)}
														{resultSettings.showMethod && resultdata.test[idx]?.testInfo?.instrumentation && (
															<div className='d-flex '>
																<div className='fw-bold'>Instrumentation: </div>
																<p className='mx-1'>{resultdata.test[idx].testInfo.instrumentation}</p>
															</div>
														)}

														{literature && (
															<div className="test-literature" style={{ marginTop: 16 }}>
																<UseClinicalLiteratureReview literature={literature} />
															</div>
														)}
													</section>
												);
											});

											if (allComments && allComments.length > 0) {
												nodes.push(
													<section key="result-comments" className="test-section extra-section" style={{ marginBottom: 40, paddingBottom: 24, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
														<UseResultCommentSinglePreview comments={resultdata.generalComments} />
													</section>
												);
											}

											return nodes;
										})()}
									</div>
								</div>

								<div ref={verifiedRef} style={{ width: '100%', textAlign: 'center', marginTop: 5, marginBottom: 5, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
									{resultdata.generalValidation && (
										<div className="d-flex" style={{ justifyContent: 'center', marginTop: 0 }}>
											<div className="text-uppercase">Verified By:</div>
											<div className="mx-2">{resultdata.generalValidation.username}</div>
										</div>
									)}
								</div>
								<div ref={footerRef} className={`report-footer ${footerForceBreak ? 'force-break' : ''}`} style={{ width: '100%', marginTop: 5, textAlign: 'center', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
									{resultSettings.includeLimitations && (
										<span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
									)}
									{resultSettings.includeLimitations && <UseDisclaimer disclaimer={resultSettings.limitations} />}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div style={{ textAlign: 'center', marginTop: 40 }}>
						<span>No report data found.</span>
					</div>
				)
			)}
			<style jsx global>{`
                .print-only-header { display: none; }
                .page-header-marker { display: none; }
                @media print {
                    @page { margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-page { box-shadow: none !important; background: #fff !important; }
                    .screen-header { display: none !important; }
                    .page-header-marker { display: block !important; }
                    .page-header-marker.break-before { page-break-before: always; }
                    .result { display: block !important; width: 100%; }
                    .print-content { display: block !important; margin: 0 !important; }
                    .test-section { break-inside: avoid-page; page-break-inside: avoid; }
                    .report-footer { break-inside: avoid-page; page-break-inside: avoid; }
                    .report-footer.force-break { page-break-before: always; }
                }
            `}</style>
		</Suspense>
	);
}
