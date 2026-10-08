"use client";

import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { apiPath } from "../../../../lib/apiBaseUrl";
import CompanyHeaders, { CompanyHeadersProps } from "../../../../components/ResultView/CompanyHeaders";
import { customFetch, currencyFormatter, customPost } from "../../../../components/Auth/customFetch";
import { useTheme } from "../../../../components/ThemeProvider";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import dayjs from "dayjs";

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
     billingSource?: string;
}

interface ServiceData {
     serviceid: number;
     billingid: number;
     trackId: number;
     cost: string;
     employeeid: number;
     serviceCategory: string;
     categoryTrackId: number;
     clinicianId: number | null;
     organizationId: number | null;
     registrationType: string;
     branchid: number;
     isoutsourced: number;
     outsourceid: number | null;
     serviceAddedOn: string;
     taxList: string | null;
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
     isCorrected: number | null;
     relatedbillingid: number | null;
     paidamount: string;
     paymentstatus: string;
     outstanding: string;
     outsourceprice: string;
     nhismembershipid: number | null;
     claimscheckcode: string | null;
     test_report_title: string;
     service_name: string;
}

interface PatientData {
     patientid: number;
     fullpatientid: string;
     designation: string;
     firstname: string;
     lastname: string;
     email: string;
     dob: string | null;
     age: number;
     gender: string;
     marital_status: string;
     mobile_number: string;
     agetype: string;
     occupation: string;
     date: string;
     activation_status: string;
     middlename: string;
     organization: string;
     contactpointer: string;
     whatAppcontact: string | null;
}

interface PaymentHistory {
     KeyID: number;
     Billingid: number;
     Date: string;
     PaymentMode: string;
     Amount: string;
     employeeid: number;
     type: string;
}

interface ReceiptData {
     receiptId: number;
     receiptNumber: string;
     billing: BillingData;
     patient: PatientData;
     services: ServiceData[];
     generatedAt: string;
     tenantId: number;
     paymenthistory: PaymentHistory[];
     companyInfo?: any;
}

interface ApiResponse {
     status: string;
     data: ReceiptData;
}


