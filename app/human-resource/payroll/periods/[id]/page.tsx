'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { PayrollStatusBadge } from '../../../../../components/HR/Payroll/StatusBadges';
import { WorkflowActions } from '../../../../../components/HR/Payroll/WorkflowActions';
import { currencyFormatter, formatDate } from '../../../../../components/HR/Payroll/utils';
import {
     RiCalendarLine,
     RiArrowLeftLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiUserLine,
     RiMoneyDollarCircleLine,
     RiFileListLine,
     RiEyeLine,
     RiDownloadLine
} from '@remixicon/react';

interface PayrollPeriod {
     id: number;
     period_name: string;
     period_year: number;
     period_month: number;
     period_start_date: string;
     period_end_date: string;
     status: 'draft' | 'calculated' | 'approved' | 'locked' | 'paid';
     total_gross_salary: number;
     total_deductions: number;
     total_net_salary: number;
     employee_count: number;
}

interface PayrollTransaction {
     id: number;
     payroll_period_id: number;
     employeeid: number;
     employee_name: string;
     employee_role: string;
     email: string;
     branch_name: string;
     basic_salary: string | number | null;
     hourly_earnings: string | number | null;
     overtime_earnings: string | number | null;
     commission_earnings: string | number | null;
     total_allowances: string | number | null;
     total_bonuses: string | number | null;
     gross_salary: string | number | null;
     income_tax: string | number | null;
     employee_ssnit: string | number | null;
     employer_ssnit: string | number | null;
     employee_tier3: string | number | null;
     employer_tier3: string | number | null;
     nhis: string | number | null;
     total_other_deductions: string | number | null;
     total_deductions: string | number | null;
     net_salary: string | number | null;
     employer_cost: string | number | null;
     days_worked: number | null;
     hours_worked: string | number | null;
     overtime_hours: string | number | null;
     days_absent: number | null;
     days_leave: number | null;
     status: string;
     payment_date: string | null;
     payment_method: string | null;
     payment_reference: string | null;
     allowances_detail: string;
     bonuses_detail: string;
     other_deductions_detail: string;
     created_at: string;
     updated_at: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function PayrollPeriodDetailPage() {
     const params = useParams();
     const router = useRouter();
     const periodId = params?.id as string;
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [period, setPeriod] = useState<PayrollPeriod | null>(null);
     const [transactions, setTransactions] = useState<PayrollTransaction[]>([]);
     const [loading, setLoading] = useState(true);
     const [actionLoading, setActionLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [showPaymentModal, setShowPaymentModal] = useState(false);
     const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
     const [paymentMethod, setPaymentMethod] = useState('');
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(10);
     const [totalCount, setTotalCount] = useState(0);
     const [selectedTransaction, setSelectedTransaction] = useState<PayrollTransaction | null>(null);
     const [showTransactionModal, setShowTransactionModal] = useState(false);
     const [showPayslipModal, setShowPayslipModal] = useState(false);
     const [payslipPreviewUrl, setPayslipPreviewUrl] = useState<string | null>(null);
     const [payslipDocRef, setPayslipDocRef] = useState<any>(null);
     const [payslipFileName, setPayslipFileName] = useState<string>('');
     const [payslipGenerating, setPayslipGenerating] = useState<number | null>(null);

     useEffect(() => {
          if (periodId) {
               fetchPeriodDetails();
               fetchTransactions();
          }
     }, [periodId]);

     useEffect(() => {
          if (periodId) {
               fetchTransactions(currentPage, pageSize);
          }
     }, [currentPage, pageSize]);

     const fetchPeriodDetails = async () => {
          try {
               const response = await customFetch(`payroll/periods/${periodId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setPeriod(response.result);
               } else {
                    setError('Failed to load period details');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching period details');
          } finally {
               setLoading(false);
          }
     };

     const fetchTransactions = async (page: number = currentPage, size: number = pageSize) => {
          try {
               const response = await customFetch(`payroll/periods/${periodId}/transactions?page=${page}&count=${size}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setTransactions(response.result?.data || []);
                    setTotalCount(response.result?.total || 0);
               }
          } catch (err: any) {
               console.error('Error fetching transactions:', err);
          }
     };

     const handleApprove = async () => {
          if (!user?.employeeid) return;

          setActionLoading(true);
          try {
               const response = await customPost(
                    `payroll/periods/${periodId}/approve`,
                    'POST',
                    { approved_by: user.employeeid }
               );

               if (response?.status === 'success') {
                    await fetchPeriodDetails();
                    alert('Payroll period approved successfully');
               } else {
                    alert(response?.message || 'Failed to approve payroll');
               }
          } catch (err: any) {
               alert(err?.message || 'Error approving payroll');
          } finally {
               setActionLoading(false);
          }
     };

     const handleLock = async () => {
          if (!user?.employeeid) return;

          setActionLoading(true);
          try {
               const response = await customPost(
                    `payroll/periods/${periodId}/lock`,
                    'POST',
                    { locked_by: user.employeeid }
               );

               if (response?.status === 'success') {
                    await fetchPeriodDetails();
                    alert('Payroll period locked successfully');
               } else {
                    alert(response?.message || 'Failed to lock payroll');
               }
          } catch (err: any) {
               alert(err?.message || 'Error locking payroll');
          } finally {
               setActionLoading(false);
          }
     };

     const handleMarkPaid = async (paymentDate: string, paymentMethod: string) => {
          if (!user?.employeeid) return;

          setActionLoading(true);
          try {
               const response = await customPost(
                    `payroll/periods/${periodId}/mark-paid`,
                    'POST',
                    {
                         paid_by: user.employeeid,
                         payment_date: paymentDate,
                         payment_method: paymentMethod,
                         branchid: applicationsettings?.branchid,
                         employeeid: user.employeeid
                    }
               );

               if (response?.status === 'success') {
                    await fetchPeriodDetails();
                    alert('Payroll period marked as paid successfully');
               } else {
                    alert(response?.message || 'Failed to mark as paid');
               }
          } catch (err: any) {
               alert(err?.message || 'Error marking as paid');
          } finally {
               setActionLoading(false);
          }
     };

     const openPaymentModal = () => {
          setPaymentDate(new Date().toISOString().split('T')[0]);
          setPaymentMethod('');
          setShowPaymentModal(true);
     };

     const confirmMarkPaid = async () => {
          if (!paymentDate || !paymentMethod) {
               alert('Please fill in all payment details');
               return;
          }
          await handleMarkPaid(paymentDate, paymentMethod);
          setShowPaymentModal(false);
     };

     const viewTransactionDetails = (transaction: PayrollTransaction) => {
          setSelectedTransaction(transaction);
          setShowTransactionModal(true);
     };

     const loadImageAsDataURL = async (url: string): Promise<string | null> => {
          try {
               const res = await fetch(url);
               if (!res.ok) return null;
               const blob = await res.blob();
               if (!blob || blob.size === 0) return null;
               return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
               });
          } catch {
               return null;
          }
     };

