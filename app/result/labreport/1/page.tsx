import React from 'react';
import { PrintOutdata } from './data';

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
    name: string; // Test name, e.g., "White Blood Cells"
    field: string; // Often same as name
    value: string; // Assumed to be the human-readable result
    hasunits: number;
    units: string;
    plan: string; // e.g., "textReference", "input"
    ordering: number;
    textReference: string; // e.g., "< 5.0"
    upperlimit: string;
    lowerlimit: string;
    category: string | null; // e.g., "HEMATOLOGY"
    options: string;
    undercategory: number;
    categoryid: number | null;
    ascensionid: number;
    billingid: number;
    patientid: number;
    originalvalue: string; // Encrypted in example
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
    fullpatientid: string; // e.g., "NR-000008-NT"
    designation: string; // e.g., "Ms."
    firstname: string;
    email: string;
    dob: string; // Date of Birth
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string; // e.g., "years"
    occupation: string;
    date: string; // Date of registration/visit relevant to patient info
    activation_status: string;
    lastname: string;
    middlename?: string;
    organization?: string; // Could be used for "Source" if applicable
    contactpointer: string;
    whatAppcontact?: string;

    // Fields derived/added for Hi-Precision template based on image
    source?: string; // e.g., "ETIGA LIFE & GENERAL ASSURANCE PHILS-HS-SENIOR"
    clinicianName?: string; // e.g., "ANUNCIACION, REY CAESAR R. M.D."
}

interface Validator {
    username: string;
    employeeid: number;
    role: string;
    licenseNumber?: string; // e.g., "0103740"
    signatureUrl?: string; // URL to an image of the signature
}

interface DrugItem {
    ascensionid: number;
    id: number;
    sensitivity: string; // e.g., "Resistant", "Sensitive"
    drug: string; // Name of the antibiotic
}

interface ReportData {
    resultsettings: ResultSettings;
    records: RecordItem[];
    companyInfo: CompanyInfo;
    patientInformation: PatientInformation;
    comments: string | null; // HTML string for interpretations/comments
    testname: string; // e.g., "Culture & Sensitivity - Pus" or "COMPLETE BLOOD COUNT"
    validators: Validator[];
    hasDrugs: boolean;
    patientid: number;
    billingid: number; // Can be used as Lab Number
    lastupdatedon: string; // Date of last update/report printing
    logourl: string; // URL for the company logo
    enteredOn: string; // Date results were entered/sample received
    resultentry: string; // Name of person who entered results
    literatureReview: string | null;
    drugList?: DrugItem[];

    // Hi-Precision specific fields (from image)
    dispatchTime?: string; // e.g., "ONLINE RESULT"
    pageInfo?: string; // e.g., "1 of 2"
}

// --- Helper Functions ---
const formatDate = (dateString: string | undefined, includeTime = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if not a valid date string

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        let timeStr = '';
        if (includeTime) {
            const hr = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            timeStr = ` ${hr}:${min}`;
        }
        return `${month}-${day}-${year}${timeStr}`; // Format: MM-DD-YYYY HH:MM
    } catch (e) { return dateString; }
};

const formatTimeOnly = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) { return dateString; }
};

const getPatientFullNameHP = (patientInfo: PatientInformation): string => {
    return `${patientInfo.lastname}, ${patientInfo.firstname} ${patientInfo.middlename || ''}`.toUpperCase().trim();
};

const groupRecordsByCategory = (records: RecordItem[]): Record<string, { name: string, items: RecordItem[] }> => {
    const grouped = records.reduce((acc, record) => {
        // Use record.category for grouping, fallback to 'General' or testname
        const categoryKey = record.category || 'Uncategorized';
        if (!acc[categoryKey]) {
            acc[categoryKey] = { name: record.category || 'General Results', items: [] };
        }
        acc[categoryKey].items.push(record);
        return acc;
    }, {} as Record<string, { name: string, items: RecordItem[] }>);

    // Sort items within each category by 'ordering'
    for (const key in grouped) {
        grouped[key].items.sort((a, b) => a.ordering - b.ordering);
    }
    return grouped;
};


