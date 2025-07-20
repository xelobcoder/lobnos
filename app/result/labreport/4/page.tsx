import React from 'react';
import { PrintOutdata } from './data';
import styles from './MDSLancet.Template.module.css'

// Interfaces (RecordItem, PatientInformation, CompanyInfo, Validator, MDSReportData - as defined above with new fields)
interface RecordItem {
    id: string | number;
    name: string;
    value?: string | number;
    units?: string;
    textReference?: string;
    flag?: string;
    subItems?: { name: string; textReference: string }[];
}
interface PatientInformation {
    firstname: string;
    lastname: string;
    fullpatientid: string;
    age: number;
    gender: string;
    dob?: string;
    organization: string;
    referringDoctor: string;
}
interface CompanyInfo {
    name: string;
    address: string;
    phonenumber: string;
    prNum: string;
    logoUrl: string;
}

interface Validator {
    username: string;
    role?: string;
    licenseNumber?: string;
    signatureUrl?: string;
}

interface MDSReportData {
    companyInfo: CompanyInfo;
    patientInformation: PatientInformation;
    labRef?: string;
    mriNo?: string;
    specNo?: string;
    requested?: string;
    guarantor?: string;
    medAid?: string;
    tel?: string;
    collectionDate?: string;
    receivedDate?: string;
    finalReportDate?: string;
    recordsByCategory: { [categoryName: string]: RecordItem[] };
    limitationOfProcedure?: string;
    consultingDoctors?: { name: string, phone: string }[];
    footerCodes?: string;
    literatureReview?: string | null;
    validators?: Validator[];
}

// Helper functions (formatDateMDS, formatTimeMDS, getFlagForRecord) remain the same

const formatDateMDS = (dateStrWithTime: string | undefined): string => { /* ... as before ... */ return ""; };
const formatTimeMDS = (dateStrWithTime: string | undefined): string => { /* ... as before ... */ return ""; };
const getFlagForRecord = (record: RecordItem): string => { /* ... as before ... */ return ""; };


