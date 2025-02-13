"use client";
import { useState, useEffect } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import { InvoiceData } from "../../../../components/types/dev.types";
import ReceiptsClientView from "../../../../components/Billing/ReceiptPdfs/ReceiptsClientView";

interface InvoiceProps {
    params: {
        billingid: number;
    };
}

export default function Invoice({ params }: InvoiceProps) {
    const { billingid } = params;
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const data: InvoiceData = await customFetch(`billing/invoice?billingid=${billingid}`);
                setInvoiceData(data);
            } catch (error) {
                console.error("Error fetching invoice data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceData();
    }, [billingid]);

    if (loading) {
        return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
    }
    if (!invoiceData) {
        return <div style={{ textAlign: "center", padding: "20px" }}>No invoice data available.</div>;
    }

    return (
        <div>
            <ReceiptsClientView billingid={billingid} invoiceData={invoiceData} />
            {/* Receipt Markup */}
            <div
                className="receipt-container pls-color"
                style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginTop: "20px",
                    background: "#f9f9f9",
                }}
            >
                <h2 style={{ marginBottom: "20px" }}>Receipt</h2>

                {/* Client Information */}
                <div className="client-info" style={{ marginBottom: "20px" }}>
                    <h3>
                        {invoiceData.clientInformation.designation}{" "}
                        {invoiceData.clientInformation.firstname}{" "}
                        {invoiceData.clientInformation.lastname}
                    </h3>
                    <p>
                        <strong>Patient ID:</strong> {invoiceData.clientInformation.fullpatientid}
                    </p>
                    <p>
                        <strong>Email:</strong> {invoiceData.clientInformation.email}
                    </p>
                    <p>
                        <strong>Phone:</strong> {invoiceData.clientInformation.mobile_number}
                    </p>
                    <p>
                        <strong>Date:</strong>{" "}
                        {new Date(invoiceData.clientInformation.billedon as any).toLocaleDateString()}
                    </p>
                </div>

                {/* Services/Items Table */}
                <div className="services">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>#</th>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Service ID</th>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Category</th>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Cost</th>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tax</th>
                                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.testInformation.map((service, index) => (
                                <tr key={service.serviceid}>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {service.serviceid}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {service.servicecategory}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {service.cost}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {service.taxvalue}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                        {service.totalcost}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="summary" style={{ marginTop: "20px", textAlign: "right" }}>
                    <p>
                        <strong>Total Payable:</strong> {invoiceData.clientInformation.totalpayable}
                    </p>
                    <p>
                        <strong>Paid:</strong> {invoiceData.clientInformation.paid}
                    </p>
                    <p>
                        <strong>Balance:</strong> {invoiceData.clientInformation.balance}
                    </p>
                </div>
            </div>

        </div>
    );
}