// --- Styles (Basic inline styles for demonstration) ---
const hpStyles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: 'Arial, sans-serif', fontSize: '9pt', margin: '20px auto', border: '1px solid #ccc', padding: '15mm', width: '210mm', minHeight: '297mm', boxSizing: 'border-box', backgroundColor: 'white' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '10px' },
    logo: { width: 'auto', height: '50px', maxHeight: '60px' },
    companyInfo: { textAlign: 'center', flexGrow: 1, color: '#007bff' },
    companyName: { fontSize: '16pt', fontWeight: 'bold' },
    companyAddress: { fontSize: '8pt', color: 'black' },
    patientInfoSection: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', fontSize: '9pt' },
    patientInfoCol: { width: '49%' },
    infoPair: { display: 'flex', marginBottom: '2px', lineHeight: '1.4' },
    infoLabel: { fontWeight: 'bold', width: '110px', marginRight: '5px', flexShrink: 0 },
    infoValue: { flexGrow: 1 },
    resultsTable: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '9pt' },
    resultsTh: { border: '1px solid #999', padding: '5px', backgroundColor: '#e9ecef', textAlign: 'center', fontWeight: 'bold' },
    resultsTd: { border: '1px solid #999', padding: '5px', textAlign: 'left', verticalAlign: 'top' },
    resultsTdCenter: { border: '1px solid #999', padding: '5px', textAlign: 'center', verticalAlign: 'top' },
    categoryHeader: { fontWeight: 'bold', fontSize: '10pt', paddingTop: '10px', paddingBottom: '5px', textDecoration: 'underline', color: '#333' },
    footer: { marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-around', fontSize: '8pt' },
    signatureBlock: { textAlign: 'center', width: '30%' },
    signatureLine: { borderTop: '1px solid black', minHeight: '30px', marginTop: '10px', marginBottom: '5px' },
    pageFooterText: { marginTop: '20px', textAlign: 'center', fontSize: '7pt', borderTop: '1px solid #ccc', paddingTop: '5px', color: '#555' },
    outOfRange: { fontWeight: 'bold', color: 'red' },
    drugTable: { width: '70%', borderCollapse: 'collapse', fontSize: '9pt', marginTop: '10px', marginLeft: 'auto', marginRight: 'auto' },
    drugTh: { border: '1px solid #bbb', padding: '4px', backgroundColor: '#f8f9fa', textAlign: 'left' },
    drugTd: { border: '1px solid #bbb', padding: '4px' },
};