const MDSLancetTemplate: React.FC = () => {
    const rawData = PrintOutdata as any;

    const data: MDSReportData = {
        companyInfo: {
            name: rawData.companyInfo?.name || "VITALSCAN AND DIAGNOSTIC CENTRE",
            address: rawData.companyInfo?.address || "Tamale Depot",
            phonenumber: rawData.companyInfo?.fax || "0302 306 746",
            prNum: rawData.companyInfo?.prNum || "5201055",
            logoUrl: rawData.companyInfo?.logourl || "https://via.placeholder.com/40x40.png?text=MDS"
        },
        patientInformation: {
            firstname: rawData.patientInformation?.firstname || "ADAM",
            lastname: rawData.patientInformation?.lastname || "GARGO",
            fullpatientid: rawData.patientInformation?.fullpatientid || "NOT AVAILABLE",
            age: rawData.patientInformation?.age || 51,
            gender: rawData.patientInformation?.gender?.charAt(0).toUpperCase() || "M",
            dob: rawData.patientInformation?.dob,
            organization: rawData.patientInformation?.organization || "VITAL SCAN",
            referringDoctor: rawData.patientInformation?.referringDoctor || "OPP. LAS HOTEL"
        },
        labRef: rawData.labRef || "703949957",
        mriNo: rawData.mriNo || "GN01888456",
        specNo: rawData.specNo || "0603:HC000051L",
        requested: rawData.testname || "COAG",
 
        tel: rawData.tel || "VITAL SCAN (W) NOT AVAILABLE",
        collectionDate: rawData.collectionDate || "03/06/25 1653",
        receivedDate: rawData.enteredOn || "03/06/25 1653",
        finalReportDate: rawData.lastupdatedon || "03/06/25 1911",
        recordsByCategory: {
            "HAEMATOLOGY": (rawData.records || []).map((r: any) => ({
                id: r.id,
                name: r.name,
                value: r.value,
                units: r.units,
                textReference: r.textReference || (r.lowerlimit && r.upperlimit ? `${r.lowerlimit} - ${r.upperlimit}` : undefined),
                flag: r.flag,
                subItems: r.name === "INT.NORM.RATIO (INR)" ? [
                    { name: "Reference Range: Non-Therapeutic", textReference: "0.9  -  1.2" },
                    { name: "Therapeutic", textReference: "2.4  -  4.5" }
                ] : undefined
            }))
        },
        limitationOfProcedure: rawData.comments || "As with all diagnostic tests, a definite clinical diagnosis should not be based on the results of a single test, but should be made by physician after all clinical and laboratory findings have been evaluated. Please notify the Lab to repeat the test if clinical suspicion and/or clinical symptoms is in discordant with our results.",
        consultingDoctors: rawData.consultingDoctors || [
            { name: "Dr Colin de Bruyn", phone: "+2711 358 0800" },
            { name: "Dr Yannis Pillay", phone: "+2711 358 0800" },
            { name: "Dr Lindsay Earlam", phone: "+2711 358 0800" },
        ],
        footerCodes: rawData.footerCodes || "DAWU.H:GH_TAM_REP_PRT.RMRR.LMBL:LBLQ:3776406",

        // Map new fields
        literatureReview: rawData.literatureReview || null, // Or some default text if needed
        validators: rawData.validators || [ // Example validators, map from your PrintOutdata
            { username: "DR. JOHN DOE", role: "Pathologist", licenseNumber: "LIC12345" },
            { username: "JANE SMITH", role: "Medical Technologist", licenseNumber: "MT98765" }
        ]
    };

    return (
        <div className={styles.page}>
            {/* ... (header, reportTitleBar, patientInfoSection, noSampleInfo, resultsArea sections remain the same) ... */}
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <img src={data.companyInfo.logoUrl} alt="Lab Logo" className={styles.logo} />
                    <div>
                        <div className={styles.labNameLarge}>VITALSCAN </div>
                        <div className={styles.labSubName}>LABORATORIES AND DIAGNOSTICS </div>
                    </div>
                </div>
                <div className={styles.labContactHeader}>
                    <div><strong>{data.companyInfo.name}</strong></div>
                    <div>{data.companyInfo.address}</div>
                 <div className='d-flex'>
                       <div>Phone No: {data.companyInfo.phonenumber}.</div>
                       <div> Email : {data.companyInfo.prNum}</div>
                    </div>
                </div>
            </header>

            <div className={styles.reportTitleBar}>MEDICAL LABORATORY REPORT</div>

            <section className={styles.patientInfoSection}>
                <div className={styles.infoBlock}>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Patient</span>: <span className={styles.infoValue}>{`${data.patientInformation.firstname} ${data.patientInformation.lastname}`}</span>
                    </div>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Patient Ref</span>: <span className={styles.infoValue}>{data.patientInformation.fullpatientid}</span>
                    </div>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Doctors Ref</span>: <span className={styles.infoValue}>{data.patientInformation.referringDoctor}</span>
                    </div>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Age/Sex/DOB</span>: <span className={styles.infoValue}>{data.patientInformation.age} / {data.patientInformation.gender} / {data.patientInformation.dob || 'N/A'}</span>
                    </div>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Id Num</span>: <span className={styles.infoValue}>{data.patientInformation.organization}</span>
                    </div>
                </div>
                <div className={styles.infoBlock}>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Lab Ref.</span>: <span className={styles.infoValue}>{data.labRef}</span>
                    </div>
                     <div className={styles.infoBlock}>
                    <div className={styles.infoPair}><span className={styles.infoLabel}>Collection Date</span>: <span className={styles.infoValue}>{formatDateMDS(data.collectionDate)}</span> <span style={{ marginLeft: '5px' }}>{formatTimeMDS(data.collectionDate)}</span></div>
                    <div className={styles.infoPair}><span className={styles.infoLabel}>Received Date</span>: <span className={styles.infoValue}>{formatDateMDS(data.receivedDate)}</span> <span style={{ marginLeft: '5px' }}>{formatTimeMDS(data.receivedDate)}</span></div>
                    <div className={styles.infoPair}><span className={styles.infoLabel}>FINAL Report Date</span>: <span className={styles.infoValue}>{formatDateMDS(data.finalReportDate)}</span> <span style={{ marginLeft: '5px' }}>{formatTimeMDS(data.finalReportDate)}</span></div>
                </div>
                </div>
            </section>

            {Object.entries(data.recordsByCategory).map(([category, records]) => (
                <section key={category} className={styles.resultsArea}>
                    <div className={styles.sectionTitle}>FULL BLOOD COUNT</div>
                    <div className={styles.resultsHeaderRow}>
                        <div className={styles.resultsTestCol}>Test</div>
                        <div className={styles.resultsResultCol}>Result</div>
                        <div className={styles.resultsUnitsCol}>unit</div>
                        <div className={styles.resultsRefCol}>Reference</div>
                    </div>
                    {records.map(record => {
                        const flag = getFlagForRecord(record);
                        return (
                            <React.Fragment key={record.id}>
                                <div className={styles.resultRow}>
                                    <div className={styles.resultTestName}>{record.name}</div>
                                    <div className={styles.resultValue}>{flag && <span className={styles.resultFlag}>{flag}</span>}{record.value}</div>
                                    <div className={styles.resultUnits}>{record.units}</div>
                                    <div className={styles.resultRef}>{record.textReference}</div>
                                </div>
                                {record.subItems && record.subItems.map((sub, idx) => (
                                    <div className={`${styles.resultRow} ${styles.subResultRow}`} key={`${record.id}-sub-${idx}`}>
                                        <div className={styles.resultTestName}>{sub.name}</div>
                                        <div className={styles.resultValue}></div>
                                        <div className={styles.resultUnits}></div>
                                        <div className={styles.resultRef}>{sub.textReference}</div>
                                    </div>
                                ))}
                                {record.name === "APTT (PATIENT)" && (
                                    <div className={`${styles.resultRow}`} style={{ color: 'red', fontWeight: 'bold', fontStyle: 'italic' }}>
                                        <div className={styles.resultTestName}>SAMPLE COLLECTION DATE AND TIME COULD NOT BE CONFIRMED, TREAT RESULT WITH RESERVE</div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </section>
            ))}

            <section className={styles.limitationSection}>
                <div className={styles.limitationTitle}>LIMITATION OF PROCEDURE</div>
                <div>{data.limitationOfProcedure}</div>
                {data.consultingDoctors && data.consultingDoctors.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        For consultation by referring doctors only, please call:
                        {data.consultingDoctors.map(doc => (
                            <div key={doc.name} style={{ paddingLeft: '15px' }}>{doc.name} {doc.phone}</div>
                        ))}
                    </div>
                )}
            </section>

            {/* New Literature Review Section */}
            {data.literatureReview && (
                <section className={styles.literatureReviewSection}>
                    <div className={styles.literatureReviewTitle}>LITERATURE REVIEW</div>
                    {/* If literatureReview is HTML, use dangerouslySetInnerHTML */}
                    <div dangerouslySetInnerHTML={{ __html: data.literatureReview }} />
                    {/* If it's plain text: <div>{data.literatureReview}</div> */}
                </section>
            )}

            {/* New Validators Section - Placed before the main footer */}
            {data.validators && data.validators.length > 0 && (
                <section className={styles.validatorsSection}>
                    {data.validators.map((validator, index) => (
                        <div key={index} className={styles.validatorBlock}>
                            {validator.signatureUrl ? (
                                <img src={validator.signatureUrl} alt={`${validator.username} signature`} style={{ maxHeight: '40px', marginBottom: '5px' }} />
                            ) : (
                                <div className={styles.validatorSignatureLine}></div>
                            )}
                            <div className={styles.validatorName}>{validator.username}</div>
                            {validator.role && <div className={styles.validatorRole}>{validator.role}</div>}
                            {validator.licenseNumber && <div className={styles.validatorLicense}>Lic. #: {validator.licenseNumber}</div>}
                        </div>
                    ))}
                </section>
            )}


            <footer className={styles.footer}>
                <div className={styles.endOfReportMark}>** End of Report **</div>
                <div>{data.footerCodes}</div>
            </footer>
            <div className={styles.footerFinePrint}>
                lancet-ghana-report.rpt:160718.col:MLR.col
            </div>
        </div>
    );
};

export default MDSLancetTemplate;