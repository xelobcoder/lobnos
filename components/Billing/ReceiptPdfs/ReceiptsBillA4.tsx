import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

const ReceiptBillPdfA4: React.FC<{ invoiceData: any }> = ({ invoiceData }) => {
    const { testInformation, clientInformation, companyInfo } = invoiceData;
    const client =
        Array.isArray(clientInformation) && clientInformation.length > 0
            ? clientInformation[0]
            : clientInformation;

    const pdfStyles = StyleSheet.create({
        page: {
            padding: 20,
            fontSize: 12,
            fontFamily: "Helvetica",
            backgroundColor: "#ffffff",
        },
        header: {
            fontSize: 20,
            textAlign: "center",
            marginBottom: 10,
            fontFamily: "Helvetica-Bold",
            color: "#333333",
        },
        address: {
            fontSize: 10,
            textAlign: "center",
            marginBottom: 4,
            color: "#666666",
        },
        clientInfoContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 15,
        },
        clientColumn: {
            width: "48%",
            padding: 8,
            borderWidth: 1,
            borderColor: "#cccccc",
            borderRadius: 4,
        },
        clientColumnHeader: {
            fontFamily: "Helvetica-Bold",
            marginBottom: 5,
            fontSize: 12,
            color: "#333333",
            borderBottomWidth: 1,
            borderBottomColor: "#cccccc",
            paddingBottom: 3,
        },
        tableContainer: {
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#cccccc",
            borderRadius: 4,
        },
        tableHeaderRow: {
            flexDirection: "row",
            backgroundColor: "#f7f7f7",
            borderBottomWidth: 1,
            borderBottomColor: "#cccccc",
            padding: 8,
        },
        tableHeaderCol: {
            fontFamily: "Helvetica-Bold",
            fontSize: 11,
            color: "#333333",
        },
        tableRow: {
            flexDirection: "row",
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#eeeeee",
        },
        tableRowOdd: {
            backgroundColor: "#fafafa",
        },
        tableRowEven: {
            backgroundColor: "#ffffff",
        },
        tableCol: {
            fontSize: 10,
            color: "#333333",
        },
        totalSection: {
            marginTop: 15,
            padding: 10,
            borderWidth: 1,
            borderColor: "#cccccc",
            borderRadius: 4,
            backgroundColor: "#f7f7f7",
        },
        totalText: {
            fontFamily: "Helvetica-Bold",
            fontSize: 12,
            textAlign: "right",
            color: "#333333",
            marginVertical: 2,
        },
        thankYouSection: {
            marginTop: 20,
            textAlign: "center",
            fontFamily: "Helvetica",
            fontSize: 12,
            color: "#333333",
        },
    });

    const options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };

    const billedDate = new Date(client.billedon).toLocaleDateString("en-AU", options as any);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.header}>{companyInfo.name}</Text>
                <Text style={pdfStyles.address}>{companyInfo.motto}</Text>
                <Text style={pdfStyles.address}>{companyInfo.address}</Text>
                <Text style={pdfStyles.address}>Tel: {companyInfo.phonenumber}</Text>
                <Text style={pdfStyles.address}>Email: {companyInfo.email}</Text>

                {/* Client Information in Two Columns */}
                <View style={pdfStyles.clientInfoContainer}>
                    <View style={pdfStyles.clientColumn}>
                        <Text style={pdfStyles.clientColumnHeader}>Patient Details</Text>
                        <Text>Designation: {client.designation}</Text>
                        <Text>Age: {client.age} {client.agetype}</Text>
                        <Text>Occupation: {client.occupation}</Text>
                        <Text>Marital Status: {client.marital_status}</Text>
                        <Text>WhatsApp: {client.whatAppcontact}</Text>
                    </View>
                    <View style={pdfStyles.clientColumn}>
                        <Text style={pdfStyles.clientColumnHeader}>Invoice Information</Text>
                        <Text>Invoice ID: {client.billingid}</Text>
                        <Text>Date: {billedDate}</Text>
                        <Text>Patient ID: {client.patientid}</Text>
                        <Text>Full Patient ID: {client.fullpatientid}</Text>
                    </View>
                </View>

                {/* Service Table */}
                <View style={pdfStyles.tableContainer}>
                    <View style={pdfStyles.tableHeaderRow}>
                        <Text style={[pdfStyles.tableHeaderCol, { width: "50%" }]}>
                            Service Name
                        </Text>
                        <Text style={[pdfStyles.tableHeaderCol, { width: "25%", textAlign: "right" }]}>
                            Cost (GHC)
                        </Text>
                        <Text style={[pdfStyles.tableHeaderCol, { width: "25%", textAlign: "right" }]}>
                            Amt Incurred Tax (GHC)
                        </Text>
                    </View>
                    {testInformation.map((service, index) => (
                        <View
                            style={[
                                pdfStyles.tableRow,
                                index % 2 === 0 ? pdfStyles.tableRowEven : pdfStyles.tableRowOdd,
                            ]}
                            key={service.serviceid}
                        >
                            <Text style={[pdfStyles.tableCol, { width: "50%" }]}>
                                {service.serviceName}
                            </Text>
                            <Text style={[pdfStyles.tableCol, { width: "25%", textAlign: "right" }]}>
                                {parseFloat(service.cost).toFixed(2)}
                            </Text>
                            <Text style={[pdfStyles.tableCol, { width: "25%", textAlign: "right" }]}>
                                {parseFloat(service.amountIncurredDueTax).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Transaction Summary */}
                <View style={pdfStyles.totalSection}>
                    <Text style={pdfStyles.totalText}>
                        Total Transaction Cost: {client.totalTransactionCost} GHC
                    </Text>
                    <Text style={pdfStyles.totalText}>
                        Total Refunded: {client.totalrefunded} GHC
                    </Text>
                    <Text style={pdfStyles.totalText}>
                        Outstanding Amount: {client.outstanding} GHC
                    </Text>
                </View>

                <View style={pdfStyles.thankYouSection}>
                    <Text>Thank you and see you again!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ReceiptBillPdfA4;