// --- React Component Template ---
const HiPrecisionTemplate: React.FC<{ data: ReportData }> = () => {
    const { companyInfo, patientInformation, records, testname, validators, billingid, enteredOn, lastupdatedon, logourl, dispatchTime, pageInfo, comments, hasDrugs, drugList } = PrintOutdata
    const groupedRecords = groupRecordsByCategory(records);

    const medTech = validators.find(v => v.role.toLowerCase().includes('medical technologist') || v.role.toLowerCase().includes('hm'));
    const pathologist = validators.find(v => v.role.toLowerCase().includes('pathologist'));

    return (
        <div style={hpStyles.page}>
            <header style={hpStyles.header}>
                <img src={logourl || "https://via.placeholder.com/100x50.png?text=Logo"} alt="Lab Logo" style={hpStyles.logo} />
                <div style={hpStyles.companyInfo}>
                    <div style={hpStyles.companyName}>{companyInfo.name.toUpperCase()}</div>
                    <div style={hpStyles.companyAddress}>{companyInfo.address}</div>
                    <div style={hpStyles.companyAddress}>Tel. No.: {companyInfo.phonenumber} {companyInfo.alternativenumber ? `/ ${companyInfo.alternativenumber}` : ''}</div>
                </div>
                <div style={{ width: '100px' }}> {/* Spacer for balance, or for QR code if any */} </div>
            </header>

            <section style={hpStyles.patientInfoSection}>
                <div style={hpStyles.patientInfoCol}>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Name</span>: <span style={hpStyles.infoValue}>{getPatientFullNameHP(patientInformation)}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>PID</span>: <span style={hpStyles.infoValue}>{patientInformation.fullpatientid || 'N/A'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Age/Sex</span>: <span style={hpStyles.infoValue}>{patientInformation.age} {patientInformation.agetype} / {patientInformation.gender.toUpperCase()}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Source</span>: <span style={hpStyles.infoValue}>{patientInformation.source || patientInformation.organization || 'N/A'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Clinician</span>: <span style={hpStyles.infoValue}>{patientInformation.clinicianName || 'N/A'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Date Requested</span>: <span style={hpStyles.infoValue}>{formatDate(patientInformation.date, true) || 'N/A'}</span></div>
                </div>
                <div style={hpStyles.patientInfoCol}>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Lab. Number</span>: <span style={hpStyles.infoValue}>{String(billingid) || 'N/A'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Birthdate</span>: <span style={hpStyles.infoValue}>{formatDate(patientInformation.dob)}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Dispatch</span>: <span style={hpStyles.infoValue}>{dispatchTime || 'N/A'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Page</span>: <span style={hpStyles.infoValue}>{pageInfo || '1 of 1'}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Received</span>: <span style={hpStyles.infoValue}>{formatDate(enteredOn, false)} {formatTimeOnly(enteredOn)}</span></div>
                    <div style={hpStyles.infoPair}><span style={hpStyles.infoLabel}>Printed</span>: <span style={hpStyles.infoValue}>{formatDate(lastupdatedon, false)} {formatTimeOnly(lastupdatedon)}</span></div>
                </div>
            </section>

            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', margin: '10px 0', textDecoration: 'underline' }}>
                {testname.toUpperCase()}
            </div>

            <table style={hpStyles.resultsTable}>
                <thead>
                    <tr>
                        <th style={{ ...hpStyles.resultsTh, width: '35%' }}>TEST</th>
                        <th style={{ ...hpStyles.resultsTh, width: '15%' }}>Result (SI Unit)</th>
                        <th style={{ ...hpStyles.resultsTh, width: '20%' }}>Reference Interval</th>
                        <th style={{ ...hpStyles.resultsTh, width: '15%' }}>Result (Conv. Unit)</th>
                        <th style={{ ...hpStyles.resultsTh, width: '15%' }}>Units (Conv.)</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedRecords).map(([key, group]) => (
                        <React.Fragment key={key}>
                            <tr>
                                <td colSpan={5} style={{ ...hpStyles.resultsTd, ...hpStyles.categoryHeader }}>{group.name.toUpperCase()}</td>
                            </tr>
                            {group.items.map(record => {
                                const isNumeric = record.lowerlimit || record.upperlimit;
                                let isOutOfRange = false;
                                if (isNumeric && record.value) {
                                    const val = parseFloat(record.value);
                                    const low = parseFloat(record.lowerlimit);
                                    const up = parseFloat(record.upperlimit);
                                    if (!isNaN(val) && ((!isNaN(low) && val < low) || (!isNaN(up) && val > up))) {
                                        isOutOfRange = true;
                                    }
                                }
                                const resultStyle = isOutOfRange ? { ...hpStyles.resultsTdCenter, ...hpStyles.outOfRange } : hpStyles.resultsTdCenter;

                                return (
                                    <tr key={record.id}>
                                        <td style={hpStyles.resultsTd}>{record.name}</td>
                                        {isNumeric ? (
                                            <>
                                                <td style={resultStyle}>{record.value}</td>
                                                <td style={hpStyles.resultsTdCenter}>{record.lowerlimit && record.upperlimit ? `${record.lowerlimit} - ${record.upperlimit}` : record.textReference || ''}</td>
                                                <td style={hpStyles.resultsTdCenter}> {/* Conv. Result - Placeholder */} </td>
                                                <td style={hpStyles.resultsTdCenter}>{record.units}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ ...hpStyles.resultsTd, ...resultStyle }} colSpan={2}>{record.value}</td>
                                                <td style={hpStyles.resultsTdCenter}> {/* Conv. Result - Placeholder */} </td>
                                                <td style={hpStyles.resultsTdCenter}>{record.units}</td>
                                            </>

                                        )}
                                    </tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {hasDrugs && drugList && drugList.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ ...hpStyles.categoryHeader, textAlign: 'center', marginBottom: '10px' }}>
                        ANTIBIOTIC SENSITIVITY PATTERN
                    </div>
                    <table style={hpStyles.drugTable}>
                        <thead>
                            <tr>
                                <th style={hpStyles.drugTh}>Antibiotic</th>
                                <th style={{ ...hpStyles.drugTh, textAlign: 'center' }}>Sensitivity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drugList.map(drug => (
                                <tr key={drug.id}>
                                    <td style={hpStyles.drugTd}>{drug.drug}</td>
                                    <td style={{ ...hpStyles.drugTd, textAlign: 'center' }}>{drug.sensitivity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {comments && (
                <div style={{ marginTop: '20px', fontSize: '9pt', border: '1px solid #eee', padding: '10px' }}>
                    <strong style={{ textDecoration: 'underline' }}>Interpretation/Comments:</strong>
                    <div style={{ paddingTop: '5px' }} dangerouslySetInnerHTML={{ __html: comments }} />
                </div>
            )}

            <footer style={hpStyles.footer}>
                <div style={hpStyles.signatureBlock}>
                    {/* Signature image can be placed here if URL available */}
                    <div style={hpStyles.signatureLine}></div>
                    <div>{medTech?.username || 'N/A'}</div>
                    <div>Lic. #{medTech?.licenseNumber || 'N/A'}</div>
                    <div>MEDICAL TECHNOLOGIST</div>
                </div>
                <div style={{ ...hpStyles.signatureBlock, alignSelf: 'center', fontWeight: 'bold', color: '#555' }}>
                    SYSTEM VALIDATED
                </div>
                <div style={hpStyles.signatureBlock}>
                    {/* Signature image can be placed here if URL available */}
                    <div style={hpStyles.signatureLine}></div>
                    <div>{pathologist?.username || 'N/A'}</div>
                    <div>Lic. #{pathologist?.licenseNumber || 'N/A'}</div>
                    <div>PATHOLOGIST</div>
                </div>
            </footer>
            <div style={hpStyles.pageFooterText}>
                ** Report Electronically Signed Out ** QUALITY CONTROL ** PATHOLOGIST ** HPD
            </div>
        </div>
    );
};

export default HiPrecisionTemplate;