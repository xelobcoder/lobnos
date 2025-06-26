import React from 'react';
import { PrintOutdata } from '../1/data';

// --- TypeScript Interfaces ---
interface ResultSettings { /* ... */ }
interface RecordItem {
    id: number; testid: number; name: string; field: string; value: string; hasunits: number; units: string;
    plan: string; ordering: number; textReference: string; upperlimit: string; lowerlimit: string;
    category: string | null; options: string; undercategory: number; categoryid: number | null;
    ascensionid: number; billingid: number; patientid: number; originalvalue: string;
    created_on: string; updated_on: string; employeeid: number; entrymode: string; fieldid: number;
}
interface CompanyInfo { /* ... */ }
interface PatientInformation {
    patientid: number; fullpatientid: string; designation: string; firstname: string; email: string;
    dob: string; age: number; gender: string; marital_status: string; mobile_number: string;
    agetype: string; occupation: string; date: string; activation_status: string;
    lastname: string; middlename?: string; organization?: string; // Could be MedFondse
    contactpointer: string; whatAppcontact?: string;
    referringDoctor?: string;
}
interface Validator { username: string; employeeid: number; role: string; }
interface DrugItem { id: number; drug: string; sensitivity: string; }
interface ReportData {
    resultsettings: ResultSettings; records: RecordItem[]; companyInfo: CompanyInfo;
    patientInformation: PatientInformation; comments: string | null; testname: string;
    validators: Validator[]; hasDrugs: boolean; patientid: number; billingid: number;
    lastupdatedon: string; logourl: string; enteredOn: string; resultentry: string;
    literatureReview: string | null; drugList?: DrugItem[];

    // Lancet specific fields (map from existing JSON or add new if available)
    labVerw?: string; // Lab Reference (e.g., from billingid)
    verwysNr?: string; // Referring Doctor No.
    ontvangsDatum?: string; // Received Date (e.g., from enteredOn)
    verslagDatum?: string; // Report Date (e.g., from lastupdatedon)
    medFondse?: string; // Medical Aid (e.g., from patientInformation.organization)
    clinicalData?: string; // Clinical information text
    anderDokters?: string; // Other doctors
}

// --- Helper Functions ---
const formatDateSimpleLancet = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    } catch (e) { return dateString; }
};
const getPatientFullNameLancet = (patientInfo: PatientInformation): string => {
    return `${patientInfo.firstname} ${patientInfo.lastname}`.trim();
};
const groupRecordsByCategoryLancet = (records: RecordItem[]): Record<string, RecordItem[]> => {
    const grouped = records.reduce((acc, record) => {
        const category = record.category || 'General Results';
        if (!acc[category]) acc[category] = [];
        acc[category].push(record);
        return acc;
    }, {} as Record<string, RecordItem[]>);
    for (const key in grouped) {
        grouped[key].sort((a, b) => a.ordering - b.ordering);
    }
    return grouped;
};

