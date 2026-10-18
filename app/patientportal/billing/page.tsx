"use client";

import Link from 'next/link';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { RiMoneyDollarCircleLine } from '@remixicon/react';
import styles from '../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { billStatus, formatDate, formatMoney } from '../../../lib/patientPortal';
import PortalSummary from '../../../components/PatientPortal/PortalSummary';

interface PortalBill {
     billingid: number;
     billedon: string;
     total: number;
     discount: number;
     payable: number;
     paid: number;
     outstanding: number;
     status: string;
}

export default function PatientBillingPage() {
     const { data, loading, error, code, reload } = usePortalResource<PortalBill[]>('patient-portal/billing');
     const bills = data || [];
     const total = (field: 'payable' | 'paid' | 'outstanding') => bills.reduce((sum, bill) => sum + Math.round(Number(bill[field]) * 100), 0) / 100;

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>Billing</h1>
                         <p className={styles.subtitle}>Your bills, payments and receipts.</p>
                    </div>
               </div>

               {code === 'BILLING_DISABLED' ? (
                    <Alert variant="info">Billing information is not available in this portal. Please contact the facility about your bills.</Alert>
               ) : error ? (
                    <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>
               ) : null}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading bills...</div>}

               {data && (
                    <>
                         <PortalSummary items={[
                              { label: 'Bills', value: bills.length, icon: <RiMoneyDollarCircleLine /> },
                              { label: 'Total payable', value: formatMoney(total('payable')), detail: 'After discounts' },
                              { label: 'Payments', value: formatMoney(total('paid')) },
                              { label: 'Outstanding balance', value: formatMoney(total('outstanding')) },
                         ]} />
                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiMoneyDollarCircleLine size={18} />My bills</h2>
                              {bills.length === 0 ? (
                                   <p className={styles.empty}>You have no bills.</p>
                              ) : (
                                   <Table responsive hover className={`${styles.table} align-middle mb-0`}>
                                        <thead><tr><th>Bill #</th><th>Date</th><th className="text-end">Payable</th><th className="text-end">Paid</th><th className="text-end">Outstanding</th><th>Status</th><th /></tr></thead>
                                        <tbody>
                                             {bills.map((bill) => {
                                                  const status = billStatus(bill);
                                                  return (
                                                       <tr key={bill.billingid}>
                                                            <td>{bill.billingid}</td>
                                                            <td>{formatDate(bill.billedon)}</td>
                                                            <td className="text-end">{formatMoney(bill.payable)}</td>
                                                            <td className="text-end">{formatMoney(bill.paid)}</td>
                                                            <td className="text-end">{formatMoney(bill.outstanding)}</td>
                                                            <td><Badge bg={status.variant}>{status.label}</Badge></td>
                                                            <td className="text-end"><Link href={`/patientportal/billing/${bill.billingid}`}>Details</Link></td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </Table>
                              )}
                         </section>
                    </>
               )}
          </main>
     );
}
