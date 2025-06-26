import React from 'react';
import { PrintOutdata } from '../1/data'; // Assuming PrintOutdata structure
import styles from './vitalscan.module.css'
interface RecordItemVS {
    id: string | number;
    parameter: string;
    value: string;
    units: string;
    references: string;
    flags?: string;
}

interface CompanyInfoVS {
    name: string;
    location: string;
    email: string;
    contactUs: string;
    logoUrl?: string;
    motto?: string;
}

interface PatientInformationVS {
    fullName: string;
    gender: string;
    age: string;
    patientId: string;
    billingId: string;
    reportDate: string;
}

interface ValidatorVS {
    name: string;
    signatureUrl?: string;
}

interface VitalScanReportData {
    companyInfo: CompanyInfoVS;
    patientInformation: PatientInformationVS;
    testTitle: string;
    records: RecordItemVS[];
    comments?: string | null;
    validator?: ValidatorVS;
    limitationInformation?: string | null;
    barcodeUrl?: string;
    footerFinePrint?: string;
}

const VitalScanTemplate: React.FC = () => {
    const rawData = PrintOutdata as any; // Using the main PrintOutdata from previous templates

    // Data mapping (ensure this accurately reflects your PrintOutdata structure)
    const data: VitalScanReportData = {
        companyInfo: {
            name: rawData.companyInfo?.name || "VITALSCAN DIAGNOSTIC AND LABORATORY",
            location: rawData.companyInfo?.address || "Opposite West Hospital Main Gate Along the Picorna Road",
            email: rawData.companyInfo?.email || "vitalscandiagnostic@gmail.com",
            contactUs: `Contact Us: ${rawData.companyInfo?.phonenumber || '0537311922'} || ${rawData.companyInfo?.alternativenumber || '0207075710'}`,
            logoUrl: rawData.companyInfo?.logourl || "https://via.placeholder.com/60x60.png?text=VS",
            motto: rawData.companyInfo?.motto || "Your Health Is Vital"
        },
        patientInformation: {
            fullName: `${rawData.patientInformation?.firstname || 'MUJEEB'} ${rawData.patientInformation?.middlename || 'ABDUL'} ${rawData.patientInformation?.lastname || 'NASIR'}`,
            gender: rawData.patientInformation?.gender?.toUpperCase() || "MALE",
            age: `${rawData.patientInformation?.age || 10} ${rawData.patientInformation?.agetype?.toUpperCase() || 'YEARS'}`,
            patientId: rawData.patientInformation?.fullpatientid || "20256210891",
            billingId: String(rawData.billingid) || "10293",
            reportDate: rawData.lastupdatedon ? new Date(rawData.lastupdatedon).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }) : "6/2/2025, 5:37:17 PM"
        },
        testTitle: rawData.testname || "FBC CHILD",
        records: (rawData.records || []).map((r: any) => ({
            id: r.id,
            parameter: r.name,
            value: r.value,
            units: r.units,
            references: r.textReference || (r.lowerlimit && r.upperlimit ? `${r.lowerlimit} ~ ${r.upperlimit}` : 'N/A'),
            flags: r.flag || '' // You might need to derive H/L flags here
        })),
        comments: rawData.comments || "",
        validator: rawData.validators && rawData.validators.length > 0 ?
            { name: rawData.validators[0].username || "DR. WALTER HACKMAN" } :
            { name: "DR. WALTER HACKMAN" },
        limitationInformation: rawData.literatureReview || "This modality has its own limitations and the impression should be considered only as a professional opinion and correlated with clinical and other relevant patient data.",
        barcodeUrl: "https://via.placeholder.com/200x30.png?text=BARCODE12345", // Placeholder barcode
        footerFinePrint: "Software by leonidas IntelliLIS v0.0.1 copyright @2025. Tell: 0249434803 || 0595964245" // Example
    };

    // Helper to get flag class
    const getFlagClass = (flag?: string): string => {
        if (flag === 'H') return styles.flagH;
        if (flag === 'L') return styles.flagL;
        return '';
    };

    // Function to derive H/L flags if not present in data
    const deriveFlag = (valueStr: string, referencesStr: string): string => {
        const value = parseFloat(valueStr);
        if (isNaN(value) || !referencesStr || !referencesStr.includes('~')) return '';
        const parts = referencesStr.split('~').map(s => parseFloat(s.trim()));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return '';
        const [low, high] = parts;
        if (value < low) return 'L';
        if (value > high) return 'H';
        return '';
    };

    return (
        <div className={styles.page}>
            {/* Main Content Wrapper */}
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.logoSection}>
                        <img src={data.companyInfo.logoUrl} alt="VitalScan Logo" className={styles.logo} />
                        <div className={styles.logoMotto}>{data.companyInfo.motto}</div>
                    </div>
                    <div className={styles.labInfo}>
                        <div className={styles.labName}>{data.companyInfo.name}</div>
                        <div className={styles.labContact}>{data.companyInfo.location}</div>
                        <div className={styles.labContact}>{data.companyInfo.email}</div>
                        <div className={styles.labContact}>{data.companyInfo.contactUs}</div>
                    </div>
                </header>

                <div className={styles.sectionTitle}>Personal Information</div>
                <section className={styles.personalInfo}>
                    <div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>FULL NAME:</span>
                            <span className={styles.infoValue}>{data.patientInformation.fullName}</span>
                        </div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>GENDER:</span>
                            <span className={styles.infoValue}>{data.patientInformation.gender}</span>
                        </div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>AGE:</span>
                            <span className={styles.infoValue}>{data.patientInformation.age}</span>
                        </div>
                    </div>
                    <div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>PATIENT ID:</span>
                            <span className={styles.infoValue}>{data.patientInformation.patientId}</span>
                        </div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>BILLING ID:</span>
                            <span className={styles.infoValue}>{data.patientInformation.billingId}</span>
                        </div>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>REPORT DATE:</span>
                            <span className={styles.infoValue}>{data.patientInformation.reportDate}</span>
                        </div>
                    </div>
                </section>

                <div className={styles.sectionTitle}>{data.testTitle}</div>
                <div className={styles.resultsTableContainer}>
                    <table className={styles.resultsTable}>
                        <thead>
                            <tr>
                                <th className={styles.resultsTh}>Test</th>
                                <th className={styles.resultsTh} >Value</th>
                                <th className={styles.resultsTh}>Units</th>
                                <th className={styles.resultsTh} style={{ textAlign: 'center' }}>References</th>
                                <th className={styles.resultsTh} style={{ textAlign: 'center' }}>Flags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.records.map(record => {
                                const flagToDisplay = record.flags || deriveFlag(record.value, record.references);
                                return (
                                    <tr key={record.id}>
                                        <td className={`${styles.resultsTd} ${styles.resultsTdParameter}`}> {" > "}{record.parameter}</td>
                                        <td className={`${styles.resultsTd}`}>{record.value}</td>
                                        <td className={`${styles.resultsTd} ${styles.resultsTdUnits}`}>{record.units}</td>
                                        <td className={`${styles.resultsTd} ${styles.resultsTdReferences}`}>{record.references}</td>
                                        <td className={`${styles.resultsTd} ${styles.resultsTdFlags} ${getFlagClass(flagToDisplay)}`}>
                                            {flagToDisplay}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className={styles.commentsSection}>
                    <div className={styles.commentsTitle}>Comments</div>
                    <div className={styles.commentsContent}>
                        {data.comments ? (typeof data.comments === 'string' && data.comments.startsWith('<p>') ? <div dangerouslySetInnerHTML={{ __html: data.comments }} /> : data.comments) : '................................................................................'}
                    </div>
                </div>
            </div> {/* End of mainContent wrapper */}

            {/* Footer Elements Wrapper */}
            <div className={styles.pageFooterElements}>
                {data.validator && (
                    <div className={styles.validationSection}>
                        <div className={styles.validatedBy}>VALIDATED BY: {data.validator.name}</div>
                        <div className={styles.signatureLine}>SIGNATURE: ............................................</div>
                    </div>
                )}

                {data.limitationInformation && (
                    <div className={styles.limitationInfoSection}>
                        <div className={styles.limitationInfoTitle}>Limitation Information:</div>
                        {typeof data.limitationInformation === 'string' && data.limitationInformation.startsWith('<') ?
                            <div dangerouslySetInnerHTML={{ __html: data.limitationInformation }} /> :
                            <div>{data.limitationInformation}</div>
                        }
                    </div>
                )}

                {data.barcodeUrl && (
                    <div className={styles.barcodeSection}>
                        <img src={data.barcodeUrl} alt="Report Barcode" className={styles.barcodeImg} />
                    </div>
                )}

                {data.footerFinePrint && (
                    <div className={styles.footerFinePrint}>
                        {data.footerFinePrint}
                    </div>
                )}
            </div> {/* End of pageFooterElements wrapper */}
        </div>
    );
};

export default VitalScanTemplate;