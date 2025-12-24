"use client";

import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import CompanyHeaders, { CompanyHeadersProps } from "../../../../components/ResultView/CompanyHeaders";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";

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
     organizationId: null;
     registrationType: string;
     branchid: number;
     isoutsourced: number;
     outsourceid: null;
     serviceAddedOn: string;
     taxList: null;
     taxValue: string;
     amountIncurredDueTax: string;
     taxIncluded: number;
     discount: string;
     totalcost: string;
     totalpayable: string;
     isNHIS: number;
     isPHIS: number;
     insuranceid: null;
     claimCode: null;
     hasNightAdjustment: number;
     nightAdjustmentValue: string;
     nightAdjustmentMode: string;
     isPackageUsed: number;
     packageid: null;
     status: string;
     isRefunded: number;
     isLocked: number;
     isAdjustment: number;
     isCorrected: null;
     relatedbillingid: null;
     paidamount: string;
     paymentstatus: string;
     outstanding: string;
     outsourceprice: string;
     isRefundCompleted: number;
     isRefundApproved: number;
     isRefundInitiated: number;
     amountRefunded: string;
     name: string;
     witnesses: [];
     medicalCode?: string;
     urgency?: string;
     expectedCompletion?: string;
}

interface PatientData {
     patientid: number;
     firstname: string;
     lastname: string;
     phone: string;
     email: string;
     dateofbirth: string;
     gender: string;
     address: string;
     emergencycontact?: string;
     insuranceid?: string;
     medicalrecordnumber?: string;
}

interface InvoiceMetadata {
     invoiceNumber: string;
     generatedBy: string;
     generatedAt: Date;
     branchName: string;
     paymentMethod: string;
     transactionRef: string;
}


