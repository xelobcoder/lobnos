import React from 'react';
import { PrintOutdata } from '../1/data';
import styles from './SRL.Template.module.css'

interface ResultSettings {
    letterHeading: number;
    literatureReview: number;
    DepartmentEntry: number;
    passwordonResult: number;
    samplingInformation: number;
}

interface RecordItem {
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
    undercategoryText?: string;
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
    phonenumber: number | string;
    address: string;
    website: string;
    street: string;
    alternativenumber: number | string;
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
    middlename?: string;
    organization?: string;
    contactpointer: string;
    whatAppcontact?: string;
    referringDoctor?: string;
}

interface Validator {
    username: string;
    employeeid: number;
    role: string;
}

interface DrugItem {
    id: number;
    drug: string;
    sensitivity: string;
}

interface ReportData {
    resultsettings: ResultSettings;
    records: RecordItem[];
    companyInfo: CompanyInfo;
    patientInformation: PatientInformation;
    comments: string | null;
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
    drugList?: DrugItem[];
    clientNameAndAddress?: string;
    clientCode?: string;
    patientRefNo?: string;
    testReportStatus?: string;
    drawnDate?: string;
    clientPatientId?: string;
    qrCodeUrlLeft?: string;
    qrCodeUrlRight?: string;
}

const formatDateSRL = (dateString: string | undefined, includeTime = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        let timeStr = '';
        if (includeTime) {
            const hr = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            timeStr = ` ${hr}:${min}`;
        }
        return `${d}/${m}/${y}${timeStr}`;
    } catch (e) { return dateString; }
};

const getPatientFullNameSRL = (patientInfo: PatientInformation): string => {
    return `${patientInfo.firstname} ${patientInfo.lastname}`.toUpperCase().trim();
};

const groupRecordsByCategorySRL = (records: RecordItem[]): Record<string, { name: string, subGroups: Record<string, RecordItem[]> }> => {
    return records.reduce((acc, record) => {
        const categoryKey = record.category || 'GENERAL TESTS';
        const subCategoryKey = record.undercategoryText || 'DefaultSubgroup';

        if (!acc[categoryKey]) {
            acc[categoryKey] = { name: categoryKey, subGroups: {} };
        }
        if (!acc[categoryKey].subGroups[subCategoryKey]) {
            acc[categoryKey].subGroups[subCategoryKey] = [];
        }
        acc[categoryKey].subGroups[subCategoryKey].push(record);
        acc[categoryKey].subGroups[subCategoryKey].sort((a, b) => a.ordering - b.ordering);
        return acc;
    }, {} as Record<string, { name: string, subGroups: Record<string, RecordItem[]> }>);
};