// --- Styles ---
const lancetStyles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: 'Arial, sans-serif', fontSize: '10pt', margin: '0 auto', padding: '0', backgroundColor: '#fff', maxWidth: '600px' },
    headerBar: { backgroundColor: '#005629', color: 'white', padding: '12px 15px', display: 'flex', alignItems: 'center' },
    headerTitle: { fontSize: '14pt', fontWeight: 'bold', marginLeft: '10px' },
    reportContainer: { padding: '15px' },
    reportHeader: { textAlign: 'center', padding: '10px 0' },
    labLogo: { maxHeight: '40px', marginBottom: '10px' },
    reportMainTitle: { fontSize: '16pt', fontWeight: 'bold', color: '#005629', borderBottom: '2px solid #005629', paddingBottom: '5px', marginBottom: '15px' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 15px', fontSize: '9pt', marginBottom: '15px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' },
    infoItem: { display: 'flex', alignItems: 'baseline' },
    infoLabel: { fontWeight: 'normal', color: '#444', marginRight: '5px', minWidth: '100px', flexShrink: 0 },
    infoValue: { fontWeight: 'bold', color: '#111' },
    sectionTitle: { fontSize: '13pt', fontWeight: 'bold', color: '#005629', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #005629', paddingBottom: '4px' },
    resultItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 2px', borderBottom: '1px solid #f0f0f0', fontSize: '9pt' },
    resultName: { flex: 3, color: '#333' },
    resultValCont: { flex: 1.5, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
    resultFlag: { color: 'red', fontWeight: 'bold', marginRight: '3px', fontSize: '8pt' },
    resultValue: { fontWeight: 'bold', color: '#000' },
    resultUnits: { flex: 0.7, textAlign: 'left', paddingLeft: '8px', color: '#555', fontSize: '8.5pt' },
    resultRef: { flex: 1.5, textAlign: 'right', color: '#555', fontSize: '8.5pt' },
    outOfRangeValue: { color: 'red', fontWeight: 'bold' },
    commentsSection: { marginTop: '20px', padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '9pt' },
    footer: { marginTop: '30px', textAlign: 'center', fontSize: '8pt', color: '#666', padding: '10px', borderTop: '1px solid #eee' },
    drugTable: { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginTop: '10px' },
    drugTh: { borderBottom: '1px solid #ccc', padding: '5px', backgroundColor: '#f0f0f0', textAlign: 'left', fontWeight: 'bold' },
    drugTd: { borderBottom: '1px solid #eee', padding: '5px' },
};

// --- React Component Template ---
const LancetTemplate: React.FC<{ data: ReportData }> = () => {
    const data =PrintOutdata
    const { companyInfo, patientInformation, records, testname, comments, logourl, billingid, enteredOn, lastupdatedon, hasDrugs, drugList } =data
    const groupedRecords = groupRecordsByCategoryLancet(records);

    const labVerw = data.labVerw || String(billingid);
    const verwysNr = data.verwysNr || 'N/A';
    const ontvangsDatum = data.ontvangsDatum || formatDateSimpleLancet(enteredOn);
    const verslagDatum = data.verslagDatum || formatDateSimpleLancet(lastupdatedon);
    const medFondse = data.medFondse || patientInformation.organization || 'N/A';
    const clinicalData = data.clinicalData || (testname.toLowerCase().includes('culture') ? 'Culture & Sensitivity as requested.' : 'Routine Test');

    return (
        <div style={lancetStyles.page}>
            <div style={lancetStyles.headerBar}>
                {/* Icon for back arrow could be here */}
                <span style={lancetStyles.headerTitle}>Tests</span>
            </div>

            <div style={lancetStyles.reportContainer}>
                <div style={lancetStyles.reportHeader}>
                    <img src={logourl || "https://via.placeholder.com/150x40.png?text=Lancet+Logo"} alt="Lancet Logo" style={lancetStyles.labLogo} />
                    <div style={lancetStyles.reportMainTitle}>PATHOLOGY RESULT</div>
                </div>

                <div style={lancetStyles.infoGrid}>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Naam:</span> <span style={lancetStyles.infoValue}>{getPatientFullNameLancet(patientInformation)}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Lab Naam:</span> <span style={lancetStyles.infoValue}>{companyInfo.name}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Lab Verw:</span> <span style={lancetStyles.infoValue}>{labVerw}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Verwys Nr:</span> <span style={lancetStyles.infoValue}>{verwysNr}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Geslag:</span> <span style={lancetStyles.infoValue}>{patientInformation.gender}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Ontvangs Datum:</span> <span style={lancetStyles.infoValue}>{ontvangsDatum}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Geb Datum:</span> <span style={lancetStyles.infoValue}>{formatDateSimpleLancet(patientInformation.dob)}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Verslag Datum:</span> <span style={lancetStyles.infoValue}>{verslagDatum}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Kontak Nrs:</span> <span style={lancetStyles.infoValue}>{patientInformation.mobile_number}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Med Fondse:</span> <span style={lancetStyles.infoValue}>{medFondse}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Epos:</span> <span style={lancetStyles.infoValue}>{patientInformation.email || 'N/A'}</span></div>
                    <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Verwys Dr:</span> <span style={lancetStyles.infoValue}>{patientInformation.referringDoctor || 'N/A'}</span></div>
                    {data.anderDokters && <div style={lancetStyles.infoItem}><span style={lancetStyles.infoLabel}>Ander Dokters:</span> <span style={lancetStyles.infoValue}>{data.anderDokters}</span></div>}
                </div>

                {clinicalData && (
                    <>
                        <div style={lancetStyles.sectionTitle}>Clinical Data</div>
                        <div style={{ fontSize: '9pt', padding: '0 5px 10px 5px', color: '#333' }}>{clinicalData}</div>
                    </>
                )}

                {Object.entries(groupedRecords).map(([category, categoryRecords]) => (
                    <div key={category}>
                        <div style={lancetStyles.sectionTitle}>{category.toUpperCase()}</div>
                        {categoryRecords.map(record => {
                            const isNumeric = record.lowerlimit || record.upperlimit;
                            let flag = '';
                            let valueStyle = lancetStyles.resultValue;
                            if (isNumeric && record.value) {
                                const val = parseFloat(record.value);
                                const low = parseFloat(record.lowerlimit);
                                const up = parseFloat(record.upperlimit);
                                if (!isNaN(val)) {
                                    if (!isNaN(low) && val < low) flag = 'L';
                                    if (!isNaN(up) && val > up) flag = 'H';
                                }
                                if (flag) valueStyle = { ...valueStyle, ...lancetStyles.outOfRangeValue };
                            }

                            return (
                                <div style={lancetStyles.resultItem} key={record.id}>
                                    <span style={lancetStyles.resultName}>{record.name}</span>
                                    <span style={lancetStyles.resultValCont}>
                                        {flag && <span style={lancetStyles.resultFlag}>{flag}</span>}
                                        <span style={valueStyle}>{record.value}</span>
                                    </span>
                                    <span style={lancetStyles.resultUnits}>{record.units}</span>
                                    <span style={lancetStyles.resultRef}>
                                        {record.lowerlimit && record.upperlimit ? `${record.lowerlimit} - ${record.upperlimit}` : record.textReference || ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {hasDrugs && drugList && drugList.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={lancetStyles.sectionTitle}>ANTIBIOTIC SENSITIVITY</div>
                        <table style={lancetStyles.drugTable}>
                            <thead>
                                <tr>
                                    <th style={lancetStyles.drugTh}>Antibiotic</th>
                                    <th style={{ ...lancetStyles.drugTh, textAlign: 'center' }}>Sensitivity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drugList.map(drug => (
                                    <tr key={drug.id}>
                                        <td style={lancetStyles.drugTd}>{drug.drug}</td>
                                        <td style={{ ...lancetStyles.drugTd, textAlign: 'center' }}>{drug.sensitivity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {comments && (
                    <div style={lancetStyles.commentsSection}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#005629' }}>Interpretive Comments:</div>
                        <div dangerouslySetInnerHTML={{ __html: comments }} />
                    </div>
                )}

                {data.literatureReview && (
                    <div style={lancetStyles.commentsSection}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#005629' }}>Literature Review:</div>
                        <div dangerouslySetInnerHTML={{ __html: data.literatureReview }} />
                    </div>
                )}

                <footer style={lancetStyles.footer}>
                    Key to Diagnostic Excellence. {companyInfo.website ? `Visit us at ${companyInfo.website}` : ''}
                    <div style={{ marginTop: '5px' }}>{companyInfo.motto}</div>
                </footer>
            </div>
        </div>
    );
};

export default LancetTemplate;