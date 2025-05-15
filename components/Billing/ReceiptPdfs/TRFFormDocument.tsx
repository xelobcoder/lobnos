import React from 'react';

const splitIntoColumns = (arr, columns) => {
    const chunkSize = Math.ceil(arr.length / columns);
    return Array.from({ length: columns }, (_, i) =>
        arr.slice(i * chunkSize, (i + 1) * chunkSize)
    );
};

const specimenTypes = [
    "Ambient",
    "Bone Marrow",
    "Plasma: EDTA/FL/CIT/ACD",
    "FN Aspirate*",
    "Fluid*",
    "Blood Clot",
    "Tissue-Large*",
    "BAL",
    "W.Blood ACD",
    "Tissue-Small*",
    "Sputum",
    "W.Blood EDTA",
    "Paraffin Block*",
    "Urine",
    "W.Blood Fluoride",
    "Smear",
    "Stool",
    "W.Blood Heparin",
    "Slide (H&E)",
    "Swab*",
    "W.Blood Sodium Citrate",
    "Pus",
    "Filter Paper",
    "Others*",
];
const specimenColumns = splitIntoColumns(specimenTypes, 3);

const patientInfo = {
    id: "2",
    name: "BORONSON TIIFU",
    address: "Kalpohin, Lowcost 30A Tamale",
    email: "boronson@gmail.com",
    phone: "241758550",
    dob: "06/11/1995",
    age: "27 years",
    gender: "Female",
    height: "Cm",
    weight: "Kg",
};

const testRequirements = [
    { code: "", description: "Anterior Resection" },
    { code: "", description: "Anterior Resection" },
];

const billingInfo = {
    billTo: "DIRECT",
    clientCode: "None",
    dueAmount: "I 1.0",
    mode: "CASH",
};

const referringDoctor = {
    name: "SELF",
    phone: "",
    email: "-",
    accountNumber: "",
};

const specimenInfo = {
    receivedFrom: "DIRECT",
    billId: "39",
    orderNumber: "12347",
    dateDrawn: "12/02/2025",
    timeDrawn: "09:50 PM",
    collectedAt: "DIRECT",
    sampleId: "39",
};

const receivedInLab = {
    date: "12/02/2025",
    time: "09:50 PM",
    outsourceName: "",
};

const temperatureSent = {
    frozen: false,
    cold: true,
    ambient: false,
};

const temperatureReceived = {
    frozen: false,
    cold: true,
    ambient: false,
};

const repeatFollowUp = {
    oldAccessionNo: "",
    provisionalDiagnosis: "",
    historyOfMedication: "Yes / No",
    ifYesName: "",
    statusOfMedication: "Ongoing / Terminated",
    duration: "",
    terminatedWhen: "",
    lmp: "",
    fastingPeriod: "",
    urineVolume: "",
    histopathHistory: "",
    otherInfo: "",
};

const styles = {
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: "Helvetica, Arial, sans-serif",
        backgroundColor: "#fff",
        maxWidth: '100%',
        boxSizing: 'border-box'
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        marginBottom: 15,
        color: "#2c3e50",
    },
    section: {
        marginBottom: 12,
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 4,
    },
    sectionHeader: {
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 12,
        marginBottom: 8,
        borderBottom: "1px solid #ddd",
        paddingBottom: 4,
        color: "#34495e",
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 4,
    },
    label: {
        width: "40%",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        color: "#555",
    },
    value: {
        width: "60%",
        color: "#333",
    },
    twoColumn: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: '4%'
    },
    half: {
        width: "48%",
        padding: 8,
        border: "1px solid #ddd",
        borderRadius: 4,
    },
    table: {
        border: "1px solid #ddd",
        borderRadius: 4,
        marginBottom: 10,
    },
    tableHeader: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f7f7f7",
        borderBottom: "1px solid #ddd",
        padding: 6,
    },
    tableRow: {
        display: "flex",
        flexDirection: "row",
        borderBottom: "1px solid #eee",
        padding: 6,
    },
    tableCell: {
        flex: 1,
        padding: 2,
        color: "#333",
    },
    tableCellRight: {
        flex: 1,
        padding: 2,
        textAlign: "right",
        color: "#333",
    },
    specimenContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    specimenColumn: {
        width: "30%",
    },
    specimenItem: {
        fontSize: 9,
        marginBottom: 2,
    },
    note: {
        fontSize: 9,
        fontStyle: "italic",
        marginTop: 5,
    },
    signatureRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        margin: "10px 0",
    },
    centered: {
        textAlign: "center",
    },
};

// Helper function to check if a value is empty or placeholder
const isRelevant = (value) => {
    return value && value.trim() !== "" && value !== "-" && value !== "None";
};

