"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { RiArrowLeftLine, RiPrinterLine } from '@remixicon/react';
import styles from '../../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../../components/PatientPortal/usePortalResource';
import { billStatus, formatDate, formatMoney } from '../../../../lib/patientPortal';
import PortalSummary from '../../../../components/PatientPortal/PortalSummary';

interface BillDetail {
     billingid: number;
     billedon: string;
     total: number;
     discount: number;
     payable: number;
     paid: number;
     outstanding: number;
     status: string;
     items: { serviceid: number; description: string; amount: number; paid: number; outstanding: number; paymentStatus?: string; status?: string }[];
     payments: { receiptNumber: string | number; paidon: string; amount: number; mode?: string; type: 'payment' | 'refund' }[];
}

const PRINT_ONLY_BILL = `
@media print {
     body * { visibility: hidden !important; }
     #pls-portal-bill, #pls-portal-bill * { visibility: visible !important; }
     #pls-portal-bill { position: absolute; left: 0; top: 0; width: 100%; }
}`;

export default function PatientBillPage() {
     const params = useParams<{ billingid: string }>();
     const billingid = Number(params?.billingid);
     const valid = Number.isSafeInteger(billingid) && billingid > 0;
     const { data, loading, error, code, reload } = usePortalResource<BillDetail>(valid ? `patient-portal/billing/${billingid}` : null);
     const status = data ? billStatus(data) : null;

     return (
          <main className={styles.page}>
               <style>{PRINT_ONLY_BILL}</style>
               <div className={`${styles.header} ${styles.noPrint}`}>
                    <Link href="/patientportal/billing" className="d-inline-flex align-items-center gap-1"><RiArrowLeftLine size={16} />Back to bills</Link>
                    {data && <Button className={styles.primaryButton} onClick={() => window.print()}><RiPrinterLine size={16} className="me-1" />Print statement</Button>}
               </div>

               {!valid && <Alert variant="danger">This bill link is not valid.</Alert>}
               {code === 'BILLING_DISABLED' ? (
                    <Alert variant="info">Billing information is not available in this portal. Please contact the facility about your bills.</Alert>
               ) : error ? (
                    <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>
               ) : null}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading bill...</div>}

               {data && status && (
                    <article id="pls-portal-bill" className={styles.report}>
                         <header className={styles.reportHeader}>
                              <div>
                                   <p className={styles.reportCompany}>Bill #{data.billingid}</p>
                                   <div className="small text-muted">Billed on {formatDate(data.billedon, true)}</div>
                              </div>
                              <div><Badge bg={status.variant}>{status.label}</Badge></div>
                         </header>

                         <PortalSummary items={[
                              { label: 'Total', value: formatMoney(data.total) },
                              { label: 'Discount', value: formatMoney(data.discount) },
                              { label: 'Payable', value: formatMoney(data.payable) },
                              { label: 'Paid', value: formatMoney(data.paid) },
                              { label: 'Outstanding', value: formatMoney(data.outstanding) },
                         ]} />

                         <div className={styles.reportTest}>
                              <div className={styles.reportTestName}>Services</div>
                              {data.items.length === 0 ? <p className="text-muted small">No services on this bill.</p> : (
                                   <Table size="sm" responsive className={styles.table}>
                                        <thead><tr><th>Service</th><th className="text-end">Amount</th><th className="text-end">Paid</th><th className="text-end">Outstanding</th></tr></thead>
                                        <tbody>
                                             {data.items.map((item, index) => (
                                                  <tr key={`${item.serviceid}-${index}`}>
                                                       <td>{item.description}</td>
                                                       <td className="text-end">{formatMoney(item.amount)}</td>
                                                       <td className="text-end">{formatMoney(item.paid)}</td>
                                                       <td className="text-end">{formatMoney(item.outstanding)}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </Table>
                              )}
                         </div>

                         <div className={styles.reportTest}>
                              <div className={styles.reportTestName}>Payments and receipts</div>
                              {data.payments.length === 0 ? <p className="text-muted small">No payments recorded yet.</p> : (
                                   <Table size="sm" responsive className={styles.table}>
                                        <thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Type</th><th className="text-end">Amount</th></tr></thead>
                                        <tbody>
                                             {data.payments.map((payment, index) => (
                                                  <tr key={`${payment.receiptNumber}-${index}`}>
                                                       <td>{payment.receiptNumber || '-'}</td>
                                                       <td>{formatDate(payment.paidon, true)}</td>
                                                       <td className="text-capitalize">{payment.mode || '-'}</td>
                                                       <td>{payment.type === 'refund' ? <Badge bg="secondary">Refund</Badge> : 'Payment'}</td>
                                                       <td className="text-end">{payment.type === 'refund' ? '-' : ''}{formatMoney(payment.amount)}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </Table>
                              )}
                         </div>
                    </article>
               )}
          </main>
     );
}
