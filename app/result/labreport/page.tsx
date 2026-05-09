'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {  customFetch } from '../../../components/Auth/customFetch';
import CompanyHeaders from '../../../components/ResultView/CompanyHeaders';
import PersonalInformation from '../../../components/ResultView/PersonalInformation';
import UseClinicalLiteratureReview from '../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseCustomResultTemplatingPreview from '../../../components/ResutlUI/useCustomResultTemplatingPreview';
import UseResultCommentSinglePreview from '../../../components/ResutlUI/useResultCommentSinglePreview';
import VersionFooter from '../../../components/accessories/VersionFooter';
import UseDisclaimer from '../../../components/ResutlUI/useDisclaimer';
import UseResultEntryScientist from '../../../components/ResutlUI/UseResultEntryFormat';
import styles from './5/vitalscan.module.css';
import { defaultResultSettings, ResultSettings } from '../../../components/ResultView/result-settings';
import { useApplication } from '../../../components/Auth/useApplicationContext';



interface Record {
    id: number;
    testid: number;
    name: string;
    field: string;
    value: string;
    hasunits: number;
    units: string;
    plan: string;
    ordering: number;
    textReference: string;
    upperlimit: string;
    lowerlimit: string;
    category: string | null;
    options: string;
    undercategory: number;
    categoryid: number | null;
    ascensionid: number;
    billingid: number;
    patientid: number;
    originalvalue: string;
    created_on: string;
    updated_on: string;
    employeeid: number;
    entrymode: string;
    fieldid: number;
}

interface CompanyInfo {
    name: string;
    email: string;
    motto: string;
    phonenumber: number;
    address: string;
    website: string;
    street: string;
    alternativenumber: number;
}

interface PatientInformation {
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string;
    activation_status: string;
    lastname: string;
    middlename: string;
    organization: string;
    contactpointer: string;
    whatAppcontact: string;
}

interface Validator {
    username: string;
    employeeid: number;
    role: string;
}

interface DrugItem {
    ascensionid: number;
    id: number;
    sensitivity: string;
    drug: string;
}

interface ResultData {
    resultsettings: ResultSettings;
    records: Record[];
    companyInfo: CompanyInfo;
    patientInformation: PatientInformation;
    comments: string;
    testname: string;
    validators: Validator[];
    hasDrugs: boolean;
    patientid: number;
    billingid: number;
    lastupdatedon: string;
    logourl: string;
    enteredOn: string;
    resultentry: string;
    literatureReview: string | null;
    drugList: DrugItem[];
}

export default function RESULT_FOR_PRINTING() {

    const [loader, setLoader] = useState(false);
    const [resultdata, setResultData] = useState<ResultData | null>(null);
    const [resultSettings, setResultSettings] = useState<ResultSettings>(defaultResultSettings);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const billingid = searchParams?.get('csvid') || '';
    const test = searchParams?.get('testname') || '';
    const employeeid = useApplication().user?.employeeid || '';
    const target = searchParams?.get('target') || '';
    const ascensionid = searchParams?.get('ascensionId') || '';
    const ptid = searchParams?.get('ptid') || '';
    const testid = searchParams?.get('testid');
    const csvid = searchParams?.get('csvid');

    const url = `result/printout/ascension/getResult?csvid=${csvid}&&employeeid=${employeeid}&&testid=${testid}&&testname=${test}&tenantId=3&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&target=${target}&password=&&isBrowserPrintout=1`;

    useEffect(() => {
        setLoader(true);
        customFetch(url)
            .then((data) => setResultData(data))
            .catch((err) => console.error(err))
            .finally(() => { setLoader(false); });
    }, []);

    useEffect(() => {
        if (!loader && resultdata?.records) {
            // Wait for logo image to load
            const logoImg = document.querySelector('.result img');
            if (logoImg && !(logoImg as HTMLImageElement).complete) {
                (logoImg as HTMLImageElement).onload = () => generatePDF();
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
                    const margin = 10; // 10mm margin on all sides
                    const usableWidth = pageWidth - margin * 2;
                    const usableHeight = pageHeight - margin * 2;
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgWidth = usableWidth;
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    let position = margin;
                    let remainingHeight = imgHeight;
                    let imgY = margin;
                    let pageCount = 0;

                    while (remainingHeight > 0) {
                        pdf.addImage(
                            imgData,
                            'PNG',
                            margin,
                            imgY,
                            imgWidth,
                            imgHeight
                        );

                        remainingHeight -= usableHeight;
                        imgY -= usableHeight;
                        pageCount++;
                        if (remainingHeight > 0) pdf.addPage();
                    }
                    // Build PDF filename
                    const safeTestName = (test || '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                    const filename = `${ascensionid || ''}_${safeTestName}.pdf`;
                    // Show PDF embedded in page
                    const blob = pdf.output('blob');
                    const blobUrl = URL.createObjectURL(blob);
                    setPdfUrl(blobUrl);
                });
            }, 500);
        }
    }, [loader, resultdata]);

    if (loader) return <h4>Loading .....</h4>;
    if (!resultdata?.records) return <h4></h4>;

    // Show the PDF iframe once ready
    if (pdfUrl) {
        return (
            <iframe src={pdfUrl} title="Lab Report PDF" style={{ width: '100vw', height: '100vh', border: 'none' }} />
        );
    }

    // Render the report HTML visibly, overlay loading spinner
    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            {/* Loading overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 'bold' }}>Generating PDF...</span>
            </div>
            {/* Report content */}
            <div className={styles.page} style={{ fontFamily: resultSettings.fontfamily }}>
                <div className="result">
                    <div >
                        <section>
                            <CompanyHeaders
                                companyInfo={
                                    resultdata?.companyInfo
                                        ? {
                                            ...resultdata.companyInfo,
                                            alternativenumber: resultdata.companyInfo.alternativenumber?.toString()
                                        }
                                        : null
                                }
                                logo={resultdata?.logourl}
                            />
                            <PersonalInformation
                                PersonalInformation={{
                                    ...(resultdata?.patientInformation
                                        ? {
                                            ...resultdata.patientInformation,
                                            patientid: resultdata.patientInformation.patientid.toString(),
                                            fullpatientid: resultdata.patientInformation.fullpatientid
                                                ? resultdata.patientInformation.fullpatientid
                                                : ''
                                        }
                                        : { fullpatientid: '' })
                                }}
                                billingid={resultdata?.billingid}
                            />
                        </section>

                        <section>
                            <UseCustomResultTemplatingPreview
                                test={resultdata?.testname}
                                records={resultdata?.records}
                                resultsettings={resultSettings}
                            />
                            <UseResultCommentSinglePreview comments={resultdata?.comments} />
                            <UseClinicalLiteratureReview literature={resultdata?.literatureReview} />
                        </section>
                        <section>
                            <UseResultEntryScientist
                                lastupdatedon={resultdata?.lastupdatedon}
                                validators={resultdata?.validators}
                                resultentry={resultdata?.resultentry}
                                billingid={resultdata?.billingid}
                                ascensionid={ascensionid}
                                enteredOn={resultdata?.enteredOn}
                                patientid={resultdata.patientInformation.patientid}
                                resultsettings={resultSettings}
                                useIndividualValidation={resultdata.resultsettings.useIndividualValidations}
                            />
                            <span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
                            {resultSettings.includeLimitations && <UseDisclaimer disclaimer={resultSettings.limitations} />}
                        </section>
                    </div>
                    <section>
                        <VersionFooter />
                    </section>
                </div>
            </div>
        </div>
    );
}
