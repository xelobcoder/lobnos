'use client';
import React, { useEffect, useState } from 'react';
import styles from './MDSLancet.Template.module.css';
import MdsCompanyInformation from '../../../../components/ResultView/MdsCompanyInformation';
import MdsPersonalInformation from '../../../../components/ResultView/MdsPersonalInformation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSearchParams, useRouter } from 'next/navigation';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { trackReportView, trackReportPrint } from '../../../../lib/printingTracker';
import VersionFooter from '../../../../components/accessories/VersionFooter';
import UseClinicalLiteratureReview from '../../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseCustomResultTemplatingPreview from '../../../../components/ResutlUI/useCustomResultTemplatingPreview';
import UseDisclaimer from '../../../../components/ResutlUI/useDisclaimer';
import UseResultCommentSinglePreview from '../../../../components/ResutlUI/useResultCommentSinglePreview';
import UseResultEntryScientist from '../../../../components/ResutlUI/UseResultEntryFormat';
import { defaultResultSettings, ResultSettings } from '../../../../components/ResultView/result-settings';
import ResultViewHtmlGeneratorUltrasound from '../../../../components/Auth/ResultViewHtmlGeneratorUltrasound';
import DrugsList from '../../../../components/Drugs/DrugsList';
import Watermark from '../../../../components/ResultView/Watermark';

