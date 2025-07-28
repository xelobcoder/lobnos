'use client';
import React, { useEffect, useState } from 'react';
import styles from './MDSLancet.Template.module.css';
import MdsCompanyInformation from '../../../../components/ResultView/MdsCompanyInformation';
import MdsPersonalInformation from '../../../../components/ResultView/MdsPersonalInformation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../components/Auth/customFetch';
import VersionFooter from '../../../../components/accessories/VersionFooter';
import UseClinicalLiteratureReview from '../../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseCustomResultTemplatingPreview from '../../../../components/ResutlUI/useCustomResultTemplatingPreview';
import UseDisclaimer from '../../../../components/ResutlUI/useDisclaimer';
import UseResultCommentSinglePreview from '../../../../components/ResutlUI/useResultCommentSinglePreview';
import UseResultEntryScientist from '../../../../components/ResutlUI/UseResultEntryFormat';
import { defaultResultSettings, ResultSettings } from '../../../../components/ResultView/result-settings';

const MDSLancetTemplate: React.FC = () => {
    const [loader, setLoader] = useState(false);
    const [resultdata, setResultData] = useState<any>(null);
    const [resultSettings, setResultSettings] = useState<ResultSettings>(defaultResultSettings);
    const [pdfUrl, setPdfUrl] = useState<{ url: string; filename: string } | null>(null);
    const [showPdf, setShowPdf] = useState(false);
    const [showPdfControls, setShowPdfControls] = useState(false);
    const searchParams = useSearchParams();
    const billingid = searchParams?.get('csvid') || '';
    const test = searchParams?.get('testname') || '';
    const target = searchParams?.get('target') || '';
    const ascensionid = searchParams?.get('ascensionId') || '';
    const ptid = searchParams?.get('ptid') || '';
    const testid = searchParams?.get('testid');
    const csvid = searchParams?.get('csvid');

    const url = `result/printout/ascension/getResult?csvid=${csvid}&&testid=${testid}&&testname=${test}&tenantId=3&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&target=${target}&password=&&isBrowserPrintout=1`;

    useEffect(() => {
        setLoader(true);
        customFetch(url)
            .then((data) => {
                if (data && data.resultsettings) {
                    setResultSettings(data.resultsettings);
                }
                setResultData(data)
            })
            .catch((err) => console.error(err))
            .finally(() => { setLoader(false); });
    }, []);

    useEffect(() => {
        if (!loader && resultdata?.records) {
            const resultElement = document.querySelector('.result');
            if (!resultElement) return;
            const images = Array.from(resultElement.querySelectorAll('img')) as HTMLImageElement[];
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
                const resultElement = document.querySelector('.result');
                if (!resultElement) return;
                html2canvas(resultElement as HTMLElement, { scale: 2, useCORS: true }).then(canvas => {
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
        <>
            {pdfControls}
            {!showPdfControls && (
                <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
                                labRef={`BILL${resultdata.samplingInformation?.billingid || billingid}(${resultdata.samplingInformation?.id})`}
                                collectionDate={resultdata.samplingInformation?.collectionEndDate}
                                finalReportDate={resultdata.samplingInformation?.resultEntryEnd}
                            />
                            <div style={{ flex: 1 }}>
                                <section>
                                    <UseCustomResultTemplatingPreview
                                        test={resultdata?.testname}
                                        records={resultdata?.records}
                                        resultsettings={resultSettings}
                                        testInfo={resultdata?.testInfo}
                                        testdetailcategory={resultdata.testdetailcategory}
                                    />

                                    <UseClinicalLiteratureReview literature={resultdata?.literatureReview} />
                                    <UseResultCommentSinglePreview comments={resultdata?.comments} />
                                </section>
                                <section>
                                    {resultSettings.useIndividualValidations && !resultSettings.useGeneraralValidation && <UseResultEntryScientist
                                        lastupdatedon={resultdata?.lastupdatedon}
                                        validators={resultdata?.validators}
                                        resultentry={resultdata?.resultentry}
                                        enteredOn={resultdata?.enteredOn}
                                        ascensionid={ascensionid}
                                        billingid={resultdata?.billingid}
                                        resultsettings={resultSettings}
                                        patientid={resultdata?.patientInformation?.patientid}
                                    />}
                                    {resultSettings.showMethod && resultdata.testInfo && resultdata.testInfo.method && (
                                        <div className='d-flex '>
                                            <div className='fw-bold'>Method: </div>
                                            <p className='mx-1'>{resultdata.testInfo.method}</p>
                                        </div>
                                    )}
                                    {resultSettings.showMethod && resultdata.testInfo && resultdata.testInfo.instrumentation && (
                                        <div className='d-flex '>
                                            <div className='fw-bold'>Instrumentation: </div>
                                            <p className='mx-1'>{resultdata.testInfo.instrumentation}</p>
                                        </div>
                                    )}
                                    <span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
                                    {resultSettings.includeLimitations && <UseDisclaimer  disclaimer={resultSettings.limitations}/>}
                                </section>
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
            )}
        </>
    );
};

export default MDSLancetTemplate;