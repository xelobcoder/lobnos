'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import Loader from '../../../../components/isLoading';
import { currencyFormatter } from '../../../../components/Auth/customFetch';
import { Button } from 'react-bootstrap';

interface BillingData {
     billingid: number;
     patientid: number;
     totalTransactionCost: string;
     totalcost: string;
     paid: string;
     payable: string;
     totalrefunded: string;
     discount: string;
     outstanding: string;
     balance: string;
     billedon: string;
     clientstatus: string;
     year: number;
     month: number;
     day: number;
     amountIncurredDueTax: string;
     lastupdated: string;
     branchid: number;
     isPromo: number;
     promoValue: string;
     promoMethod: string;
     promoCodeId: number;
     status: string;
     relatedBillingId: number | null;
     isAdjustment: number;
     adjustedBy: number | null;
     adjustmentReason: string | null;
     adjustmentType: string | null;
     islocked: number;
     adjustmentdate: string | null;
     adjustmentamount: string | null;
     additionalinformation: string | null;
     writeoff: string;
}

interface ServiceData {
     serviceid: number;
     billingid: number;
     trackId: number;
     cost: string;
     employeeid: number;
     serviceCategory: string;
     categoryTrackId: number;
     clinicianId: number;
     organizationId: number | null;
     registrationType: string;
     branchid: number;
     isoutsourced: number;
     outsourceid: number | null;
     serviceAddedOn: string;
     taxList: any;
     taxValue: string;
     amountIncurredDueTax: string;
     taxIncluded: number;
     discount: string;
     totalcost: string;
     totalpayable: string;
     isNHIS: number;
     isPHIS: number;
     insuranceid: number | null;
     claimCode: string | null;
     hasNightAdjustment: number;
     nightAdjustmentValue: string;
     nightAdjustmentMode: string;
     isPackageUsed: number;
     packageid: number | null;
     status: string;
     isRefunded: number;
     isLocked: number;
     isAdjustment: number;
     isCorrected: any;
     relatedbillingid: number | null;
     paidamount: string;
     paymentstatus: string;
     outstanding: string;
     outsourceprice: string;
     isRefundCompleted: number;
     isRefundApproved: number;
     isRefundInitiated: number;
     amountRefunded: string;
     name: string;
     witnesses: any[];
}