const SRLTemplate: React.FC = () => {
    const data: ReportData = PrintOutdata;
    const { companyInfo, patientInformation, records, comments, logourl, billingid, enteredOn, lastupdatedon,
        clientNameAndAddress, clientCode, patientRefNo, testReportStatus, drawnDate, clientPatientId,
        qrCodeUrlLeft, qrCodeUrlRight, hasDrugs, drugList, literatureReview } = data;

    const groupedRecords = groupRecordsByCategorySRL(records);

    const getResultDisplaySRL = (record: RecordItem): { display: string, className: string } => {
        let classList = [styles.resultsTd, styles.resultsTdCentered];
        let displayValue = record.value;

        if (record.lowerlimit || record.upperlimit) {
            const value = parseFloat(record.value);
            const lower = parseFloat(record.lowerlimit);
            const upper = parseFloat(record.upperlimit);
            let flagText = "";
            if (!isNaN(value)) {
                if (!isNaN(lower) && value < lower) flagText = "Low ";
                else if (!isNaN(upper) && value > upper) flagText = "High ";
            }
            if (flagText) {
                displayValue = `${flagText}${record.value}`;
                classList.push(styles.resultFlagged);
            }
        }
        return { display: displayValue, className: classList.join(' ') };
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src={logourl || "https://via.placeholder.com/120x35.png?text=SRL+Logo"} alt="SRL Logo" className={styles.logo} />
                    <div className={styles.labNameHeader}>{companyInfo.name}</div>
                </div>
                <div className={styles.headerRight}>
                    <div>Patient Ref. No.: <strong>{patientRefNo || patientInformation.fullpatientid || 'N/A'}</strong></div>
                    <div>Client Code: <strong>{clientCode || 'N/A'}</strong></div>
                    <div style={{ marginTop: '5px', borderTop: '1px solid #ccc', paddingTop: '5px' }}>
                        <div>{companyInfo.address} {companyInfo.street}</div>
                        <div>Tel: {companyInfo.phonenumber} | Email: {companyInfo.email}</div>
                    </div>
                </div>
            </header>

            <div className={styles.mainTitle}>DIAGNOSTIC REPORT</div>

            {clientNameAndAddress && (
                <div className={styles.clientInfoSection}>
                    <strong>CLIENT'S NAME AND ADDRESS:</strong> {clientNameAndAddress}
                </div>
            )}

            <div className={styles.patientDetailGrid}>
                <div className={styles.infoPair}><span className={styles.infoLabel}>PATIENT NAME:</span> <span className={styles.infoValue}>{getPatientFullNameSRL(patientInformation)}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>ACCESSION NO:</span> <span className={styles.infoValue}>{String(billingid)}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>PATIENT ID:</span> <span className={styles.infoValue}>{patientInformation.fullpatientid || 'N/A'}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>AGE / SEX:</span> <span className={styles.infoValue}>{patientInformation.age} {patientInformation.agetype} / {patientInformation.gender.toUpperCase()}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>REFERRING DOCTOR:</span> <span className={styles.infoValue}>{patientInformation.referringDoctor || 'SELF'}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>CLIENT PATIENT ID:</span> <span className={styles.infoValue}>{clientPatientId || ''}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>DRAWN:</span> <span className={styles.infoValue}>{formatDateSRL(drawnDate || patientInformation.date, true)}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>RECEIVED:</span> <span className={styles.infoValue}>{formatDateSRL(enteredOn, true)}</span></div>
                <div className={styles.infoPair}><span className={styles.infoLabel}>REPORTED:</span> <span className={styles.infoValue}>{formatDateSRL(lastupdatedon, true)}</span></div>
            </div>

            <div className={styles.reportStatus}>Test Report Status: {testReportStatus || 'Final'}</div>

            <table className={styles.resultsTable}>
                <thead>
                    <tr>
                        <th className={styles.resultsTh} style={{ width: '40%', textAlign: 'left' }}>Test Name</th>
                        <th className={styles.resultsTh} style={{ width: '20%' }}>Results</th>
                        <th className={styles.resultsTh} style={{ width: '25%' }}>Biological Reference Interval</th>
                        <th className={styles.resultsTh} style={{ width: '15%' }}>Units</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedRecords).map(([categoryKey, categoryGroup]) => (
                        <React.Fragment key={categoryKey}>
                            <tr><td colSpan={4} className={`${styles.resultsTd} ${styles.categoryName}`}>{categoryGroup.name.toUpperCase()}</td></tr>
                            {Object.entries(categoryGroup.subGroups).map(([subCategoryKey, recordsInCategory]) => (
                                <React.Fragment key={subCategoryKey}>
                                    {subCategoryKey !== 'DefaultSubgroup' && (
                                        <tr><td colSpan={4} className={`${styles.resultsTd} ${styles.subCategoryName}`}>{subCategoryKey}</td></tr>
                                    )}
                                    {recordsInCategory.map(record => {
                                        const { display: resultDisplay, className: resultClassName } = getResultDisplaySRL(record);
                                        const refInterval = record.lowerlimit && record.upperlimit ? `${record.lowerlimit} - ${record.upperlimit}` : record.textReference || '';
                                        return (
                                            <tr key={record.id}>
                                                <td className={styles.resultsTd}>{record.name}</td>
                                                <td className={resultClassName}>{resultDisplay}</td>
                                                <td className={`${styles.resultsTd} ${styles.resultsTdCentered}`}>{refInterval}</td>
                                                <td className={`${styles.resultsTd} ${styles.resultsTdCentered}`}>{record.units}</td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {hasDrugs && drugList && drugList.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <div className={`${styles.antibioticSensitivityTitle}`}>
                        ANTIBIOTIC SENSITIVITY PATTERN
                    </div>
                    <table className={styles.drugTable}>
                        <thead>
                            <tr>
                                <th className={styles.drugTh}>Antibiotic</th>
                                <th className={`${styles.drugTh} ${styles.drugTdCentered}`}>Sensitivity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drugList.map(drug => (
                                <tr key={drug.id}>
                                    <td className={styles.drugTd}>{drug.drug}</td>
                                    <td className={`${styles.drugTd} ${styles.drugTdCentered}`}>{drug.sensitivity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {comments && (
                <div className={styles.interpretationSection}>
                    <div className={styles.interpretationTitle}>Interpretation(s)</div>
                    <div style={{ fontSize: '8.5pt', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: comments }} />
                </div>
            )}
            {literatureReview && (
                <div className={styles.interpretationSection}>
                    <div className={styles.interpretationTitle}>Literature Review:</div>
                    <div style={{ fontSize: '8.5pt', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: literatureReview }} />
                </div>
            )}

            <footer className={styles.footer}>
                <div className={styles.qrCode}>
                    {qrCodeUrlLeft ? <img src={qrCodeUrlLeft} alt="QR Code Left" className={styles.qrImg} /> : "QR"}
                </div>
                <div className={styles.footerText}>
                    --- End of Report --- <br />
                    (This is a system generated report and does not usually require a signature unless specified)
                </div>
                <div className={styles.qrCode}>
                    {qrCodeUrlRight ? <img src={qrCodeUrlRight} alt="QR Code Right" className={styles.qrImg} /> : "QR"}
                </div>
            </footer>
        </div>
    );
};

export default SRLTemplate;