const MDSLancetTemplate: React.FC = () => {
    const app = useApplication();
    const employeeid = app?.user?.employeeid;
    const prefixText = app?.settings?.billingidPrefix || '';
    const makepdfprintingcompulsory = (() => {
        const value = app?.settings?.makepdfprintingcompulsory;
        return value === 1 || value === '1' ||
            value === 'compulory' || value === 'compulsory';
    })();
    const [loader, setLoader] = useState(false);
    const [resultdata, setResultData] = useState<any>(null);
    const [resultSettings, setResultSettings] = useState<ResultSettings>(defaultResultSettings);
    const [pdfUrl, setPdfUrl] = useState<{ url: string; filename: string } | null>(null);
    const [showPdf, setShowPdf] = useState(false);
    const [showPdfControls, setShowPdfControls] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const billingid = searchParams?.get('csvid') || '';
    const test = searchParams?.get('testname') || '';
    const target = searchParams?.get('target') || '';
    const ascensionid = searchParams?.get('ascensionId') || '';
    const ptid = searchParams?.get('ptid') || '';
    const testid = searchParams?.get('testid');
    const csvid = searchParams?.get('csvid');
    const isScan = searchParams?.get('isScan') === 'true';
    const showWatermarkFromUrl = searchParams?.get('show_watermark') === 'true';
    const showWatermarkFromSettings = app?.settings?.show_watermark === 1;
    const showWatermark = showWatermarkFromUrl || showWatermarkFromSettings;
    const [isReplaceUltrasoundTestname, setIsReplaceUltrasoundTestname] = useState(false);
    const [ultrasoundTestname, setUltrasoundTestname] = useState(test);
    const [ultrasoundImages, setUltrasoundImages] = useState<any[]>([]);
    const url = `result/printout/ascension/getResult?csvid=${csvid}&&employeeid=${employeeid}&&testid=${testid}&&isScan=${isScan}&&testname=${test}&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&target=${target}&password=&&isBrowserPrintout=1`;

    const fetchUltrasoundImages = async () => {
        if (!ascensionid) return;
        try {
            const response = await customFetch(`ultrasound/images/${ascensionid}`);
            const isSuccess = response && (response.statusCode == 200 || response.statusCode == "200" || response.status === 'success');
            const resultData = response?.result || response?.results;

            if (isSuccess && Array.isArray(resultData)) {
                setUltrasoundImages(resultData);
            }
        } catch (error) {
            console.error('Failed to fetch ultrasound images:', error);
        }
    };

    useEffect(() => {
        if (resultdata?.testInfo?.reportitle && isScan) {
            setUltrasoundTestname(resultdata.testInfo.reportitle);
        } else if (test) {
            setUltrasoundTestname(test);
        }
    }, [resultdata, isScan, test]);

    useEffect(() => {
        if (employeeid && ascensionid && billingid) {
            setLoader(true);
            customFetch(url)
                .then((data) => {
                    if (data && data.status === 'error' && data.message && data.message.includes('Access window period has expired')) {
                        isScan ? router.push(`/operations/imaging/ultrasound/unauthorized?ascensionid=${ascensionid}&&patientid=${ptid}`) : router.push(`/operations/laboratory/unauthorized?ascensionid=${ascensionid}&&patientid=${ptid}`);
                        return;
                    }
                    if (data && data.resultsettings) {
                        setResultSettings(data.resultsettings);
                        // Fetch images if it's an ultrasound scan and settings allow it
                        if (isScan && data.resultsettings.ultrasoundSettings?.allowUltrasoundImages) {
                            fetchUltrasoundImages();
                        }
                    }
                    setResultData(data)
                    if (ascensionid && employeeid) {
                        trackReportView(ascensionid, employeeid);
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => { setLoader(false); });
        }
    }, [employeeid, ascensionid, billingid, isScan]);

    useEffect(() => {
        if (!loader && resultdata?.records) {
            ensureImagesLoaded().then(() => {
                generatePDF();
            }).catch(err => {
                console.error("Error loading images:", err);
                setTimeout(generatePDF, 1500);
            });
        }




        async function ensureImagesLoaded() {
            const resultElement = document.querySelector('.result');
            if (!resultElement) return;

            const images = Array.from(resultElement.querySelectorAll('img')) as HTMLImageElement[];

            const loadPromises = images.map(img => {
                if (img.complete && img.naturalHeight !== 0) {
                    return Promise.resolve();
                }


                if (img.src.startsWith('http')) {
                    img.crossOrigin = 'anonymous';
                }


                return new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = (e) => {
                        console.warn(`Error loading image: ${img.src}`, e);
                        resolve();
                    };
                });
            });

            // Wait for all images to load
            return Promise.all(loadPromises);
        }

        async function generatePDF() {
            setTimeout(async () => {
                const resultElement = document.querySelector('.result');
                if (!resultElement) return;
                let watermarkImgData = '';
                const watermarkOverlay = resultElement.querySelector('.watermark-overlay') as HTMLElement;
                const watermarkDisplay = watermarkOverlay ? watermarkOverlay.style.display : '';

                try {
                    const watermarkEl = document.querySelector('.watermark-seal') as HTMLElement;
                    if (watermarkEl) {
                        const watermarkCanvas = await html2canvas(watermarkEl, { scale: 2, backgroundColor: null, useCORS: true });
                        watermarkImgData = watermarkCanvas.toDataURL('image/png');
                    }
                } catch (e) {
                    console.error('Failed to capture watermark for PDF', e);
                }
                if (watermarkOverlay) watermarkOverlay.style.display = 'none';
                html2canvas(resultElement as HTMLElement, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    imageTimeout: 15000,
                    onclone: (clonedDoc) => {
                        const clonedImages = clonedDoc.querySelectorAll('img');
                        clonedImages.forEach((img: HTMLImageElement) => {
                            if (img.src.startsWith('http')) {
                                img.crossOrigin = 'anonymous';
                            }
                        });
                        const footerToHide = clonedDoc.querySelector('.pdf-hide-footer') as HTMLElement;
                        if (footerToHide) footerToHide.style.display = 'none';
                    }
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png',0.75);
                    const pdf = new jsPDF('p', 'mm', 'a4',true);
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
                    const pages = [];

                    while (remainingHeight > 0) {
                        pdf.addImage(
                            imgData,
                            'PNG',
                            margin,
                            imgY,
                            imgWidth,
                            imgHeight
                        );

                        // Add watermark to every page
                        if (watermarkImgData) {
                            const wSize = 120; // mm (Increased from 80)
                            pdf.addImage(watermarkImgData, 'PNG', (pageWidth - wSize) / 2, (pageHeight - wSize) / 2, wSize, wSize);
                        }

                        pdf.saveGraphicsState();
                        pdf.setTextColor(225, 225, 225);
                        pdf.setFontSize(9);

                        pdf.restoreGraphicsState();
                        pdf.setTextColor(60, 60, 60);
                        pdf.setFontSize(10);
                        pdf.text(`${pageNum}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
                        pdf.setFontSize(8);
                        pdf.setTextColor(65, 105, 225);
                        const copyright = `Software by leonides intell,PLS v0.0.1 copyright @${new Date().getFullYear()}. Tell: 0249434803 || 0595964565`;
                        pdf.text(copyright, pageWidth / 2, pageHeight - 7, { align: 'center' });
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

                    // Restore watermark overlay
                    if (watermarkOverlay) watermarkOverlay.style.display = watermarkDisplay;
                });
            }, 500);
        }
    }, [loader, resultdata]);

    useEffect(() => {
        if (makepdfprintingcompulsory && pdfUrl) {
            setShowPdfControls(true);
            setShowPdf(true);
        }
    }, [makepdfprintingcompulsory, pdfUrl]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl+S: Download PDF
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                if (pdfUrl) {
                    const link = document.createElement('a');
                    link.href = pdfUrl.url;
                    link.download = pdfUrl.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            // Ctrl+P: Print PDF
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                if (pdfUrl) {
                    if (ascensionid && employeeid) {
                        trackReportPrint(ascensionid, employeeid);
                    }
                    window.print();
                }
            }
            // Escape: Close PDF controls
            if (event.key === 'Escape') {
                event.preventDefault();
                setShowPdfControls(false);
                setShowPdf(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pdfUrl, showPdfControls, showPdf, ascensionid, employeeid]);

    if (loader) return <h4>Loading .....</h4>;
    if (!resultdata?.records) return <h4></h4>;

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
                        onClick={() => {
                            if (ascensionid && employeeid) {
                                trackReportPrint(ascensionid, employeeid);
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
                {showPdf && pdfUrl && (
                    <div style={{ width: '100vw', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
                        <iframe
                            src={`${pdfUrl.url}#toolbar=1&navpanes=1&scrollbar=1`}
                            title="PDF Viewer"
                            style={{
                                flex: 1,
                                border: 'none',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                @media print {
                    body { background: white !important; padding: 10px !important; }
                    .payslip { border: none !important; }
                    @page { margin: 0.5cm; }
                    button { display: none !important; }
                    .no-browser-print { display: none !important; }
                }
            `}</style>
            {isScan && <div className='bg-secondary-subtle p-3 d-flex  justify-content-between no-print'>
                <div>
                    <label>Replace Ultrasound Scan Report Name </label>
                    {isScan && <input type='checkbox' className='form-check-input' checked={isReplaceUltrasoundTestname} onChange={(e) => setIsReplaceUltrasoundTestname(e.target.checked)} />}
                </div>
                <div className='col-8'>
                    {isScan && isReplaceUltrasoundTestname && <input type='text' className='form-control' value={ultrasoundTestname} onChange={(e) => setUltrasoundTestname(e.target.value)} />}
                </div>
            </div>}
            {pdfControls}
            {!showPdfControls && (
                <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'white' }}>
                    <div className={styles.page} style={{
                        ['--font-family' as any]: resultSettings.fontfamily,
                        minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white',

                    }}>
                        <div className='result' style={{ position: 'relative' }}>
                            <MdsCompanyInformation
                                styles={styles}
                                logourl={resultdata.logourl}
                                resultsettings={resultSettings}
                                companyInfo={resultdata.companyInfo}
                            />
                            <div className={`${styles.reportTitleBar}`}
                                style={{
                                    ['--bg-color' as any]: resultSettings.mainReportHeaderBgColor,
                                    color: resultSettings.mainReportHeaderColor
                                }}>
                                {isScan ? 'ULTRASOUND REPORT ' : 'MEDICAL LABORATORY REPORT'}
                            </div>
                            <MdsPersonalInformation
                                styles={styles}
                                patientInformation={resultdata.patientInformation}
                                referrerFacility={resultdata.referrerFacility}
                                labRef={`${prefixText}${resultdata.samplingInformation?.billingid || billingid}(${resultdata.samplingInformation?.id})`}
                                collectionDate={!isScan ? resultdata.samplingInformation?.collectionEndDate : ''}
                                finalReportDate={resultdata.samplingInformation?.resultEntryEnd}
                                resultsettings={resultSettings}
                            />
                            <div style={{ width: '100%', margin: '0', position: 'relative' }}>
                                {showWatermark && resultdata?.companyInfo?.name && (
                                    <Watermark
                                        text={resultdata.companyInfo.name}
                                        subText={resultdata?.patientInformation?.fullpatientid || ptid}
                                    />
                                )}
                                <section>
                                    {!isScan && <UseCustomResultTemplatingPreview
                                        test={resultdata?.testInfo?.reportitle || resultdata?.testname || test}
                                        records={resultdata?.records}
                                        resultsettings={resultSettings}
                                        isScan={isScan}
                                        testInfo={resultdata?.testInfo}
                                        testdetailcategory={resultdata.testdetailcategory}
                                    />}
                                    {isScan && <ResultViewHtmlGeneratorUltrasound resultsettings={resultdata.resultsettings}
                                        test={isReplaceUltrasoundTestname ? ultrasoundTestname : (resultdata?.testInfo?.reportitle || test)}
                                        testInfo={resultdata?.testInfo}
                                        resultentry={resultdata?.resultentry}
                                        records={resultdata?.records}
                                        images={ultrasoundImages} />
                                    }

                                    {resultdata.hasDrugs && Array.isArray(resultdata.drugList) && resultdata.drugList.length > 0 && <DrugsList hadDrugs={resultdata.hasDrugs} drugList={resultdata.drugList} />}
                                    {!isScan && (<>
                                        <UseClinicalLiteratureReview literature={resultdata?.literatureReview} />
                                        <UseResultCommentSinglePreview comments={resultdata?.comments} />
                                    </>)}
                                </section>
                                <section>
                                    {!isScan && resultSettings.useIndividualValidations && !resultSettings.useGeneraralValidation &&
                                        <div style={{ pageBreakInside: 'avoid' }}>
                                            <UseResultEntryScientist
                                                lastupdatedon={resultdata?.lastupdatedon}
                                                validators={resultdata?.validators}
                                                resultentry={resultdata?.resultentry}
                                                enteredOn={resultdata?.enteredOn}
                                                ascensionid={ascensionid}
                                                billingid={resultdata?.billingid}
                                                resultsettings={resultSettings}
                                                patientid={resultdata?.patientInformation?.patientid}
                                                useIndividualValidation={resultSettings.useIndividualValidations}
                                            />
                                        </div>}
                                    {!isScan && resultSettings.showMethod && resultdata.testInfo && resultdata.testInfo.method && (
                                        <div className='d-flex '>
                                            <div className='fw-bold'>Method: </div>
                                            <p className='mx-1'>{resultdata.testInfo.method}</p>
                                        </div>
                                    )}
                                    {!isScan && resultSettings.showMethod && resultdata.testInfo && resultdata.testInfo.instrumentation && (
                                        <div className='d-flex '>
                                            <div className='fw-bold'>Instrumentation: </div>
                                            <p className='mx-1'>{resultdata.testInfo.instrumentation}</p>
                                        </div>
                                    )}
                                    {resultSettings?.useGeneraralValidation && resultdata.generalValidation && (
                                        <div className="d-flex" style={{ justifyContent: 'center', marginTop: 8 }}>
                                            <div className="text-uppercase">Verified By:</div>
                                            <div className="mx-2">{resultdata.generalValidation.username}</div>
                                        </div>
                                    )}
                                    {(resultSettings?.useGeneraralValidation == false && resultdata.generalValidation) && (
                                        <div className="d-flex" style={{ justifyContent: 'center', marginTop: 8 }}>
                                            <div className="text-uppercase">Printed By:</div>
                                            <div className="mx-2">{resultdata.generalValidation.username}</div>
                                        </div>
                                    )}
                                    <span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
                                    {!isScan && resultSettings.includeLimitations && <UseDisclaimer disclaimer={resultSettings.limitations} />}
                                    <div className="mt-5 pdf-hide-footer">
                                        <VersionFooter />
                                    </div>
                                </section>
                            </div>
                        </div>
                        <footer>
                            <div className={styles.pageNumber}>
                                <span className="pageNumber"></span>
                            </div>
                        </footer>
                    </div>
                    {!makepdfprintingcompulsory && (
                        <button
                            className="no-print"
                            style={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                zIndex: 10000,
                                background: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                            onClick={async () => {
                                if (ascensionid && employeeid) {
                                    await trackReportPrint(ascensionid, employeeid);
                                }
                                window.print();
                            }}
                        >
                            Print Report
                        </button>)}

                    {!makepdfprintingcompulsory && pdfUrl && (
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
            )}
        </>
    );
};

export default MDSLancetTemplate;