export default function PosReceiptTestPage() {
     const [billingData, setBillingData] = useState<BillingData | null>(null);
     const [services, setServices] = useState<ServiceData[]>([]);
     const [companyInfo, setCompanyInfo] = useState<CompanyHeadersProps['companyInfo'] | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [retryCount, setRetryCount] = useState(0);
     const companyLogoUrl = process.env.NODE_ENV === "development" ?
          `${process.env.DEVELOPMENT_BASEURL}` + `settings/companyprofile/images` : `${process.env.PRODUCTION_BASEURL}` + `settings/companyprofile/images`;



     const laodCompanyInfor = async () => {
          try {
               const response = await customFetch('settings/companyprofile');
               if (Object.keys(response).length > 0) {
                    setCompanyInfo(response);
               }
          } catch (err: any) {
               console.error('Failed to load company information:', err);
          }
     };

     const fetchData = async () => {
          try {
               console.log('Starting data fetch...');
               setLoading(true);
               setError(null);

               console.log('Fetching billing data...');
               const billingResponse = await customFetch('billing/previous/transaction/data?billingid=3800');
               console.log('Billing response:', billingResponse);
               if (billingResponse?.result?.[0]) {
                    setBillingData(billingResponse.result[0]);
               } else {
                    throw new Error('No billing data found');
               }

               console.log('Fetching services data...');
               const servicesResponse = await customFetch('billing/information/single?billingid=3800');
               console.log('Services response:', servicesResponse);
               if (servicesResponse?.result) {
                    setServices(servicesResponse.result);
               } else {
                    throw new Error('No services data found');
               }

               console.log('Fetching company info...');
               await laodCompanyInfor();
               console.log('Data fetch completed successfully');

          } catch (err: any) {
               console.error('Failed to load data:', err);
               setError(err?.message || 'Failed to load data');
          } finally {
               console.log('Setting loading to false');
               setLoading(false);
          }
     };

     const handleRetry = () => {
          setRetryCount(prev => prev + 1);
          fetchData();
     };

     useEffect(() => {
          const timeoutId = setTimeout(() => {
               console.log('Loading timeout reached, forcing loading to false');
               setLoading(false);
               if (!error) {
                    setError('Loading timeout - please check your connection and try again');
               }
          }, 30000);

          fetchData();

          return () => clearTimeout(timeoutId);
     }, [retryCount]);



     const generatePosReceipt = async () => {
          if (!billingData || !companyInfo) return;

          try {
               const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [80, 297]
               });

               const pageWidth = pdf.internal.pageSize.getWidth();
               let yPosition = 10;

               const now = new Date();
               const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
               const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

               const total = parseFloat(billingData.totalcost || '0');

               const subtotal = services.reduce((sum, service) => sum + parseFloat(service.totalcost || '0'), 0);
               const tax = services.reduce((sum, service) => sum + parseFloat(service.taxValue || '0'), 0);
               const discount = services.reduce((sum, service) => sum + parseFloat(service.discount || '0'), 0);

               const formatCurrency = (amount: number) => `GHS ${amount.toFixed(2)}`;

               const companyName = companyInfo.name || 'COMPANY NAME';

               const splitTextIntoLines = (text: string, maxCharsPerLine: number = 20): string[] => {
                    const words = text.split(' ');
                    const lines: string[] = [];
                    let currentLine = '';

                    for (const word of words) {
                         if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                              currentLine = currentLine ? currentLine + ' ' + word : word;
                         } else {
                              if (currentLine) lines.push(currentLine);
                              currentLine = word;
                         }
                    }
                    if (currentLine) lines.push(currentLine);

                    return lines;
               };

               const companyNameLines = splitTextIntoLines(companyName, 20);

               pdf.setFontSize(10);
               pdf.setFont('times', 'bold');

               companyNameLines.forEach((line, index) => {
                    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 5;
               });

               pdf.setFontSize(10);
               pdf.setFont('times', 'normal');
               pdf.text('POINT OF SALE RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 6;

               pdf.setFontSize(7);
               pdf.setFont('times', 'normal');
               const address = companyInfo.address || 'Address not available';
               const phone = String(companyInfo.phonenumber || 'Phone not available');

               const maxContactLength = 35;
               const displayAddress = address.length > maxContactLength
                    ? address.substring(0, maxContactLength - 3) + '...'
                    : address;
               const displayPhone = `Tel: ${phone}`.length > maxContactLength
                    ? `Tel: ${phone}`.substring(0, maxContactLength - 3) + '...'
                    : `Tel: ${phone}`;

               pdf.text(displayAddress, pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 3;
               pdf.text(displayPhone, pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 6;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 5;

               pdf.setFontSize(10);
               pdf.setFont('times', 'bold');
               pdf.text('SERVICES RENDERED', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(8);
               pdf.setFont('times', 'bold');
               pdf.text('SERVICE', 5, yPosition);
               pdf.text('AMOUNT', pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 3;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFont('times', 'normal');
               services.forEach((service) => {
                    const cost = parseFloat(service.totalcost || '0');
                    const serviceName = service.name.length > 25 ? service.name.substring(0, 22) + '...' : service.name;

                    pdf.text(serviceName, 5, yPosition);
                    pdf.text(formatCurrency(cost), pageWidth - 5, yPosition, { align: 'right' });
                    yPosition += 4;
               });

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(8);
               pdf.setFont('times', 'bold');
               pdf.text('SUBTOTAL', 5, yPosition);
               pdf.text(formatCurrency(subtotal), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('TAX', 5, yPosition);
               pdf.text(formatCurrency(tax), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('DISCOUNT', 5, yPosition);
               pdf.text(formatCurrency(discount), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(10);
               pdf.text('TOTAL AMOUNT', 5, yPosition);
               pdf.text(formatCurrency(total), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 6;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(10);
               pdf.setFont('times', 'bold');
               pdf.text('PAYMENT SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(8);
               pdf.setFont('times', 'normal');
               const paid = parseFloat(billingData.paid || '0');
               const balance = parseFloat(billingData.balance || '0');
               const outstanding = parseFloat(billingData.outstanding || '0');
               const refunded = parseFloat(billingData.totalrefunded || '0');
               pdf.text(`Total Amount:`, 5, yPosition);
               pdf.text(formatCurrency(total), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 4;
               pdf.text(`Amount Paid:`, 5, yPosition);
               pdf.text(formatCurrency(paid), pageWidth - 5, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.setFont('times', 'bold');
               pdf.text(`Payment Status: ${parseFloat(billingData.balance || '0') <= 0 ? 'FULLY PAID' : 'PARTIAL PAYMENT'}`, 5, yPosition);
               yPosition += 4;
               pdf.text('Payment Method: CASH / POS', 5, yPosition);
               yPosition += 6;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(8);
               pdf.setFont('times', 'bold');
               pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.setFontSize(7);
               pdf.setFont('times', 'normal');
               pdf.text('This is a system-generated receipt.', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 3;
               pdf.text('Please retain for your records.', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });

               pdf.autoPrint();
               const pdfBlob = pdf.output('blob');
               const pdfUrl = URL.createObjectURL(pdfBlob);
               const printWindow = window.open(pdfUrl, '_blank');

               if (printWindow) {
                    printWindow.onload = () => {
                         printWindow.print();
                         URL.revokeObjectURL(pdfUrl);
                    };
               } else {
                    pdf.save(`pos_receipt_${billingData.billingid}.pdf`);
               }

          } catch (error) {
               console.error('POS receipt generation failed:', error);
               alert('Failed to generate POS receipt');
          }
     };

     return (
          <>

               <style jsx>{`
  @media print {
    #receipt-content {
      border: none !important;
      max-width: 210mm !important;
      margin: 0 auto !important;
    }
      th{
       font-size: 15px !important;
       font-weight: bold !important;
      }
      td{
       font-size: 11px !important;
      }
  }
`}</style>
               <div className="px-4 py-3">
                    <div className="row justify-content-center">
                         <div className="col-12 col-lg-10">
                              {/* Print-friendly A4 layout */}
                              <div id="receipt-content" className="bg-white border" style={{ maxWidth: '210mm', margin: '0 auto', fontSize: '12px' }}>
                                   {/* Print Button */}
                                   <div className="text-end p-2 border-bottom">
                                        <button
                                             className="btn btn-primary btn-sm"
                                             onClick={() => window.print()}
                                        >
                                             🖨️ Print A4 Receipt
                                        </button>
                                   </div>

                                   {/* Company Header */}
                                   <div className="text-center p-3 border-bottom">
                                        <CompanyHeaders
                                             companyInfo={companyInfo}
                                             logo={companyLogoUrl}
                                             resultsettings={null}
                                        />
                                   </div>

                                   {/* Invoice and Patient Information */}
                                   <div className="p-3 border-bottom">
                                        <div className="row">
                                             <div className="col-6">
                                                  <p className="mb-0"><strong>Invoice #:</strong> {billingData?.billingid || 'Loading...'}</p>
                                                  <p className="mb-0"><strong>Date:</strong> {billingData ? new Date(billingData.billedon).toLocaleDateString() : 'Loading...'}</p>
                                                  <p className="mb-1"><strong>Patient ID:</strong> {billingData?.patientid}</p>
                                             </div>
                                             <div className="col-6 text-end">
                                                  <p className="mb-0"><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                                                  <p className="mb-1"><strong>Billing Date:</strong> {billingData?.billedon ? new Date(billingData.billedon).toLocaleDateString() : 'N/A'}</p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Services Table */}
                                   <div className="p-3 border-bottom">
                                        <h5 className="mb-3">Services Rendered</h5>
                                        {services && services.length > 0 ? (
                                             <table className="table table-bordered ">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th style={{ width: '5%' }}>#</th>
                                                            <th style={{ width: '50%' }}>Service Description</th>
                                                            <th style={{ width: '15%' }} className="text-center">Qty</th>
                                                            <th style={{ width: '15%' }} className="text-end">Unit Price</th>
                                                            <th style={{ width: '15%' }} className="text-end">Total</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {services.map((service, index) => (
                                                            <tr key={service.serviceid}>
                                                                 <td>{index + 1}</td>
                                                                 <td>
                                                                      <div>
                                                                           <strong>{service.name}</strong>
                                                                           {service.medicalCode && (
                                                                                <div className="small text-muted">Code: {service.medicalCode}</div>
                                                                           )}
                                                                      </div>
                                                                 </td>
                                                                 <td className="text-center">1</td>
                                                                 <td className="text-end">{currencyFormatter.format(parseFloat(service.totalcost || '0'))}</td>
                                                                 <td className="text-end">{currencyFormatter.format(parseFloat(service.totalcost || '0'))}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                                  <tfoot>
                                                       <tr className="table-light">
                                                            <td colSpan={4} className="text-end"><strong>Subtotal:</strong></td>
                                                            <td className="text-end"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.totalcost || '0'), 0))}</strong></td>
                                                       </tr>
                                                       {services.some(service => parseFloat(service.taxValue || '0') > 0) && (
                                                            <tr className="table-light">
                                                                 <td colSpan={4} className="text-end"><strong>Tax:</strong></td>
                                                                 <td className="text-end"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.taxValue || '0'), 0))}</strong></td>
                                                            </tr>
                                                       )}
                                                       {services.some(service => parseFloat(service.discount || '0') > 0) && (
                                                            <tr className="table-light">
                                                                 <td colSpan={4} className="text-end"><strong>Discount:</strong></td>
                                                                 <td className="text-end"><strong>-{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.discount || '0'), 0))}</strong></td>
                                                            </tr>
                                                       )}
                                                       <tr>
                                                            <td colSpan={4} className="text-end"><strong>TOTAL AMOUNT:</strong></td>
                                                            <td className="text-end"><strong className="fs-5">{currencyFormatter.format(parseFloat(billingData?.totalcost || '0'))}</strong></td>
                                                       </tr>
                                                  </tfoot>
                                             </table>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <div className="text-muted">Loading services data...</div>
                                             </div>
                                        )}
                                   </div>

                                   {/* Payment Information */}
                                   <div className="p-3 border-bottom">
                                        <h5 className="mb-2">Payment Details</h5>
                                        {billingData ? (
                                             <>
                                                  <div className="row">
                                                       <div className="col-6">
                                                            <p className="mb-1"><strong>Amount Paid:</strong> {currencyFormatter.format(parseFloat(billingData.paid || '0'))}</p>
                                                       </div>
                                                       <div className="col-6">
                                                            <p className="mb-1">
                                                                 <strong>Outstanding:</strong>
                                                                 <span className={parseFloat(billingData.balance || '0') > 0 ? 'text-danger' : 'text-success'}>
                                                                      {currencyFormatter.format(parseFloat(billingData.balance || '0'))}
                                                                 </span>
                                                            </p>
                                                       </div>
                                                  </div>
                                                  <div className="mt-2">
                                                       <strong>Payment Status:</strong>
                                                       <span className={`badge ms-2 ${parseFloat(billingData.balance || '0') <= 0 ? 'bg-success' : 'bg-warning'}`}>
                                                            {parseFloat(billingData.balance || '0') <= 0 ? 'FULLY PAID' : 'PARTIAL PAYMENT'}
                                                       </span>
                                                  </div>
                                             </>
                                        ) : (
                                             <div className="text-center py-2">
                                                  <div className="text-muted">Loading payment data...</div>
                                             </div>
                                        )}
                                   </div>


                                   {/* Footer */}
                                   <div className="p-3 text-center bg-light">
                                        <p className="mb-1"><strong>Thank you for choosing {companyInfo?.name || ' our company'}!</strong></p>
                                        <p className="small mb-1">For inquiries: Call {companyInfo?.phonenumber || '+233 24 123 4567'}</p>
                                        <p className="small mb-0">This is a system-generated receipt. Keep for your records.</p>
                                        <hr className="my-2" />
                                        <p className="small text-muted">Generated on {new Date().toLocaleString()}</p>
                                   </div>
                              </div>

                              {/* Print Buttons */}
                              <div className="text-center mt-4">
                                   <button
                                        className="btn btn-primary btn-lg me-2"
                                        onClick={generatePosReceipt}
                                   >
                                        🖨️ Print Simple POS Receipt
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
}