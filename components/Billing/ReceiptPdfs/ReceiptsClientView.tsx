import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import React from 'react';
import ReceiptBillPdf from './ReceiptsBill';
import ReceiptBillPdfA4 from './ReceiptsBillA4';
import { InvoiceData } from '../../types/dev.types';

interface ReceiptsClientViewProps {
    invoiceData: InvoiceData;
    billingid: number;
}

export default function ReceiptsClientView({ invoiceData, billingid }: ReceiptsClientViewProps) {
    return (
        <div>
            <div style={{ marginBottom: "20px" }}>
                <PDFDownloadLink
                    document={<ReceiptBillPdf invoiceData={invoiceData} />}
                    fileName={`invoice_${billingid}_POS.pdf`}
                >
                    {({ loading }) =>
                        loading ? "Generating PDF..." : (
                            <button className="btn btn-sm btn-primary" style={{ marginRight: "10px" }}>
                                Download PDF in POS format
                            </button>
                        )
                    }
                </PDFDownloadLink>
                <PDFDownloadLink
                    document={<ReceiptBillPdfA4 invoiceData={invoiceData} />}
                    fileName={`invoice_${billingid}_A4.pdf`}
                >
                    {({ loading }) =>
                        loading ? "Generating PDF..." : (
                            <button className="btn btn-sm btn-primary">
                                Download PDF in A4 Format
                            </button>
                        )
                    }
                </PDFDownloadLink>
                <PDFViewer style={{ width: '100%', height: '100vh' }}>
                    <ReceiptBillPdfA4 invoiceData={invoiceData} />
                </PDFViewer>
            </div>
        </div>
    );
}