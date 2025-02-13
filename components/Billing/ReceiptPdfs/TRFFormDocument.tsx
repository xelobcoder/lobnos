import {
    Document, Text, StyleSheet,
    Page, View
} from "@react-pdf/renderer";

// Helper: split an array into columns
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

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: "Helvetica",
        backgroundColor: "#fff",
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        marginBottom: 15,
        color: "#2c3e50",
    },
    section: {
        marginBottom: 12,
        padding: 10,
        border: "1 solid #ddd",
        borderRadius: 4,
    },
    sectionHeader: {
        fontFamily: "Helvetica-Bold",
        fontSize: 12,
        marginBottom: 8,
        borderBottom: "1 solid #ddd",
        paddingBottom: 4,
        color: "#34495e",
    },
    row: {
        flexDirection: "row",
        marginBottom: 4,
    },
    label: {
        width: "40%",
        fontFamily: "Helvetica-Bold",
        color: "#555",
    },
    value: {
        width: "60%",
        color: "#333",
    },
    twoColumn: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    half: {
        width: "48%",
        padding: 8,
        border: "1 solid #ddd",
        borderRadius: 4,
    },
    table: {
        border: "1 solid #ddd",
        borderRadius: 4,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f7f7f7",
        borderBottom: "1 solid #ddd",
        padding: 6,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1 solid #eee",
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
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    centered: {
        textAlign: "center",
    },
});

// Helper function to check if a value is empty or placeholder
const isRelevant = (value) => {
    return value && value.trim() !== "" && value !== "-" && value !== "None";
};