export default function ReceiptPage() {
     const searchParams = useSearchParams();
     const billingid = searchParams?.get('billingid') || '3808';

     const [billingData, setBillingData] = useState<BillingData | null>(null);
     const [services, setServices] = useState<ServiceData[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [printMode, setPrintMode] = useState<'a4' | 'pos'>('a4');

     const { applicationsettings } = useApplicationSettings();
     const { company } = applicationsettings;


     useEffect(() => {
          const fetchReceiptData = async () => {
               try {
                    setLoading(true);
                    setError(null);

                    // Fetch billing transaction data
                    const transactionResponse = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
                    const { result } = transactionResponse;
                    if (result && Array.isArray(result) && result.length > 0) {
                         setBillingData(result[0]);
                    } else {
                         throw new Error('Failed to fetch billing data');
                    }

                    // // Fetch services data
                    const servicesResponse = await customFetch(`billing/information/single?billingid=${billingid}`);
                    const data = servicesResponse.result;
                    if (data && Array.isArray(data)) {
                         setServices(data);
                    } else {
                         setServices([]);
                    }




               } catch (err) {
                    console.error('Error fetching receipt data:', err);
                    setError('Failed to load receipt data. Please try again.');
               } finally {
                    setLoading(false);
               }
          };

          if (billingid) {
               fetchReceiptData();
          }
     }, [billingid]);

     const handlePrint = () => {
          if (loading) {
               alert('Please wait for the receipt to load before printing.');
               return;
          }
          if (error || !billingData) {
               alert('Cannot print receipt: ' + (error || 'No receipt data available.'));
               return;
          }
          window.print();
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <Loader />
               </div>
          );
     }

     if (error || !billingData) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-danger">
                         {error || 'No receipt data found.'}
                    </div>
               </div>
          );
     }

     // --- A4 Receipt Content ---
     const a4ReceiptContent = (
          <>
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Receipt Invoice</h2>
                    <div className="d-flex gap-2 align-items-center">
                         <select
                              className="form-select form-select-sm"
                              style={{ width: 120 }}
                              value={printMode}
                              onChange={e => setPrintMode(e.target.value as 'a4' | 'pos')}
                         >
                              <option value="a4">A4</option>
                              <option value="pos">POS</option>
                         </select>
                         <Button variant="outline-primary" onClick={handlePrint} disabled={loading}>
                              Print Receipt
                         </Button>
                    </div>
               </div>

               {/* Receipt Header */}
               <div className="card mb-4">
                    <div className="card-header bg-light">
                         <div className="row">
                              <div className="col-md-6">
                                   <h5 className="mb-1">{company?.name || 'Company Name'}</h5>
                                   <p className="mb-0 text-muted small">
                                        {company?.address || 'Company Address'}
                                   </p>
                              </div>
                              <div className="col-md-6 text-end">
                                   <h6 className="mb-1">Receipt #{billingData.billingid}</h6>
                                   <p className="mb-0 text-muted small">
                                        Date: {new Date(billingData.billedon).toLocaleDateString()}
                                   </p>
                                   <p className="mb-0 text-muted small">
                                        Status: <span className={`badge ${billingData.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                                             {billingData.status}
                                        </span>
                                   </p>
                              </div>
                         </div>
                    </div>

                    <div className="card-body">
                         {/* Billing Summary */}
                         <div className="row mb-4">
                              <div className="col-md-6">
                                   <h6>Billing Information</h6>
                                   <table className="table table-sm table-borderless">
                                        <tbody>
                                             <tr>
                                                  <td className="text-muted">Patient ID:</td>
                                                  <td>{billingData.patientid}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted">Branch ID:</td>
                                                  <td>{billingData.branchid}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted">Billed On:</td>
                                                  <td>{new Date(billingData.billedon).toLocaleString()}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                              <div className="col-md-6">
                                   <h6>Payment Summary</h6>
                                   <table className="table table-sm table-borderless">
                                        <tbody>
                                             <tr>
                                                  <td className="text-muted">Total Cost:</td>
                                                  <td className="fw-bold">{currencyFormatter.format(parseFloat(billingData.totalcost))}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted">Discount:</td>
                                                  <td>{currencyFormatter.format(parseFloat(billingData.discount))}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted">Paid:</td>
                                                  <td className="text-success fw-bold">{currencyFormatter.format(parseFloat(billingData.paid))}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted">Outstanding:</td>
                                                  <td className={parseFloat(billingData.outstanding) > 0 ? 'text-danger' : 'text-muted'}>
                                                       {currencyFormatter.format(parseFloat(billingData.outstanding))}
                                                  </td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {/* Services Table */}
                         <h6>Services</h6>
                         <div className="table-responsive">
                              <table className="table table-striped table-hover">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Service Name</th>
                                             <th>Cost</th>
                                             <th>Discount</th>
                                             <th>Total</th>
                                             <th>Status</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {Array.isArray(services) && services.map((service) => (
                                             <tr key={service.serviceid}>
                                                  <td>{service.name}</td>
                                                  <td>{currencyFormatter.format(parseFloat(service.cost))}</td>
                                                  <td>{currencyFormatter.format(parseFloat(service.discount))}</td>
                                                  <td className="fw-bold">{currencyFormatter.format(parseFloat(service.totalcost))}</td>
                                                  <td>
                                                       <span className={`badge ${service.paymentstatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                                                            {service.paymentstatus}
                                                       </span>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot className="table-light">
                                        <tr className="fw-bold">
                                             <td colSpan={3} className="text-end">Total:</td>
                                             <td>{currencyFormatter.format(parseFloat(billingData.totalcost))}</td>
                                             <td></td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>

                         {/* Footer */}
                         <div className="row mt-4">
                              <div className="col-12 text-center text-muted small">
                                   <p className="mb-0">Thank you for your business!</p>
                                   <p className="mb-0">Receipt generated on {new Date().toLocaleString()}</p>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );

     // --- POS Receipt Content (Compact/Narrow) ---
     const posReceiptContent = (
          <>
               <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Receipt</h5>
                    <div className="d-flex gap-2 align-items-center">
                         <select
                              className="form-select form-select-sm"
                              style={{ width: 100, fontSize: '0.75rem' }}
                              value={printMode}
                              onChange={e => setPrintMode(e.target.value as 'a4' | 'pos')}
                         >
                              <option value="a4">A4</option>
                              <option value="pos">POS</option>
                         </select>
                         <Button variant="outline-primary" size="sm" onClick={handlePrint} disabled={loading}>
                              Print
                         </Button>
                    </div>
               </div>

               {/* POS Receipt Header */}
               <div className="border-bottom pb-2 mb-2">
                    <div className="text-center">
                         <h6 className="mb-1 fw-bold">{company?.name || 'Company Name'}</h6>
                         <p className="mb-0 small text-muted">{company?.address || 'Company Address'}</p>
                    </div>
                    <div className="text-center mt-2">
                         <p className="mb-0 small">Receipt #{billingData.billingid}</p>
                         <p className="mb-0 small">Date: {new Date(billingData.billedon).toLocaleDateString()}</p>
                         <span className={`badge ${billingData.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                              {billingData.status}
                         </span>
                    </div>
               </div>

               {/* POS Billing Info - Compact */}
               <div className="border-bottom pb-2 mb-2">
                    <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.8rem' }}>
                         <tbody>
                              <tr>
                                   <td className="text-muted px-0">Patient ID:</td>
                                   <td className="text-end px-0">{billingData.patientid}</td>
                              </tr>
                              <tr>
                                   <td className="text-muted px-0">Branch ID:</td>
                                   <td className="text-end px-0">{billingData.branchid}</td>
                              </tr>
                              <tr>
                                   <td className="text-muted px-0">Billed On:</td>
                                   <td className="text-end px-0">{new Date(billingData.billedon).toLocaleString()}</td>
                              </tr>
                         </tbody>
                    </table>
               </div>

               {/* POS Services - Compact List */}
               <div className="border-bottom pb-2 mb-2">
                    <h6 className="mb-2 fw-bold" style={{ fontSize: '0.9rem' }}>Services</h6>
                    {Array.isArray(services) && services.map((service) => (
                         <div key={service.serviceid} className="mb-2" style={{ fontSize: '0.8rem' }}>
                              <div className="d-flex justify-content-between">
                                   <span className="fw-bold">{service.name}</span>
                                   <span className="fw-bold">{currencyFormatter.format(parseFloat(service.totalcost))}</span>
                              </div>
                              <div className="d-flex justify-content-between text-muted small">
                                   <span>Cost: {currencyFormatter.format(parseFloat(service.cost))}</span>
                                   <span>Disc: {currencyFormatter.format(parseFloat(service.discount))}</span>
                              </div>
                         </div>
                    ))}
               </div>

               {/* POS Payment Summary */}
               <div className="border-bottom pb-2 mb-2">
                    <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.85rem' }}>
                         <tbody>
                              <tr>
                                   <td className="text-muted px-0">Total Cost:</td>
                                   <td className="text-end px-0 fw-bold">{currencyFormatter.format(parseFloat(billingData.totalcost))}</td>
                              </tr>
                              <tr>
                                   <td className="text-muted px-0">Discount:</td>
                                   <td className="text-end px-0">{currencyFormatter.format(parseFloat(billingData.discount))}</td>
                              </tr>
                              <tr>
                                   <td className="text-success px-0 fw-bold">Paid:</td>
                                   <td className="text-end px-0 text-success fw-bold">{currencyFormatter.format(parseFloat(billingData.paid))}</td>
                              </tr>
                              <tr>
                                   <td className={`px-0 fw-bold ${parseFloat(billingData.outstanding) > 0 ? 'text-danger' : 'text-muted'}`}>Outstanding:</td>
                                   <td className={`text-end px-0 fw-bold ${parseFloat(billingData.outstanding) > 0 ? 'text-danger' : 'text-muted'}`}>
                                        {currencyFormatter.format(parseFloat(billingData.outstanding))}
                                   </td>
                              </tr>
                         </tbody>
                    </table>
               </div>

               {/* POS Footer */}
               <div className="text-center" style={{ fontSize: '0.75rem' }}>
                    <p className="mb-0 text-muted">Thank you for your business!</p>
                    <p className="mb-0 text-muted">{new Date().toLocaleString()}</p>
               </div>
          </>
     );

     return (
          <>
               <div className={`print-mode-${printMode}`}>
                    <div
                         className={`container-fluid px-4 py-3 print-a4${printMode === 'a4' ? '' : ' d-none'}`}
                         style={{ background: '#fff' }}
                    >
                         {a4ReceiptContent}
                    </div>
                    <div
                         className={`container-fluid px-2 py-2 print-pos${printMode === 'pos' ? '' : ' d-none'}`}
                         style={{ background: '#fff', maxWidth: '80mm' }}
                    >
                         {posReceiptContent}
                    </div>
               </div>
          </>
     );
}
