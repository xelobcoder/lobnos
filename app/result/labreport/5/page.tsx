import React from 'react';
import { PrintOutdata } from '../1/data'; // Assuming PrintOutdata structure

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
        <div className="container p-4 bg-white my-3" >
            <header className="d-flex justify-content-between ">
                <div>
                    <img src={data.companyInfo.logoUrl} alt="VitalScan Logo" style={{ width: '100px' }} />
                </div>
                <div className="">
                    <h3 className="text-uppercase text-decoration-underline fw-bold" >{data.companyInfo.name}</h3>
                    <p className="mb-0" style={{ fontSize: '12pt' }}>{data.companyInfo.location}</p>
                    <p className="mb-0" style={{ fontSize: '12pt' }}>{data.companyInfo.email}</p>
                    <p className="mb-0" style={{ fontSize: '12pt' }}>{data.companyInfo.contactUs}</p>
                </div>
                <div />
            </header>

            <section className='border-bottom border-dark my-3' >
                <h5 className='text-uppercase text-center border-bottom my-2 border-dark fw-bold'>Personal Information</h5>
                <div className="row gx-5">
                    <div className="col-6"><span className="fw-bold">FULL NAME:</span> {data.patientInformation.fullName}</div>
                    <div className="col-6"><span className="fw-bold">PATIENT ID:</span> {data.patientInformation.patientId}</div>
                    <div className="col-6"><span className="fw-bold">GENDER:</span> {data.patientInformation.gender}</div>
                    <div className="col-6"><span className="fw-bold">BILLING ID:</span> {data.patientInformation.billingId}</div>
                    <div className="col-6"><span className="fw-bold">AGE:</span> {data.patientInformation.age}</div>
                    <div className="col-6"><span className="fw-bold">REPORT DATE:</span> {data.patientInformation.reportDate}</div>
                </div>
            </section>

            <section>
                <h4 className="text-center fw-bold p-1 text-uppercase border-dark border-bottom" >
                    {data.testTitle}
                </h4>
                <table className="table">
                    <thead className='table-warning'>
                        <tr>
                            <th className="text-start">Parameter</th>
                            <th className="text-start">Value</th>
                            <th className="text-start">Units</th>
                            <th className="text-start">References</th>
                            <th className="text-start">Flags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.records.map(record => {
                            const flagToDisplay = record.flags || deriveFlag(record.value, record.references);
                            return (
                                <tr key={record.id}>
                                    <td>{record.parameter}</td>
                                    <td>{record.value}</td>
                                    <td>{record.units}</td>
                                    <td>{record.references}</td>
                                    <td>{flagToDisplay}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

       
            <section className="mt-3">
                <div className="fw-bold">Comments</div>
                <div style={{ borderBottom: '1px solid black', minHeight: '24px' }}>{data.comments}</div>
            </section>

            <section className="d-flex justify-content-between align-items-end mt-4">
                <div>
                    <div>VALIDATED BY: {data.validator?.name}</div>
                    <div className="mt-4">SIGNATURE: <span style={{ borderTop: '1px dotted black', paddingLeft: '150px' }}></span></div>
                </div>
                <div>
                    <img src={data.barcodeUrl} alt="Barcode" style={{ width: '200px', height: '50px' }} />
                </div>
            </section>

            <footer className="text-center mt-4" style={{ fontSize: '8pt' }}>
                <p className="fst-italic">{data.limitationInformation}</p>
                <p>{data.footerFinePrint}</p>
            </footer>
        </div>
    );
};

export default VitalScanTemplate;