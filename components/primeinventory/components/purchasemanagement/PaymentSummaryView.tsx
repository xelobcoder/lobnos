import React from 'react';
import { currencyFormatter, customFetch } from '../../Lib/fetcher';

// Define types for payment summary properties
type PaymentSummaryProps = {
    orderTransactionid: number;
    taxAmount: number;
    method: string;
    debit: number;
    credit: number;
    id: number;
    paymentmode: string;
    amountpaid: number;
    description: string;
    additionalAmount: number,
    amount: number;
};

export default async function PaymentSummaryView({ orderTransactionid }: { orderTransactionid: number }) {
    let data: PaymentSummaryProps | null = null;

    try {
        const response = await customFetch(`orders/payment-summary?orderTransactionid=${orderTransactionid}`);

        if (response && typeof response === "object" && Object.entries(response).length > 0) {
            data = response;
        }
    } catch (err) {
        data = null;
    }

    console.log(data)
    if (!data) {
        return (
            <div style={styles.noDataContainer}>
                {"<"}No Payment Summary Data Found{">"}
            </div>
        );
    }

    return (
        <div>
            <h4 style={{ borderRadius: '10px' }} className=' bg-secondary-subtle p-3 pls-color'>Payment Summary</h4>
            <div className=' bg-secondary-subtle' style={styles.summaryDetails}>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Transaction ID:</span>
                    <span style={styles.value}>{data.orderTransactionid}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Amount Paid:</span>
                    <span style={styles.value}>{currencyFormatter.format(data.amountpaid)}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Payment Mode:</span>
                    <span style={styles.value}>{data.paymentmode}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Tax Amount:</span>
                    <span style={styles.value}>{currencyFormatter.format(data.taxAmount)}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Debit:</span>
                    <span style={styles.value}>{currencyFormatter.format(data.debit)}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Credit:</span>
                    <span style={styles.value}>{currencyFormatter.format(data.credit)}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Addtional Charges</span>
                    <span style={styles.value}>{currencyFormatter.format(data.additionalAmount)}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.label}>Addtional Billing Description:</span>
                    <span style={styles.value}>{data.description}</span>
                </div>

            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#fff',
        maxWidth: '600px',
        margin: 'auto',
    },
    header: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center',
    },
    summaryDetails: {
        marginTop: '10px',
        padding: '10px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        color: '#333',
    },
    noDataContainer: {
        height: '100px',
        color: '#000',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        margin: 'auto',
    },
    lastRow: {
        borderBottom: 'none',
    },
};