export default function TRFFormDocument() {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <Text style={styles.title}>Test Requisition Form</Text>
                </View>

                {/* Patient Information */}
                <View style={styles.twoColumn}>
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Patient Information</Text>
                        {isRelevant(patientInfo.id) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Patient's ID:</Text>
                                <Text style={styles.value}>{patientInfo.id}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.name) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>{patientInfo.name}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.address) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Address:</Text>
                                <Text style={styles.value}>{patientInfo.address}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.email) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{patientInfo.email}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.phone) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone:</Text>
                                <Text style={styles.value}>{patientInfo.phone}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.dob) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>DOB:</Text>
                                <Text style={styles.value}>{patientInfo.dob}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.age) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Age:</Text>
                                <Text style={styles.value}>{patientInfo.age}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.gender) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Gender:</Text>
                                <Text style={styles.value}>{patientInfo.gender}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.height) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Height:</Text>
                                <Text style={styles.value}>{patientInfo.height}</Text>
                            </View>
                        )}
                        {isRelevant(patientInfo.weight) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Weight:</Text>
                                <Text style={styles.value}>{patientInfo.weight}</Text>
                            </View>
                        )}
                    </View>

                    {/* Test Requirements */}
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Test Requirements</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCell, { flex: 0.3 }]}>Test Code</Text>
                                <Text style={[styles.tableCell, { flex: 0.7 }]}>Test Description</Text>
                            </View>
                            {testRequirements.map((req, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <Text style={[styles.tableCell, { flex: 0.3 }]}>{req.code}</Text>
                                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{req.description}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Billing & Referring Doctor */}
                <View style={styles.twoColumn}>
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Billing Information</Text>
                        {isRelevant(billingInfo.billTo) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Bill To:</Text>
                                <Text style={styles.value}>{billingInfo.billTo}</Text>
                            </View>
                        )}
                        {isRelevant(billingInfo.clientCode) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Client Code:</Text>
                                <Text style={styles.value}>{billingInfo.clientCode}</Text>
                            </View>
                        )}
                        {isRelevant(billingInfo.dueAmount) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Due Amount:</Text>
                                <Text style={styles.value}>{billingInfo.dueAmount}</Text>
                            </View>
                        )}
                        {isRelevant(billingInfo.mode) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Mode:</Text>
                                <Text style={styles.value}>{billingInfo.mode}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Referring Doctor</Text>
                        {isRelevant(referringDoctor.name) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>{referringDoctor.name}</Text>
                            </View>
                        )}
                        {isRelevant(referringDoctor.phone) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone:</Text>
                                <Text style={styles.value}>{referringDoctor.phone}</Text>
                            </View>
                        )}
                        {isRelevant(referringDoctor.email) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{referringDoctor.email}</Text>
                            </View>
                        )}
                        {isRelevant(referringDoctor.accountNumber) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Account No.:</Text>
                                <Text style={styles.value}>{referringDoctor.accountNumber}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Specimen & Lab Reception */}
                <View style={styles.twoColumn}>
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Specimen Information</Text>
                        {isRelevant(specimenInfo.receivedFrom) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Received From:</Text>
                                <Text style={styles.value}>{specimenInfo.receivedFrom}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.billId) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Bill ID:</Text>
                                <Text style={styles.value}>{specimenInfo.billId}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.orderNumber) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Order/Lab Ref. No.:</Text>
                                <Text style={styles.value}>{specimenInfo.orderNumber}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.dateDrawn) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Date Drawn:</Text>
                                <Text style={styles.value}>{specimenInfo.dateDrawn}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.timeDrawn) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Time Drawn:</Text>
                                <Text style={styles.value}>{specimenInfo.timeDrawn}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.collectedAt) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Collected At:</Text>
                                <Text style={styles.value}>{specimenInfo.collectedAt}</Text>
                            </View>
                        )}
                        {isRelevant(specimenInfo.sampleId) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Sample ID:</Text>
                                <Text style={styles.value}>{specimenInfo.sampleId}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.sectionHeader}>Received in Lab</Text>
                        {isRelevant(receivedInLab.date) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Date:</Text>
                                <Text style={styles.value}>{receivedInLab.date}</Text>
                            </View>
                        )}
                        {isRelevant(receivedInLab.time) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Time:</Text>
                                <Text style={styles.value}>{receivedInLab.time}</Text>
                            </View>
                        )}
                        {isRelevant(receivedInLab.outsourceName) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Outsource Name:</Text>
                                <Text style={styles.value}>{receivedInLab.outsourceName}</Text>
                            </View>
                        )}
                        <Text style={styles.sectionHeader}>Temperature (Sent)</Text>
                        <Text style={styles.value}>
                            {temperatureSent.frozen ? "[x]" : "[ ]"} Frozen (&lt;-10°C)
                        </Text>
                        <Text style={styles.value}>
                            {temperatureSent.cold ? "[x]" : "[ ]"} Cold (2-8°C)
                        </Text>
                        <Text style={styles.value}>
                            {temperatureSent.ambient ? "[x]" : "[ ]"} Ambient
                        </Text>
                        <Text style={styles.sectionHeader}>Temperature (Received)</Text>
                        <Text style={styles.value}>
                            {temperatureReceived.frozen ? "[x]" : "[ ]"} Frozen (&lt;-10°C)
                        </Text>
                        <Text style={styles.value}>
                            {temperatureReceived.cold ? "[x]" : "[ ]"} Cold (2-8°C)
                        </Text>
                        <Text style={styles.value}>
                            {temperatureReceived.ambient ? "[x]" : "[ ]"} Ambient
                        </Text>
                    </View>
                </View>

                {/* Specimen Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Specimen Type</Text>
                    <View style={styles.specimenContainer}>
                        {specimenColumns.map((col, colIndex) => (
                            <View key={colIndex} style={styles.specimenColumn}>
                                {col.map((type, typeIndex) => (
                                    <Text key={typeIndex} style={styles.specimenItem}>
                                        [ ] {type}
                                    </Text>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>

                {/* For Repeat / Follow-Up Patients */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>For Repeat / Follow-Up Patients</Text>
                    {isRelevant(repeatFollowUp.oldAccessionNo) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Old Accession No.:</Text>
                            <Text style={styles.value}>{repeatFollowUp.oldAccessionNo}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.provisionalDiagnosis) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>1) Provisional Diagnosis:</Text>
                            <Text style={styles.value}>{repeatFollowUp.provisionalDiagnosis}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.historyOfMedication) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>2) H/o Medication:</Text>
                            <Text style={styles.value}>{repeatFollowUp.historyOfMedication}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.ifYesName) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>3) If Yes, Name:</Text>
                            <Text style={styles.value}>{repeatFollowUp.ifYesName}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.statusOfMedication) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>4) Status of Medication:</Text>
                            <Text style={styles.value}>{repeatFollowUp.statusOfMedication}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.duration) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>5) If ongoing, Duration:</Text>
                            <Text style={styles.value}>{repeatFollowUp.duration}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.terminatedWhen) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>6) If terminated, When:</Text>
                            <Text style={styles.value}>{repeatFollowUp.terminatedWhen}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.lmp) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>7) LMP (if applicable):</Text>
                            <Text style={styles.value}>{repeatFollowUp.lmp}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.fastingPeriod) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>8) Fasting Period:</Text>
                            <Text style={styles.value}>{repeatFollowUp.fastingPeriod}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.urineVolume) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>9) 24 hr Urine Volume:</Text>
                            <Text style={styles.value}>{repeatFollowUp.urineVolume}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.histopathHistory) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>10) Histopath History:</Text>
                            <Text style={styles.value}>{repeatFollowUp.histopathHistory}</Text>
                        </View>
                    )}
                    {isRelevant(repeatFollowUp.otherInfo) && (
                        <View style={styles.row}>
                            <Text style={styles.label}>11) Other Info:</Text>
                            <Text style={styles.value}>{repeatFollowUp.otherInfo}</Text>
                        </View>
                    )}
                </View>

                {/* Please Note */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Please Note</Text>
                    <Text style={styles.note}>
                        After completion of the ordered tests, the remaining sample may be stored and used for research in medical sciences.
                        "I / We consent to receive information or be contacted through mail, telecommunication, electronic & personal means from leonides, time to time.”
                    </Text>
                    <Text style={styles.note}>[ ] I don't agree</Text>
                </View>

                {/* Signature Section */}
                <View style={styles.section}>
                    <View style={styles.signatureRow}>
                        <Text style={styles.label}>Signature of Requisitioner / Patient:</Text>
                        <Text style={styles.value}>_____________________</Text>
                    </View>
                    <View style={styles.signatureRow}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>_____________________</Text>
                    </View>
                </View>

                {/* Important Note */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, styles.centered]}>
                        Important: All requested information is mandatory for accurate and timely reporting.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}