export default function PosReceiptTestPage() {
     const [billingData, setBillingData] = useState<BillingData | null>(null);
     const [services, setServices] = useState<ServiceData[]>([]);
     const [patientData, setPatientData] = useState<PatientData | null>(null);
     const [companyInfo, setCompanyInfo] = useState<CompanyHeadersProps['companyInfo'] | null>(null);
     const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
     const [receiptId, setReceiptId] = useState<number | null>(null);
     const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [retryCount, setRetryCount] = useState(0);
     const searchParams = useSearchParams();
     const billingid = searchParams?.get('billingid');
     const isPos = searchParams?.get('is_pos') === 'true';
     const { theme } = useTheme();
     const companyLogoUrl = apiPath('settings/companyprofile/images');

     const printedBy = useApplication()?.user?.username;
     const printedByRole = useApplication()?.user?.role;
     const { user, company } = useApplication();

     const fetchData = async () => {
          try {
               if (!billingid) {
                    setLoading(false);
                    setError('No billing ID available');
                    return;
               }
               setLoading(true);
               setError(null);

               const employeeid = user?.employeeid;
               const tenantId = company?.tenantId || 1;

               const response = await customFetch(`billing/client/generate/receipt?tenantId=${tenantId}&billingid=${billingid}&employeeid=${employeeid}`);
               if (response?.status === 'success' && response?.data) {
                    console.log('Billing Data:', response.data.billing);
                    console.log('Billing Source:', response.data.billing?.billingSource);
                    setBillingData(response.data.billing);
                    setPatientData(response.data.patient);
                    setServices(response.data.services);
                    setPaymentHistory(response.data.paymenthistory || []);
                    setReceiptId(response.data.receiptId);
                    setReceiptNumber(response.data.receiptNumber);

                    // Company info is already included in the receipt data
                    if (response.data.companyInfo) {
                         const companyData = response.data.companyInfo;
                         const companyInfoMapped = {
                              id: companyData.ID,
                              name: companyData.NAME,
                              email: companyData.EMAIL,
                              motto: companyData.MOTTO,
                              phonenumber: companyData.PHONENUMBER,
                              address: companyData.ADDRESS,
                              alternativenumber: companyData.ALTERNATIVENUMBER,
                              website: companyData.WEBSITE,
                              street: companyData.STREET,
                              additionalInfo: companyData.additionalInfo
                         };
                         setCompanyInfo(companyInfoMapped);
                    } else {
                         setCompanyInfo({
                              name: 'Company Name',
                              email: '',
                              motto: '',
                              address: '',
                              alternativenumber: '',
                              website: '',
                              additionalInfo: '',
                              phonenumber: 0
                         });
                    }
               } else {
                    throw new Error('No data found');
               }

          } catch (err: any) {
               console.error('Failed to load data:', err);
               setError(err?.message || 'Failed to load data');
          } finally {
               setLoading(false);
          }
     };

     const handleRetry = () => {
          setRetryCount(prev => prev + 1);
          fetchData();
     };

     useEffect(() => {
          fetchData();
     }, [retryCount]);

     // Auto-generate POS receipt if is_pos=true and data is ready
     useEffect(() => {
          if (isPos && !loading && !error && billingData && companyInfo) {
               generatePosReceipt();
          }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [isPos, loading, error, billingData, companyInfo]);



     const generatePosReceipt = async () => {
          if (!billingData || !companyInfo) return;

          try {
               const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [80, 297]
               });

               const pageWidth = pdf.internal.pageSize.getWidth();
               const leftMargin = 8;
               const rightMargin = pageWidth - 8;
               let yPosition = 10;

               const now = new Date();
               const dateStr = dayjs(now).format('DD-MM-YYYY');
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

               // Load company logo
               let logoImage: string | null = null;
               if (companyLogoUrl) {
                    try {
                         const response = await fetch(companyLogoUrl);
                         const blob = await response.blob();
                         const reader = new FileReader();
                         logoImage = await new Promise<string>((resolve) => {
                              reader.onload = () => resolve(reader.result as string);
                              reader.readAsDataURL(blob);
                         });
                    } catch (e) {
                    }
               }

               // Add company logo if available
               if (logoImage) {
                    pdf.addImage(logoImage, 'JPEG', pageWidth / 2 - 7.5, yPosition, 15, 15);
                    yPosition += 20;
               }

               const companyNameLines = splitTextIntoLines(companyName, 20);

               pdf.setFontSize(10);
               pdf.setFont('times', 'bold');

               companyNameLines.forEach((line, index) => {
                    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 5;
               });

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

               pdf.setFontSize(9);
               pdf.setFont('times', 'bold');
               pdf.text('PATIENT INFORMATION', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;
               pdf.setFont('times', 'normal');

               if (patientData) {
                    pdf.text('Patient ID:', leftMargin, yPosition);
                    pdf.text(patientData.fullpatientid, rightMargin, yPosition, { align: 'right' });
                    yPosition += 3;
                    pdf.text('Name:', leftMargin, yPosition);
                    pdf.text(`${patientData.designation} ${patientData.firstname} ${patientData.lastname}`, rightMargin, yPosition, { align: 'right' });
                    yPosition += 3;
                    pdf.text('Phone:', leftMargin, yPosition);
                    pdf.text(String(patientData.mobile_number), rightMargin, yPosition, { align: 'right' });
                    yPosition += 3;
               }

               pdf.text('Receipt #:', leftMargin, yPosition);
               pdf.text(receiptNumber || `RCP-${billingData?.billingid}-${Date.now()}`, rightMargin, yPosition, { align: 'right' });
               yPosition += 3;
               pdf.text('Bill ID:', leftMargin, yPosition);
               pdf.text(String(billingData?.billingid || 'N/A'), rightMargin, yPosition, { align: 'right' });
               yPosition += 3;
               pdf.text('Date:', leftMargin, yPosition);
               pdf.text(billingData ? dayjs(billingData.billedon).format("DD-MM-YYYY HH:MM"): 'N/A', rightMargin, yPosition, { align: 'right' });
               yPosition += 3;
               pdf.text('Printed:', leftMargin, yPosition);
               pdf.text(`${dateStr} ${timeStr}`, rightMargin, yPosition, { align: 'right' });
               yPosition += 3;

               const isNHIS = services.some(service => service.serviceCategory === 'NHIS');
               if (isNHIS) {
                    pdf.setFont('times', 'bold');
                    pdf.setFontSize(8);
                    pdf.text('Billing Type:', leftMargin, yPosition);
                    pdf.text('NHIS', rightMargin, yPosition, { align: 'right' });
                    yPosition += 3;
                    pdf.setFont('times', 'normal');
               }

               yPosition += 3;

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
               pdf.text('SERVICE', leftMargin, yPosition);
               pdf.text('AMOUNT', rightMargin, yPosition, { align: 'right' });
               yPosition += 3;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFont('times', 'normal');
               services.forEach((service) => {
                    const cost = parseFloat(service.totalcost || '0');
                    const serviceName = (service.test_report_title || service.service_name);
                    const displayName = serviceName.length > 25 ? serviceName.substring(0, 22) + '...' : serviceName;

                    pdf.text(displayName, leftMargin, yPosition);
                    pdf.text(formatCurrency(cost), rightMargin, yPosition, { align: 'right' });
                    yPosition += 4;
               });

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(9);
               pdf.setFont('times', 'bold');
               pdf.text('SUBTOTAL', leftMargin, yPosition);
               pdf.text(formatCurrency(subtotal), rightMargin, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('TAX', leftMargin, yPosition);
               pdf.text(formatCurrency(tax), rightMargin, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('DISCOUNT', leftMargin, yPosition);
               pdf.text(formatCurrency(discount), rightMargin, yPosition, { align: 'right' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(9);
               pdf.text('TOTAL AMOUNT', leftMargin, yPosition);
               pdf.text(formatCurrency(total), rightMargin, yPosition, { align: 'right' });
               yPosition += 6;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(9);
               pdf.setFont('times', 'bold');
               pdf.text('PAYMENT SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });
               yPosition += 3;

               pdf.setFontSize(8);
               pdf.setFont('times', 'normal');
               const paid = parseFloat(billingData.paid || '0');
               const balance = parseFloat(billingData.balance || '0');
               const outstanding = total - paid;
               const refunded = parseFloat(billingData.totalrefunded || '0');
               pdf.text(`Total Amount:`, leftMargin, yPosition);
               pdf.text(formatCurrency(total), rightMargin, yPosition, { align: 'right' });
               yPosition += 4;
               pdf.text(`Amount Paid:`, leftMargin, yPosition);
               pdf.text(formatCurrency(paid), rightMargin, yPosition, { align: 'right' });
               yPosition += 4;

               // Show outstanding amount for partial payments
               if (paid < total && !isNHIS) {
                    pdf.text(`Outstanding:`, leftMargin, yPosition);
                    pdf.text(formatCurrency(outstanding), rightMargin, yPosition, { align: 'right' });
                    yPosition += 4;
               }

               if (isNHIS && outstanding > 0) {
                    pdf.text(`Insurance Claim:`, leftMargin, yPosition);
                    pdf.text(formatCurrency(outstanding), rightMargin, yPosition, { align: 'right' });
                    yPosition += 4;
               }

               pdf.setFont('times', 'bold');
               const paymentStatus = isNHIS ? 'INSURANCE CLAIM' : (paid >= total ? 'FULLY PAID' : 'PARTIAL PAYMENT');
               pdf.text(`Payment Status: ${paymentStatus}`, leftMargin, yPosition);
               yPosition += 4;

               const paymentMethodText = isNHIS ? 'NHIS (Insurance Claim)' : 'CASH / POS';
               pdf.text(`Payment Method: ${paymentMethodText}`, leftMargin, yPosition);
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
               yPosition += 3;
               pdf.text(`Printed by: ${printedBy} (${printedByRole})`, pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;

               pdf.text('----------------------------------------------------------------------------------------------------', 0, yPosition, { align: 'left' });

               // autoPrint() embeds a flag in the PDF that tells the PDF viewer to open the print dialog automatically
               pdf.autoPrint();
               const pdfBlob = pdf.output('blob');
               const blobUrl = URL.createObjectURL(pdfBlob);
               const printWindow = window.open(blobUrl, '_blank');
               if (printWindow) {
                    // Revoke the blob URL after the window has had time to load
                    printWindow.addEventListener('load', () => {
                         setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                    });
                    // Safety fallback revoke
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
               } else {
                    URL.revokeObjectURL(blobUrl);
                    toast.warning('Popups are blocked. Please allow popups for this site to print receipts.');
               }

               // Update receipt as printed
               try {
                    if (receiptId) {
                         const response = await customPost(`receipt/update/printed?employeeid=${user?.employeeid}`, 'POST', { receiptId, employeeid: user?.employeeid, printed_at: new Date().toISOString() });
                         const { status, message } = response;
                         if (status === 'success') {
                              toast.success(message || 'Receipt print status updated successfully');
                         } else {
                              toast.error(`Failed to update receipt print status: ${message}`);
                         }
                    }
               } catch (updateError) {
                    console.error('Failed to update receipt print status:', updateError);
               }

          } catch (error) {
               console.error('POS receipt generation failed:', error);
               alert('Failed to generate POS receipt');
          }
     };

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <div className="text-center">
                              <div className="spinner-border text-primary mb-3" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <h5>Loading receipt data...</h5>
                              <p className="text-muted">Please wait while we fetch your billing information.</p>
                         </div>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <div className="text-center">
                              <div className="alert alert-danger" role="alert">
                                   <h5 className="alert-heading">Error Loading Data</h5>
                                   <p>{error}</p>
                                   <button className="btn btn-primary" onClick={handleRetry}>
                                        Retry
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <>
               <style jsx global>{`
               body {
               background-color: ${theme === 'dark' ? '#121212' : '#f0f0f0'};
               color: ${theme === 'dark' ? '#e0e0e0' : '#121212'};
               margin: 0;
               padding: 0;
               }

             @media print {
               #receipt-content {
              width: 210mm;
                    height: 297mm;
                    border: none !important;
                    box-shadow: none !important;
                    margin: 0 !important;
                    padding : 0 !important;
               }
               body, html {
                    margin: 0;
             }

             #main-ci {
                    -webkit-print-color-adjust: exact;
                    margin: 0 !important;
                    padding: 0 !important;
               }

               tr {
                    page-break-inside: avoid;
               
                    }

                    tr:nth-child(odd) {
                         background-color: ${theme === 'dark' ? '#2c2c2c' : '#f9f9f9'} !important;
                    }
                         th {
                           backgrond-color: ${theme === 'dark' ? '#3a3a3a' : '#e0e0e0'} !important;
                           color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
                           font-weight: bold !important;
                         }
             }
          `}</style>
               <div className="px-4 py-3" id="main-ci">
                    <div >
                         <div >
                              {/* Print-friendly A4 layout */}
                              <div id="receipt-content" className="bg-body border" >
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
                                                  <p className="mb-0"><strong>Patient ID:</strong> {patientData?.fullpatientid || billingData?.patientid}</p>
                                                  <p className="mb-0"><strong>Name:</strong> {patientData ? `${patientData.designation} ${patientData.firstname} ${patientData.lastname}` : 'Loading...'}</p>
                                                  <p className="mb-0"><strong>Receipt #:</strong> {receiptNumber || `RCP-${billingData?.billingid}-${Date.now()}`}</p>
                                                  {services.some(service => service.serviceCategory === 'NHIS') && (
                                                       <p className="mb-0"><strong>Billing Type:</strong> <span className="badge bg-info">NHIS</span></p>
                                                  )}
                                             </div>
                                             <div className="col-6 text-end">
                                                  <p className="mb-0"><strong>Generated:</strong> {dayjs().format('DD-MM-YYYY HH:mm:ss')}</p>
                                                  <p className="mb-1"><strong>Billing Date:</strong> {billingData?.billedon ? dayjs(billingData.billedon).format("DD-MM-YYYY HH:mm:ss") : 'N/A'}</p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Services Table */}
                                   <div className="p-3 border-bottom">
                                        <h5 className="mb-3">Services Rendered</h5>
                                        {services && services.length > 0 ? (
                                             <table className="table table-bordered">
                                                  <thead className="table-active">
                                                       <tr>
                                                            <th style={{ width: '5%' }}>#</th>
                                                            <th style={{ width: '30%' }}>Service Description</th>
                                                            <th style={{ width: '10%' }} className="text-center">Qty</th>
                                                            <th style={{ width: '12%' }} className="text-start">Payable</th>
                                                            <th style={{ width: '12%' }} className="text-start">Paid</th>
                                                            <th style={{ width: '12%' }} className="text-start">Discount</th>
                                                            <th style={{ width: '12%' }} className="text-start">Outstanding</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {services.map((service, index) => (
                                                            <tr key={service.serviceid}>
                                                                 <td>{index + 1}</td>
                                                                 <td>
                                                                      <div>
                                                                           <strong>{service.test_report_title || service.service_name}</strong>
                                                                      </div>
                                                                 </td>
                                                                 <td className="text-center">1</td>
                                                                 <td className="text-start">{currencyFormatter.format(parseFloat(service.totalpayable || '0'))}</td>
                                                                 <td className="text-start">{currencyFormatter.format(parseFloat(service.paidamount || '0'))}</td>
                                                                 <td className="text-start">{currencyFormatter.format(parseFloat(service.discount || '0'))}</td>
                                                                 <td className="text-start">{currencyFormatter.format(parseFloat(service.outstanding || '0'))}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                                  <tfoot>
                                                       <tr className="table-active">
                                                            <td colSpan={3} className="text-end"><strong>Totals:</strong></td>
                                                            <td className="text-start"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.totalpayable || '0'), 0))}</strong></td>
                                                            <td className="text-start"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.paidamount || '0'), 0))}</strong></td>
                                                            <td className="text-start"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.discount || '0'), 0))}</strong></td>
                                                            <td className="text-start"><strong>{currencyFormatter.format(services.reduce((sum, service) => sum + parseFloat(service.outstanding || '0'), 0))}</strong></td>
                                                       </tr>
                                                       <tr>
                                                            <td colSpan={3} className="text-end"><strong>TOTAL AMOUNT:</strong></td>
                                                            <td colSpan={4} className="text-start"><strong className="fs-5">{currencyFormatter.format(parseFloat(billingData?.totalcost || '0'))}</strong></td>
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
                                                            <p className="mb-1"><strong>Total Amount:</strong> {currencyFormatter.format(parseFloat(billingData.totalcost || '0'))}</p>
                                                       </div>
                                                  </div>
                                                  {parseFloat(billingData.paid || '0') < parseFloat(billingData.totalcost || '0') && (
                                                       <div className="row mt-2">
                                                            <div className="col-12">
                                                                 <p className="mb-1">
                                                                      <strong>Outstanding:</strong>
                                                                      <span className="text-danger ms-2">
                                                                           {currencyFormatter.format(parseFloat(billingData.totalcost || '0') - parseFloat(billingData.paid || '0'))}
                                                                      </span>
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  )}
                                                  <div className="mt-2">
                                                       <strong>Payment Status:</strong>
                                                       <span className={`badge ms-2 ${parseFloat(billingData.paid || '0') >= parseFloat(billingData.totalcost || '0') ? 'bg-success' : 'bg-warning'}`}>
                                                            {parseFloat(billingData.paid || '0') >= parseFloat(billingData.totalcost || '0') ? 'FULLY PAID' : 'PARTIAL PAYMENT'}
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
                                   <div className="p-3 text-center bg-body-secondary">
                                        <p className="mb-1"><strong>Thank you for choosing {companyInfo?.name || ' our company'}!</strong></p>
                                        <p className="small mb-1">For inquiries: Call {companyInfo?.phonenumber || '+233 24 123 4567'}</p>
                                        <p className="small mb-0">This is a system-generated receipt. Keep for your records.</p>
                                        <hr className="my-2" />
                                        <p className="small text-muted">Generated on {new Date().toLocaleString()}</p>
                                        <p className="small text-muted">Printed by: {printedBy} ({printedByRole})</p>
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