import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const ReceiptBillPdf = ({ invoiceData }) => {
    const { testInformation, clientInformation, companyInfo } = invoiceData;
    const client =
        Array.isArray(clientInformation) && clientInformation.length
            ? clientInformation[0]
            : {};

    const pdfStyles = StyleSheet.create({
        page: {
            padding: 10,
            fontSize: 9,
            fontFamily: "Courier",
        },
        header: {
            fontSize: 16,
            textAlign: "center",
            marginBottom: 5,
            fontWeight: "bold",
            fontFamily: "Courier",
        },
        subHeader: {
            fontSize: 10,
            textAlign: "center",
            fontFamily: "Courier",
            marginBottom: 3,
        },
        invoiceInfo: {
            flexDirection: "row",
            fontFamily: "Courier",
            justifyContent: "space-between",
            marginBottom: 5,
        },
        patientInfo: {
            marginBottom: 5,
        },
        table: {
            width: "100%",
            marginBottom: 5,
        },
        tableRow: {
            flexDirection: "row",
            marginBottom: 2,
        },
        tableCol: {
            width: "70%",
        },
        tableColAmount: {
            width: "30%",
            textAlign: "right",
        },
        total: {
            textAlign: "right",
            marginTop: 2,
            fontSize: 10,
            fontWeight: "bold",
        },
        thankYou: {
            marginTop: 5,
            textAlign: "left",
        },
        footer: {
            fontSize: 8,
            marginTop: 5,
        },
        barcode: {
            width: 100,
            height: 30,
            marginBottom: 5,
        },
    });

    const options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    const billedDate = client.billedon
        ? new Date(client.billedon).toLocaleDateString("en-AU", options)
        : "";
    const barcodeUrl = client.patientid
        ? `https://barcode.tec-it.com/barcode.ashx?data=${client.patientid}&code=Code128&dpi=96`
        : "";

    return (
        <Document>
            <Page size={[226.77, 600]} style={pdfStyles.page}>
                <Text style={pdfStyles.header}>{companyInfo.name}</Text>
                <Text style={pdfStyles.subHeader}>{companyInfo.motto}</Text>
                <Text style={pdfStyles.subHeader}>{companyInfo.address}</Text>
                <Text style={pdfStyles.subHeader}>Tel: {companyInfo.phonenumber}</Text>
                <Text style={pdfStyles.subHeader}>Email: {companyInfo.email}</Text>
                <View style={pdfStyles.invoiceInfo}>
                    <Text>Invoice {client.billingid}</Text>
                    <Text>{billedDate}</Text>
                </View>
                <View style={pdfStyles.patientInfo}>
                    <Text>Patient ID: {client.patientid}</Text>
                    <Text>Full Patient ID: {client.fullpatientid}</Text>
                </View>
                {barcodeUrl && <Image src={barcodeUrl} style={pdfStyles.barcode} />}
                <View style={pdfStyles.table}>
                    {testInformation.map((service) => (
                        <View style={pdfStyles.tableRow} key={service.serviceid}>
                            <Text style={pdfStyles.tableCol}>{service.serviceName}</Text>
                            <Text style={pdfStyles.tableColAmount}>
                                GHC {parseFloat(service.totalpayable).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={pdfStyles.total}>Total Cost: GH₵ {client.totalcost}</Text>
                    <Text style={pdfStyles.total}>Paid: GH₵ {client.paid}</Text>
                    <Text style={pdfStyles.total}>Payable: GH₵ {client.payable}</Text>
                </View>
                <Text style={pdfStyles.thankYou}>Thank you and</Text>
                <Text style={pdfStyles.thankYou}>see you again!</Text>
            </Page>
        </Document>
    );
};

export default ReceiptBillPdf;