     const generatePayslipDocument = async (transaction: PayrollTransaction) => {
          if (!period) return null;

          const companyResponse = await customFetch('settings/companyprofile');
          const company = companyResponse?.result || companyResponse || {};

          const baseUrl = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
          const logoDataUrl = baseUrl ? await loadImageAsDataURL(`${baseUrl}settings/companyprofile/images`) : null;

          const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 10;
          let yPos = margin;

          const fmt = (value: number | string | null | undefined) => {
               const num = Number(value ?? 0);
               return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
          };

          const headCellStyle = { fontStyle: 'bold' as const, fillColor: [235, 235, 235] as [number, number, number], fontSize: 8, textColor: [0, 0, 0] as [number, number, number] };
          const valueCellStyle = { fontSize: 8, textColor: [0, 0, 0] as [number, number, number] };

          // Outer letterhead border box
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.4);

          if (logoDataUrl) {
               try { doc.addImage(logoDataUrl, 'PNG', margin, yPos, 18, 18); } catch { /* ignore bad image */ }
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text((company.name || 'COMPANY NAME').toUpperCase(), pageWidth / 2, yPos + 6, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          if (company.motto) {
               doc.text(company.motto, pageWidth / 2, yPos + 11, { align: 'center' });
          }
          const addrLine = [
               company.address,
               company.phonenumber ? `Tel: 0${company.phonenumber}` : '',
               company.email
          ].filter(Boolean).join('   |   ');
          if (addrLine) {
               doc.text(addrLine, pageWidth / 2, yPos + 15, { align: 'center' });
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('PAYSLIP', pageWidth / 2, yPos + 21, { align: 'center' });

          yPos += 26;

          // PARTICULARS GRID
          autoTable(doc, {
               startY: yPos,
               margin: { left: margin, right: margin },
               theme: 'grid',
               styles: { lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding: 1.5 },
               body: [
                    [
                         { content: 'DATE', styles: headCellStyle }, { content: formatDate(new Date().toISOString()), styles: valueCellStyle },
                         { content: 'COMPANY', styles: headCellStyle }, { content: company.name || 'N/A', styles: valueCellStyle }
                    ],
                    [
                         { content: 'PERIOD', styles: headCellStyle }, { content: `FROM ${formatDate(period.period_start_date)} TO ${formatDate(period.period_end_date)}`, styles: valueCellStyle },
                         { content: 'BRANCH', styles: headCellStyle }, { content: transaction.branch_name || 'N/A', styles: valueCellStyle }
                    ],
                    [
                         { content: 'NAME', styles: headCellStyle }, { content: transaction.employee_name, styles: valueCellStyle },
                         { content: 'STAFF ID', styles: headCellStyle }, { content: String(transaction.employeeid), styles: valueCellStyle }
                    ],
                    [
                         // { content: 'POSITION', styles: headCellStyle }, { content: transaction.employee_role.toUpperCase(), styles: valueCellStyle },
                         { content: 'STATUS', styles: headCellStyle }, { content: transaction.status.toUpperCase(), styles: valueCellStyle }
                    ],
                    [
                         // { content: 'PAYMENT MODE', styles: headCellStyle }, { content: transaction.payment_method || 'PENDING', styles: valueCellStyle },
                         { content: 'PAYMENT DATE', styles: headCellStyle }, { content: transaction.payment_date ? formatDate(transaction.payment_date) : 'N/A', styles: valueCellStyle }
                    ]
               ],
               columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: (pageWidth - margin * 2) / 2 - 30 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: (pageWidth - margin * 2) / 2 - 30 }
               }
          });

          yPos = (doc as any).lastAutoTable.finalY;

          // TRANSACTION / PAYMENTS & DEDUCTIONS TABLE
          const monthYear = formatDate(period.period_end_date);
          const rows: any[] = [];
          let eIdx = 1;
          [
               ['Basic Salary', transaction.basic_salary],
               ['Hourly Earnings', transaction.hourly_earnings],
               ['Overtime Earnings', transaction.overtime_earnings],
               ['Commission', transaction.commission_earnings],
               ['Allowances', transaction.total_allowances],
               ['Bonuses', transaction.total_bonuses]
          ].forEach(([label, value]) => {
               const num = Number(value ?? 0);
               if (num > 0) {
                    rows.push([monthYear, 'EARNING', `E${String(eIdx).padStart(2, '0')}`, label, '-', fmt(num), '']);
                    eIdx++;
               }
          });
          let dIdx = 1;
          [
               ['Income Tax', transaction.income_tax],
               ['Employee SSNIT', transaction.employee_ssnit],
               ['Employee Tier 3', transaction.employee_tier3],
               ['NHIS', transaction.nhis],
               ['Other Deductions', transaction.total_other_deductions]
          ].forEach(([label, value]) => {
               const num = Number(value ?? 0);
               rows.push([monthYear, 'DEDUCTION', `D${String(dIdx).padStart(2, '0')}`, label, '-', '', fmt(num)]);
               dIdx++;
          });

          autoTable(doc, {
               startY: yPos,
               margin: { left: margin, right: margin },
               theme: 'grid',
               styles: { lineColor: [0, 0, 0], lineWidth: 0.2, fontSize: 7.5, cellPadding: 1.5 },
               head: [['MONTH/YEAR', 'NATURE', 'CODE', 'DESCRIPTION', 'RATE/HRS', 'PAYMENTS (GHS)', 'DEDUCTIONS (GHS)']],
               headStyles: { fillColor: [235, 235, 235], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
               body: rows,
               columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 22 },
                    2: { cellWidth: 14 },
                    3: { cellWidth: 'auto' },
                    4: { cellWidth: 16, halign: 'center' },
                    5: { cellWidth: 26, halign: 'right' },
                    6: { cellWidth: 28, halign: 'right' }
               },
               foot: [[
                    { content: 'TOTALS', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: fmt(transaction.gross_salary), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: fmt(transaction.total_deductions), styles: { halign: 'right', fontStyle: 'bold' } }
               ]],
               footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 8 }
          });

          yPos = (doc as any).lastAutoTable.finalY + 4;

          // SUMMARY GRID
          autoTable(doc, {
               startY: yPos,
               margin: { left: margin, right: margin },
               theme: 'grid',
               styles: { lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding: 1.5 },
               body: [
                    [
                         { content: 'GROSS SALARY', styles: headCellStyle }, { content: fmt(transaction.gross_salary), styles: valueCellStyle },
                         { content: 'TOTAL DEDUCTIONS', styles: headCellStyle }, { content: fmt(transaction.total_deductions), styles: valueCellStyle },
                         { content: 'EMPLOYER SSNIT', styles: headCellStyle }, { content: fmt(transaction.employer_ssnit), styles: valueCellStyle }
                    ],
                    [
                         // { content: 'DAYS WORKED', styles: headCellStyle }, { content: String(transaction.days_worked ?? 0), styles: valueCellStyle },
                         // { content: 'HOURS WORKED', styles: headCellStyle }, { content: String(Number(transaction.hours_worked ?? 0)), styles: valueCellStyle },
                         { content: 'EMPLOYER TIER 3', styles: headCellStyle }, { content: fmt(transaction.employer_tier3), styles: valueCellStyle }
                    ]
               ]
          });

          yPos = (doc as any).lastAutoTable.finalY + 5;

          // NET SALARY HIGHLIGHT BOX
          const boxHeight = 14;
          if (yPos + boxHeight > pageHeight - 20) {
               doc.addPage();
               yPos = margin;
          }
          doc.setFillColor(230, 230, 230);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(margin, yPos, pageWidth - margin * 2, boxHeight, 'FD');
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('NET SALARY PAYABLE', margin + 4, yPos + boxHeight / 2, { baseline: 'middle' });
          doc.setFontSize(14);
          doc.text(`GHS ${fmt(transaction.net_salary)}`, pageWidth - margin - 4, yPos + boxHeight / 2, { align: 'right', baseline: 'middle' });

          yPos += boxHeight + 6;

          // FOOTER
          doc.setTextColor(90, 90, 90);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.5);
          doc.text('This document is system-generated and confidential. Unauthorized disclosure of salary information is prohibited.', pageWidth / 2, pageHeight - 12, { align: 'center', maxWidth: pageWidth - margin * 2 });
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 6);
          doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 6, { align: 'right' });
          doc.text(`© ${new Date().getFullYear()} ${company.name || 'Company'}. All rights reserved.`, pageWidth / 2, pageHeight - 6, { align: 'center' });

          const fileName = `Payslip_${transaction.employee_name.replace(/[^a-zA-Z0-9]/g, '_')}_${period.period_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          return { doc, fileName };
     };

     const handlePreviewPayslip = async (transaction: PayrollTransaction) => {
          setPayslipGenerating(transaction.id);
          try {
               const result = await generatePayslipDocument(transaction);
               if (!result) return;
               const { doc, fileName } = result;
               const url = doc.output('bloburl') as unknown as string;
               setPayslipDocRef(doc);
               setPayslipFileName(fileName);
               setPayslipPreviewUrl(url);
               setShowPayslipModal(true);
          } catch (error) {
               console.error('Error generating payslip:', error);
               alert('Error generating payslip. Please try again.');
          } finally {
               setPayslipGenerating(null);
          }
     };

     const handleDownloadFromPreview = () => {
          if (payslipDocRef && payslipFileName) {
               payslipDocRef.save(payslipFileName);
          }
     };

     const closePayslipPreview = () => {
          if (payslipPreviewUrl) {
               try { URL.revokeObjectURL(payslipPreviewUrl); } catch { /* ignore */ }
          }
          setShowPayslipModal(false);
          setPayslipPreviewUrl(null);
          setPayslipDocRef(null);
          setPayslipFileName('');
     };

     const handlePageChange = (page: number) => {
          setCurrentPage(page);
     };

     const handlePageSizeChange = (size: number) => {
          if (size < 1) return;
          setPageSize(size);
          setCurrentPage(1); // Reset to first page when changing page size
     };

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading payroll period...</p>
               </div>
          );
     }

     if (error || !period) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error || 'Period not found'}</p>
                         <Link href="/human-resource/payroll/periods" className="btn btn-primary mt-3">
                              Back to Periods
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center mb-4">
                    <Link href="/human-resource/payroll/periods" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="flex-grow-1">
                         <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                   <RiCalendarLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <div>
                                        <h1 className="h4 mb-0 fw-bold">{period.period_name}</h1>
                                        <p className="text-muted mb-0 small">
                                             {formatDate(period.period_start_date)} - {formatDate(period.period_end_date)}
                                        </p>
                                   </div>
                              </div>
                              <PayrollStatusBadge status={period.status} size="lg" />
                         </div>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiUserLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Employees</span>
                              </div>
                              <div className="fs-4 fw-bold">{period.employee_count}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Gross Salary</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(period.total_gross_salary)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-danger" />
                                   <span className="fw-medium text-muted small">Total Deductions</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(period.total_deductions)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Net Salary</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(period.total_net_salary)}</div>
                         </div>
                    </div>
               </div>

               {/* Workflow Actions */}
               <div className="mb-4">
                    <WorkflowActions
                         status={period.status}
                         periodId={period.id}
                         onApprove={handleApprove}
                         onLock={handleLock}
                         onMarkPaid={openPaymentModal}
                         loading={actionLoading}
                    />
               </div>

               {/* Transactions Table */}
               <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <div>
                              <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                   <RiFileListLine size={22} className="me-2" />
                                   Payroll Transactions
                              </h5>
                              <small className="text-muted">Showing {transactions.length} of {totalCount} transactions</small>
                         </div>
                         <button className="btn btn-sm btn-outline-primary">
                              <RiDownloadLine size={16} className="me-1" />
                              Export
                         </button>
                    </div>

                    {transactions.length === 0 ? (
                         <div className="text-center py-5">
                              <p className="text-muted">No transactions found for this period</p>
                              {period.status === 'draft' && (
                                   <Link href={`/human-resource/payroll/periods/process?periodId=${period.id}`} className="btn btn-primary mt-2">
                                        Process Payroll
                                   </Link>
                              )}
                         </div>
                    ) : (
                         <div className="table-responsive">
                              <table className="table table-hover table-sm">
                                   <thead className="table-light">
                                        <tr>
                                             <th className="text-start">Employee</th>
                                             <th className="text-start">Role</th>
                                             <th className="text-start">Branch</th>
                                             <th className="text-end">Basic Salary</th>
                                             <th className="text-end">Gross</th>
                                             <th className="text-end">Deductions</th>
                                             <th className="text-end">Net Salary</th>
                                             <th className="text-center">Status</th>
                                             <th></th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {transactions.map((txn) => (
                                             <tr key={txn.id}>
                                                  <td className="text-start">
                                                       <div className="fw-medium">{txn.employee_name}</div>
                                                       <div className="small text-muted">{txn.email}</div>
                                                  </td>
                                                  <td className="text-start">{txn.employee_role}</td>
                                                  <td className="text-start">{txn.branch_name}</td>
                                                  <td className="text-end">{currencyFormatter.format(Number(txn.basic_salary ?? 0))}</td>
                                                  <td className="text-end fw-medium">{currencyFormatter.format(Number(txn.gross_salary ?? 0))}</td>
                                                  <td className="text-end text-danger">{currencyFormatter.format(Number(txn.total_deductions ?? 0))}</td>
                                                  <td className="text-end fw-bold text-success">{currencyFormatter.format(Number(txn.net_salary ?? 0))}</td>
                                                  <td className="text-center">
                                                       <span className={`badge ${txn.status === 'paid' ? 'bg-success' : txn.status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {txn.status}
                                                       </span>
                                                  </td>
                                                  <td>
                                                       <div className="d-flex gap-2 justify-content-end">
                                                            <button
                                                                 className="btn btn-sm btn-outline-secondary"
                                                                 title="View Details"
                                                                 onClick={() => viewTransactionDetails(txn)}
                                                            >
                                                                 <RiEyeLine size={14} />
                                                            </button>
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 title="Preview Payslip"
                                                                 onClick={() => handlePreviewPayslip(txn)}
                                                                 disabled={payslipGenerating === txn.id}
                                                            >
                                                                 {payslipGenerating === txn.id ? (
                                                                      <RiLoader4Line size={14} className="animate-spin" />
                                                                 ) : (
                                                                      <RiDownloadLine size={14} />
                                                                 )}
                                                            </button>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot className="table-light fw-bold">
                                        <tr>
                                             <td colSpan={3} className="text-start">PAGE TOTAL</td>
                                             <td className="text-end">
                                                  {currencyFormatter.format(transactions.reduce((sum, txn) => sum + Number(txn.basic_salary ?? 0), 0))}
                                             </td>
                                             <td className="text-end">
                                                  {currencyFormatter.format(transactions.reduce((sum, txn) => sum + Number(txn.gross_salary ?? 0), 0))}
                                             </td>
                                             <td className="text-end text-danger">
                                                  {currencyFormatter.format(transactions.reduce((sum, txn) => sum + Number(txn.total_deductions ?? 0), 0))}
                                             </td>
                                             <td className="text-end text-success">
                                                  {currencyFormatter.format(transactions.reduce((sum, txn) => sum + Number(txn.net_salary ?? 0), 0))}
                                             </td>
                                             <td colSpan={2}></td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    )}

                    {/* Pagination Controls */}
                    {totalCount > 0 && (
                         <div className="d-flex justify-content-between align-items-center mt-3">
                              <div className="d-flex align-items-center gap-2">
                                   <span className="text-muted small">Show</span>
                                   <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        style={{ width: '80px' }}
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        min={1}
                                        max={Math.max(totalCount, 100)}
                                   />
                                   <span className="text-muted small">entries</span>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                   <span className="text-muted small">
                                        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                                   </span>
                                   <nav aria-label="Transaction pagination">
                                        <ul className="pagination pagination-sm mb-0">
                                             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(currentPage - 1)}
                                                       disabled={currentPage === 1}
                                                  >
                                                       Previous
                                                  </button>
                                             </li>

                                             {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                                                  const pageNum = Math.max(1, Math.min(
                                                       Math.ceil(totalCount / pageSize) - 4,
                                                       currentPage - 2
                                                  )) + i;

                                                  if (pageNum > Math.ceil(totalCount / pageSize)) return null;

                                                  return (
                                                       <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                                                            <button
                                                                 className="page-link"
                                                                 onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                 {pageNum}
                                                            </button>
                                                       </li>
                                                  );
                                             })}

                                             <li className={`page-item ${currentPage === Math.ceil(totalCount / pageSize) ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(currentPage + 1)}
                                                       disabled={currentPage === Math.ceil(totalCount / pageSize)}
                                                  >
                                                       Next
                                                  </button>
                                             </li>
                                        </ul>
                                   </nav>
                              </div>
                         </div>
                    )}
               </div>

               {/* Payment Modal */}
               {showPaymentModal && (
                    <div
                         className="modal show d-block"
                         tabIndex={-1}
                         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                         onClick={() => setShowPaymentModal(false)}
                    >
                         <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">Mark Payroll as Paid</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label htmlFor="paymentDate" className="form-label fw-medium">Payment Date</label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  id="paymentDate"
                                                  value={paymentDate}
                                                  onChange={(e) => setPaymentDate(e.target.value)}
                                                  required
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label htmlFor="paymentMethod" className="form-label fw-medium">Payment Method</label>
                                             <select
                                                  className="form-select"
                                                  id="paymentMethod"
                                                  value={paymentMethod}
                                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                                  required
                                             >
                                                  <option value="">Select payment method</option>
                                                  <option value="Bank Transfer">Bank Transfer</option>
                                                  <option value="Cash">Cash</option>
                                                  <option value="Cheque">Cheque</option>
                                                  <option value="Direct Deposit">Direct Deposit</option>
                                                  <option value="MoMo">MoMo(Mobile Money)</option>
                                             </select>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={confirmMarkPaid}
                                             disabled={actionLoading}
                                        >
                                             {actionLoading ? (
                                                  <>
                                                       <RiLoader4Line size={16} className="animate-spin me-2" />
                                                       Processing...
                                                  </>
                                             ) : (
                                                  'Mark as Paid'
                                             )}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Transaction Details Modal */}
               {showTransactionModal && selectedTransaction && (
                    <div
                         className="modal show d-block"
                         tabIndex={-1}
                         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                         onClick={() => setShowTransactionModal(false)}
                    >
                         <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">Payroll Transaction Details</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowTransactionModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        {/* Employee Information */}
                                        <div className="row g-3 mb-4">
                                             <div className="col-md-6">
                                                  <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Employee</div>
                                                       <div className="fw-bold">{selectedTransaction.employee_name}</div>
                                                       <div className="small text-muted">{selectedTransaction.email}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Role & Branch</div>
                                                       <div className="fw-bold">{selectedTransaction.employee_role}</div>
                                                       <div className="small text-muted">{selectedTransaction.branch_name}</div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Earnings Breakdown */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-success mb-3">Earnings Breakdown</h6>
                                             <div className="row g-3">
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Basic Salary</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.basic_salary ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Hourly Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.hourly_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Overtime Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.overtime_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Commission Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.commission_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Total Allowances</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_allowances ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Total Bonuses</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_bonuses ?? 0))}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Salary Summary */}
                                        <div className="row g-3 mb-4">
                                             <div className="col-md-4">
                                                  <div className="border rounded p-3 bg-success bg-opacity-10">
                                                       <div className="text-muted small mb-1">Gross Salary</div>
                                                       <div className="fw-bold fs-5 text-success">{currencyFormatter.format(Number(selectedTransaction.gross_salary ?? 0))}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="border rounded p-3 bg-danger bg-opacity-10">
                                                       <div className="text-muted small mb-1">Total Deductions</div>
                                                       <div className="fw-bold fs-5 text-danger">{currencyFormatter.format(Number(selectedTransaction.total_deductions ?? 0))}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="border rounded p-3 bg-primary bg-opacity-10">
                                                       <div className="text-muted small mb-1">Net Salary</div>
                                                       <div className="fw-bold fs-5 text-primary">{currencyFormatter.format(Number(selectedTransaction.net_salary ?? 0))}</div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Deductions Breakdown */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-danger mb-3">Deductions Breakdown</h6>
                                             <div className="row g-3">
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Income Tax</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.income_tax ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Employee SSNIT</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.employee_ssnit ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Employee Tier 3</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.employee_tier3 ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">NHIS</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.nhis ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Other Deductions</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_other_deductions ?? 0))}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Employer Contributions */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-info mb-3">Employer Contributions</h6>
                                             <div className="row g-3">
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Employer SSNIT</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.employer_ssnit ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3">
                                                            <div className="text-muted small mb-1">Employer Tier 3</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.employer_tier3 ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className="border rounded p-3 bg-info bg-opacity-10">
                                                            <div className="text-muted small mb-1">Total Employer Cost</div>
                                                            <div className="fw-bold fs-6 text-info">{currencyFormatter.format(Number(selectedTransaction.employer_cost ?? 0))}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Work Summary */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-secondary mb-3">Work Summary</h6>
                                             <div className="row g-3">
                                                  <div className="col-md-3">
                                                       <div className="border rounded p-3 text-center">
                                                            <div className="text-muted small mb-1">Days Worked</div>
                                                            <div className="fw-bold fs-5">{selectedTransaction.days_worked ?? 0}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className="border rounded p-3 text-center">
                                                            <div className="text-muted small mb-1">Hours Worked</div>
                                                            <div className="fw-bold fs-5">{Number(selectedTransaction.hours_worked ?? 0)}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className="border rounded p-3 text-center">
                                                            <div className="text-muted small mb-1">Overtime Hours</div>
                                                            <div className="fw-bold fs-5">{Number(selectedTransaction.overtime_hours ?? 0)}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className="border rounded p-3 text-center">
                                                            <div className="text-muted small mb-1">Days Absent</div>
                                                            <div className="fw-bold fs-5">{selectedTransaction.days_absent ?? 0}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Status & Payment */}
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Status</div>
                                                       <span className={`badge fs-6 px-3 py-2 ${selectedTransaction.status === 'paid' ? 'bg-success' : selectedTransaction.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                            {selectedTransaction.status}
                                                       </span>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Payment Method</div>
                                                       <div className="fw-bold">{selectedTransaction.payment_method || 'Not paid'}</div>
                                                       {selectedTransaction.payment_date && (
                                                            <div className="small text-muted">Paid on {formatDate(selectedTransaction.payment_date)}</div>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowTransactionModal(false)}>
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payslip Preview Modal */}
               {showPayslipModal && payslipPreviewUrl && (
                    <div
                         className="modal show d-block"
                         tabIndex={-1}
                         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                         onClick={closePayslipPreview}
                    >
                         <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content" style={{ height: '90vh' }}>
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">Payslip Preview</h5>
                                        <button type="button" className="btn-close" onClick={closePayslipPreview}></button>
                                   </div>
                                   <div className="modal-body p-0" style={{ height: 'calc(90vh - 130px)' }}>
                                        <iframe
                                             src={payslipPreviewUrl}
                                             title="Payslip Preview"
                                             style={{ width: '100%', height: '100%', border: 'none' }}
                                        />
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closePayslipPreview}>
                                             Close
                                        </button>
                                        <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleDownloadFromPreview}>
                                             <RiDownloadLine size={16} className="me-1" />
                                             Download PDF
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
          </div>
     );
}