export default function TRFFormDocument() {
    return (
        <div style={styles.page}>
            <div>
                <h1 style={styles.title}>Test Requisition Form</h1>
            </div>

            {/* Patient Information */}
            <div style={styles.twoColumn}>
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Patient Information</div>
                    {isRelevant(patientInfo.id) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Patient's ID:</div>
                            <div style={styles.value}>{patientInfo.id}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.name) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Name:</div>
                            <div style={styles.value}>{patientInfo.name}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.address) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Address:</div>
                            <div style={styles.value}>{patientInfo.address}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.email) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Email:</div>
                            <div style={styles.value}>{patientInfo.email}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.phone) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Phone:</div>
                            <div style={styles.value}>{patientInfo.phone}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.dob) && (
                        <div style={styles.row}>
                            <div style={styles.label}>DOB:</div>
                            <div style={styles.value}>{patientInfo.dob}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.age) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Age:</div>
                            <div style={styles.value}>{patientInfo.age}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.gender) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Gender:</div>
                            <div style={styles.value}>{patientInfo.gender}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.height) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Height:</div>
                            <div style={styles.value}>{patientInfo.height}</div>
                        </div>
                    )}
                    {isRelevant(patientInfo.weight) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Weight:</div>
                            <div style={styles.value}>{patientInfo.weight}</div>
                        </div>
                    )}
                </div>

                {/* Test Requirements */}
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Test Requirements</div>
                    <div style={styles.table}>
                        <div style={styles.tableHeader}>
                            <div style={[styles.tableCell, { flex: 0.3 }]}>Test Code</div>
                            <div style={[styles.tableCell, { flex: 0.7 }]}>Test Description</div>
                        </div>
                        {testRequirements.map((req, index) => (
                            <div style={styles.tableRow} key={index}>
                                <div style={[styles.tableCell, { flex: 0.3 }]}>{req.code}</div>
                                <div style={[styles.tableCell, { flex: 0.7 }]}>{req.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Billing & Referring Doctor */}
            <div style={styles.twoColumn}>
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Billing Information</div>
                    {isRelevant(billingInfo.billTo) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Bill To:</div>
                            <div style={styles.value}>{billingInfo.billTo}</div>
                        </div>
                    )}
                    {isRelevant(billingInfo.clientCode) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Client Code:</div>
                            <div style={styles.value}>{billingInfo.clientCode}</div>
                        </div>
                    )}
                    {isRelevant(billingInfo.dueAmount) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Due Amount:</div>
                            <div style={styles.value}>{billingInfo.dueAmount}</div>
                        </div>
                    )}
                    {isRelevant(billingInfo.mode) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Mode:</div>
                            <div style={styles.value}>{billingInfo.mode}</div>
                        </div>
                    )}
                </div>
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Referring Doctor</div>
                    {isRelevant(referringDoctor.name) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Name:</div>
                            <div style={styles.value}>{referringDoctor.name}</div>
                        </div>
                    )}
                    {isRelevant(referringDoctor.phone) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Phone:</div>
                            <div style={styles.value}>{referringDoctor.phone}</div>
                        </div>
                    )}
                    {isRelevant(referringDoctor.email) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Email:</div>
                            <div style={styles.value}>{referringDoctor.email}</div>
                        </div>
                    )}
                    {isRelevant(referringDoctor.accountNumber) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Account No.:</div>
                            <div style={styles.value}>{referringDoctor.accountNumber}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Specimen & Lab Reception */}
            <div style={styles.twoColumn}>
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Specimen Information</div>
                    {isRelevant(specimenInfo.receivedFrom) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Received From:</div>
                            <div style={styles.value}>{specimenInfo.receivedFrom}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.billId) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Bill ID:</div>
                            <div style={styles.value}>{specimenInfo.billId}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.orderNumber) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Order/Lab Ref. No.:</div>
                            <div style={styles.value}>{specimenInfo.orderNumber}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.dateDrawn) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Date Drawn:</div>
                            <div style={styles.value}>{specimenInfo.dateDrawn}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.timeDrawn) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Time Drawn:</div>
                            <div style={styles.value}>{specimenInfo.timeDrawn}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.collectedAt) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Collected At:</div>
                            <div style={styles.value}>{specimenInfo.collectedAt}</div>
                        </div>
                    )}
                    {isRelevant(specimenInfo.sampleId) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Sample ID:</div>
                            <div style={styles.value}>{specimenInfo.sampleId}</div>
                        </div>
                    )}
                </div>
                <div style={styles.half}>
                    <div style={styles.sectionHeader}>Received in Lab</div>
                    {isRelevant(receivedInLab.date) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Date:</div>
                            <div style={styles.value}>{receivedInLab.date}</div>
                        </div>
                    )}
                    {isRelevant(receivedInLab.time) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Time:</div>
                            <div style={styles.value}>{receivedInLab.time}</div>
                        </div>
                    )}
                    {isRelevant(receivedInLab.outsourceName) && (
                        <div style={styles.row}>
                            <div style={styles.label}>Outsource Name:</div>
                            <div style={styles.value}>{receivedInLab.outsourceName}</div>
                        </div>
                    )}
                    <div style={styles.sectionHeader}>Temperature (Sent)</div>
                    <div style={styles.value}>
                        {temperatureSent.frozen ? "[x]" : "[ ]"} Frozen (&lt;-10°C)
                    </div>
                    <div style={styles.value}>
                        {temperatureSent.cold ? "[x]" : "[ ]"} Cold (2-8°C)
                    </div>
                    <div style={styles.value}>
                        {temperatureSent.ambient ? "[x]" : "[ ]"} Ambient
                    </div>
                    <div style={styles.sectionHeader}>Temperature (Received)</div>
                    <div style={styles.value}>
                        {temperatureReceived.frozen ? "[x]" : "[ ]"} Frozen (&lt;-10°C)
                    </div>
                    <div style={styles.value}>
                        {temperatureReceived.cold ? "[x]" : "[ ]"} Cold (2-8°C)
                    </div>
                    <div style={styles.value}>
                        {temperatureReceived.ambient ? "[x]" : "[ ]"} Ambient
                    </div>
                </div>
            </div>

            {/* Specimen Type */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>Specimen Type</div>
                <div style={styles.specimenContainer}>
                    {specimenColumns.map((col, colIndex) => (
                        <div key={colIndex} style={styles.specimenColumn}>
                            {col.map((type, typeIndex) => (
                                <div key={typeIndex} style={styles.specimenItem}>
                                    [ ] {type}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* For Repeat / Follow-Up Patients */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>For Repeat / Follow-Up Patients</div>
                {isRelevant(repeatFollowUp.oldAccessionNo) && (
                    <div style={styles.row}>
                        <div style={styles.label}>Old Accession No.:</div>
                        <div style={styles.value}>{repeatFollowUp.oldAccessionNo}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.provisionalDiagnosis) && (
                    <div style={styles.row}>
                        <div style={styles.label}>1) Provisional Diagnosis:</div>
                        <div style={styles.value}>{repeatFollowUp.provisionalDiagnosis}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.historyOfMedication) && (
                    <div style={styles.row}>
                        <div style={styles.label}>2) H/o Medication:</div>
                        <div style={styles.value}>{repeatFollowUp.historyOfMedication}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.ifYesName) && (
                    <div style={styles.row}>
                        <div style={styles.label}>3) If Yes, Name:</div>
                        <div style={styles.value}>{repeatFollowUp.ifYesName}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.statusOfMedication) && (
                    <div style={styles.row}>
                        <div style={styles.label}>4) Status of Medication:</div>
                        <div style={styles.value}>{repeatFollowUp.statusOfMedication}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.duration) && (
                    <div style={styles.row}>
                        <div style={styles.label}>5) If ongoing, Duration:</div>
                        <div style={styles.value}>{repeatFollowUp.duration}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.terminatedWhen) && (
                    <div style={styles.row}>
                        <div style={styles.label}>6) If terminated, When:</div>
                        <div style={styles.value}>{repeatFollowUp.terminatedWhen}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.lmp) && (
                    <div style={styles.row}>
                        <div style={styles.label}>7) LMP (if applicable):</div>
                        <div style={styles.value}>{repeatFollowUp.lmp}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.fastingPeriod) && (
                    <div style={styles.row}>
                        <div style={styles.label}>8) Fasting Period:</div>
                        <div style={styles.value}>{repeatFollowUp.fastingPeriod}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.urineVolume) && (
                    <div style={styles.row}>
                        <div style={styles.label}>9) 24 hr Urine Volume:</div>
                        <div style={styles.value}>{repeatFollowUp.urineVolume}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.histopathHistory) && (
                    <div style={styles.row}>
                        <div style={styles.label}>10) Histopath History:</div>
                        <div style={styles.value}>{repeatFollowUp.histopathHistory}</div>
                    </div>
                )}
                {isRelevant(repeatFollowUp.otherInfo) && (
                    <div style={styles.row}>
                        <div style={styles.label}>11) Other Info:</div>
                        <div style={styles.value}>{repeatFollowUp.otherInfo}</div>
                    </div>
                )}
            </div>

            {/* Please Note */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>Please Note</div>
                <div style={styles.note}>
                    After completion of the ordered tests, the remaining sample may be stored and used for research in medical sciences.
                    "I / We consent to receive information or be contacted through mail, telecommunication, electronic & personal means from leonides, time to time."
                </div>
                <div style={styles.note}>[ ] I don't agree</div>
            </div>

            {/* Signature Section */}
            <div style={styles.section}>
                <div style={styles.signatureRow}>
                    <div style={styles.label}>Signature of Requisitioner / Patient:</div>
                    <div style={styles.value}>_____________________</div>
                </div>
                <div style={styles.signatureRow}>
                    <div style={styles.label}>Date:</div>
                    <div style={styles.value}>_____________________</div>
                </div>
            </div>

            {/* Important Note */}
            <div style={styles.section}>
                <div style={[styles.sectionHeader, styles.centered]}>
                    Important: All requested information is mandatory for accurate and timely reporting.
                </div>
            </div>
        </div>
    );
}