'use client';
import SupplierPaymentSourceFields from '../../../../../components/inventory/SupplierPaymentSourceFields';
import screens from '../../PayrollScreens.module.css';
import PayrollWorkflowRibbon from '../../PayrollWorkflowRibbon';
import { usePayrollFeedback } from '../../../../../components/HR/Payroll/usePayrollFeedback';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import Modal from 'react-bootstrap/Modal';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { companyImageUrl } from '../../../../../lib/companyImage';
import { getRequestContext } from '../../../../../components/serverActions/requestHeaders';
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
     employeename?: string;
     employeerole?: string;
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
     salary_grade_id?: number | null;
     salary_grade?: string | null;
     tax_relief?: number | string | null;
     payment_date: string | null;
     payment_method: string | null;
     payment_reference: string | null;
     allowances_detail: unknown[];
     allowances?: unknown[];
     bonuses_detail: unknown[];
     other_deductions_detail: unknown[];
     created_at: string;
     updated_at: string;
}

interface PayrollDetailItem {
     type?: string;
     name?: string;
     amount?: number | string | null;
     relief_name?: string;
     source?: string;
     calculation_method?: string;
     is_statutory?: boolean;
     is_taxable?: boolean | number;
     taxable_income?: number | string;
     effective_tax_rate?: number | string;
     tax_relief_total?: number | string;
     tax_relief_details?: PayrollDetailItem[];
     priority?: number | string;
     remaining_balance?: number | string;
     requires_disability?: boolean;
     relief_amount?: number | string | null;
}

const toDetailArray = (value: unknown): PayrollDetailItem[] => {
     if (Array.isArray(value)) {
          return value as PayrollDetailItem[];
     }

     if (typeof value === 'string') {
          try {
               const parsed = JSON.parse(value);
               return Array.isArray(parsed) ? (parsed as PayrollDetailItem[]) : [];
          } catch {
               return [];
          }
     }

     return [];
};

const normalizeTransaction = (txn: any): PayrollTransaction => ({
     ...txn,
     employee_name: txn?.employee_name || txn?.employeename || 'Unknown Employee',
     employee_role: txn?.employee_role || txn?.employeerole || 'N/A',
     email: txn?.email || 'N/A',
     branch_name: txn?.branch_name || 'N/A',
     allowances_detail: toDetailArray(txn?.allowances_detail ?? txn?.allowance_details),
     allowances: toDetailArray(txn?.allowances),
     bonuses_detail: toDetailArray(txn?.bonuses_detail ?? txn?.bonuses),
     other_deductions_detail: toDetailArray(txn?.other_deductions_detail ?? txn?.deductions_detail)
});

const toNumber = (value: number | string | null | undefined): number => {
     const parsed = Number(value ?? 0);
     return Number.isFinite(parsed) ? parsed : 0;
};

const formatDisplayLabel = (value: string): string => {
     return value
          .replace(/_/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toUpperCase();
};

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function PayrollPeriodDetailPage() {
     const { notify, feedback } = usePayrollFeedback();
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
     const [paymentAccountId,setPaymentAccountId]=useState(0);
     const [fundingReady,setFundingReady]=useState(false);
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
                    const transactionRows = Array.isArray(response.result?.data) ? response.result.data : [];
                    setTransactions(transactionRows.map(normalizeTransaction));
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
                    notify('Payroll period approved successfully', 'success');
               } else {
                    notify(response?.message || 'Failed to approve payroll');
               }
          } catch (err: any) {
               notify(err?.message || 'Error approving payroll');
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
                    notify('Payroll period locked successfully', 'success');
               } else {
                    notify(response?.message || 'Failed to lock payroll');
               }
          } catch (err: any) {
               notify(err?.message || 'Error locking payroll');
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
                         payment_account_id: paymentAccountId,
                         branchid: applicationsettings?.branchid,
                         employeeid: user.employeeid
                    }
               );

               if (response?.status === 'success') {
                    await fetchPeriodDetails();
                    notify('Payroll period marked as paid successfully', 'success');
                    return true;
               } else {
                    notify(response?.message || 'Failed to mark as paid');
               }
          } catch (err: any) {
               notify(err?.message || 'Error marking as paid');
          } finally {
               setActionLoading(false);
          }
          return false;
     };



     const reversePayrollStatus = async (target_status: string) => {
          try {
               const url = `payroll/periods/${periodId}/revert-status`;
               const response = await customPost(url, 'POST', { target_status: target_status, reverted_by: user?.employeeid });
               if (response?.status === 'success') {
                    notify(`Payroll period status reverted to ${target_status} successfully`)
                    await fetchPeriodDetails();
               } else {
                    notify(response?.message || `Failed to revert payroll period status to ${target_status}`);
               }
          } catch (err: any) {
               notify(err?.message || `Error reverting payroll period status to ${target_status}`);
          }
     };

     const handleRecalculate = async () => {
          if (!user?.employeeid) return;
          setActionLoading(true);
          try {
               const response = await customPost(`payroll/periods/${periodId}/recalculate-period`, 'POST', { recalculated_by: user.employeeid });
               if (response?.result) {
                    await fetchPeriodDetails();
                    await fetchTransactions(1, pageSize);
                    setCurrentPage(1);
               }
               if (response?.result?.errors?.length) {
                    notify(response.result.errors.map((item: any) => `Employee ${item.employeeid}: ${item.error}`).join('\n'));
               } else if (response?.status === 'success') {
                    await fetchPeriodDetails();
                    await fetchTransactions(1, pageSize);
                    setCurrentPage(1);
                    notify('Payroll period recalculated successfully', 'success');
               } else {
                    notify(response?.message || 'Failed to recalculate payroll period');
               }
          } catch (err: any) {
               notify(err?.message || 'Error recalculating payroll period');
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
          if (!paymentDate || !paymentMethod || !paymentAccountId) {
               notify('Please fill in all payment details');
               return;
          }
          const paid = await handleMarkPaid(paymentDate, paymentMethod);
          if (paid) setShowPaymentModal(false);
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

          const logoUrl = companyImageUrl((await getRequestContext()).tenantId);
          const logoDataUrl = logoUrl ? await loadImageAsDataURL(logoUrl) : null;

          const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape', compress: true });
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 10;
          let yPos = margin;

          const fmt = (value: number | string | null | undefined) => {
               const num = toNumber(value);
               return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
          };
          const detailLabel = (item: PayrollDetailItem, fallback: string) => {
               return formatDisplayLabel(String(item?.name || item?.type || fallback));
          };

          const allowancesDetails = (Array.isArray(transaction.allowances_detail) ? transaction.allowances_detail : []) as PayrollDetailItem[];
          const bonusDetails = (Array.isArray(transaction.bonuses_detail) ? transaction.bonuses_detail : []) as PayrollDetailItem[];
          const deductionDetails = (Array.isArray(transaction.other_deductions_detail) ? transaction.other_deductions_detail : []) as PayrollDetailItem[];

          const headCellStyle = { fontStyle: 'bold' as const, fillColor: [235, 235, 235] as [number, number, number], fontSize: 8, textColor: [0, 0, 0] as [number, number, number] };
          const valueCellStyle = { fontSize: 8, textColor: [0, 0, 0] as [number, number, number] };

          // Outer letterhead border box
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.4);

          if (logoDataUrl) {
               try { doc.addImage(logoDataUrl, 'PNG', margin, yPos, 18, 18); } catch { }
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
                         { content: 'COMPANY', styles: headCellStyle }, { content: company.name || 'N/A', styles: valueCellStyle },
                         { content: 'BRANCH', styles: headCellStyle }, { content: transaction.branch_name || 'N/A', styles: valueCellStyle }
                    ],
                    [
                         { content: 'PERIOD', styles: headCellStyle }, { content: `FROM ${formatDate(period.period_start_date)} TO ${formatDate(period.period_end_date)}`, styles: valueCellStyle },
                         { content: 'PAYMENT DATE', styles: headCellStyle }, { content: transaction.payment_date ? formatDate(transaction.payment_date) : 'N/A', styles: valueCellStyle }
                    ],
                    [
                         { content: 'NAME', styles: headCellStyle }, { content: transaction.employee_name, styles: valueCellStyle },
                         { content: 'STAFF ID', styles: headCellStyle }, { content: String(transaction.employeeid), styles: valueCellStyle }
                    ],
                    [
                         { content: 'SALARY GRADE', styles: headCellStyle }, { content: transaction.salary_grade || 'N/A', styles: valueCellStyle },
                         { content: 'PAYMENT METHOD', styles: headCellStyle }, { content: transaction.payment_method || 'N/A', styles: valueCellStyle }
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
          const hasAllowanceDetails = allowancesDetails.some((entry) => toNumber(entry?.amount) > 0);
          const hasBonusDetails = bonusDetails.some((entry) => toNumber(entry?.amount) > 0);
          [
               ['BASIC SALARY', transaction.basic_salary],
               ['HOURLY EARNINGS', transaction.hourly_earnings],
               ['OVERTIME EARNINGS', transaction.overtime_earnings],
               ['COMMISSION', transaction.commission_earnings]
          ].forEach(([label, value]) => {
               const num = toNumber(value);
               if (num > 0) {
                    rows.push([monthYear, 'EARNING', `E${String(eIdx).padStart(2, '0')}`, label, '-', fmt(num), '']);
                    eIdx++;
               }
          });

          if (!hasAllowanceDetails && toNumber(transaction.total_allowances) > 0) {
               rows.push([monthYear, 'ALLOWANCE', `E${String(eIdx).padStart(2, '0')}`, 'ALLOWANCES', '-', fmt(transaction.total_allowances), '', '']);
               eIdx++;
          }

          if (!hasBonusDetails && toNumber(transaction.total_bonuses) > 0) {
               rows.push([monthYear, 'BONUS', `E${String(eIdx).padStart(2, '0')}`, 'BONUSES', '-', fmt(transaction.total_bonuses), '', '']);
               eIdx++;
          }

          allowancesDetails.forEach((entry) => {
               const amount = toNumber(entry?.amount);
               if (amount > 0) {
                    rows.push([monthYear, 'ALLOWANCE', `E${String(eIdx).padStart(2, '0')}`, detailLabel(entry, 'Allowance'), '-', fmt(amount), '', '']);
                    eIdx++;
               }
          });

          bonusDetails.forEach((entry) => {
               const amount = toNumber(entry?.amount);
               if (amount > 0) {
                    rows.push([monthYear, 'BONUS', `E${String(eIdx).padStart(2, '0')}`, detailLabel(entry, 'Bonus'), '-', fmt(amount), '', '']);
                    eIdx++;
               }
          });

          let dIdx = 1;

          if (deductionDetails.length > 0) {
               deductionDetails.forEach((entry) => {
                    const amount = toNumber(entry?.amount);
                    rows.push([
                         monthYear,
                         'DEDUCTION',
                         `D${String(dIdx).padStart(2, '0')}`,
                         detailLabel(entry, 'Deduction'),
                         '-',
                         '',
                         fmt(amount),
                         entry?.remaining_balance !== undefined && entry?.remaining_balance !== null ? fmt(entry.remaining_balance) : '-'
                    ]);
                    dIdx++;
               });
          } else {
               [
                    ['INCOME TAX', transaction.income_tax],
                    ['EMPLOYEE SSNIT', transaction.employee_ssnit],
                    ['EMPLOYEE TIER 3', transaction.employee_tier3],
                    ['NHIS', transaction.nhis],
                    ['OTHER DEDUCTIONS', transaction.total_other_deductions]
               ].forEach(([label, value]) => {
                    const num = toNumber(value as number | string | null | undefined);
                    rows.push([monthYear, 'DEDUCTION', `D${String(dIdx).padStart(2, '0')}`, label, '-', '', fmt(num), '-']);
                    dIdx++;
               });
          }

          const totalBalance = deductionDetails.reduce((sum, entry) => sum + toNumber(entry?.remaining_balance), 0);
          const totalBalanceText = totalBalance > 0 ? fmt(totalBalance) : '-';

          autoTable(doc, {
               startY: yPos,
               margin: { left: margin, right: margin },
               theme: 'grid',
               styles: { lineColor: [0, 0, 0], lineWidth: 0.2, fontSize: 7.5, cellPadding: 1.5 },
               head: [['MONTH/YEAR', 'NATURE', 'CODE', 'DESCRIPTION', 'RATE/HRS', 'PAYMENTS (GHS)', 'DEDUCTIONS (GHS)', 'BALANCE (GHS)']],
               headStyles: { fillColor: [235, 235, 235], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
               body: rows,
               columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 24 },
                    2: { cellWidth: 18 },
                    3: { cellWidth: 105 },
                    4: { cellWidth: 18, halign: 'center' },
                    5: { cellWidth: 29, halign: 'right' },
                    6: { cellWidth: 29, halign: 'right' },
                    7: { cellWidth: 29, halign: 'right' }
               },
               foot: [[
                    { content: 'TOTALS', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: fmt(transaction.gross_salary), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: fmt(transaction.total_deductions), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: totalBalanceText, styles: { halign: 'right', fontStyle: 'bold' } }
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
                         // { content: 'EMPLOYER SSNIT', styles: headCellStyle }, { content: fmt(transaction.employer_ssnit), styles: valueCellStyle }
                    ],
                    [
                         // { content: 'DAYS WORKED', styles: headCellStyle }, { content: String(transaction.days_worked ?? 0), styles: valueCellStyle },
                         // { content: 'HOURS WORKED', styles: headCellStyle }, { content: String(Number(transaction.hours_worked ?? 0)), styles: valueCellStyle },
                         // { content: 'EMPLOYER TIER 3', styles: headCellStyle }, { content: fmt(transaction.employer_tier3), styles: valueCellStyle }
                    ]
               ]
          });

          yPos = (doc as any).lastAutoTable.finalY + 5;
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
          doc.text(`Â© ${new Date().getFullYear()} ${company.name || 'Company'}. All rights reserved.`, pageWidth / 2, pageHeight - 6, { align: 'center' });

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
               notify('Error generating payslip. Please try again.');
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

     const selectedDeductionDetails = (selectedTransaction && Array.isArray(selectedTransaction.other_deductions_detail)
          ? selectedTransaction.other_deductions_detail
          : []) as PayrollDetailItem[];
     const selectedAllowanceDetails = (
          selectedTransaction
               ? [
                    ...(Array.isArray(selectedTransaction.allowances_detail) ? selectedTransaction.allowances_detail : []),
                    ...(Array.isArray(selectedTransaction.allowances) ? selectedTransaction.allowances : [])
               ]
               : []
     ) as PayrollDetailItem[];
     const selectedAllowanceRows: PayrollDetailItem[] = selectedAllowanceDetails.length > 0
          ? selectedAllowanceDetails
          : toNumber(selectedTransaction?.total_allowances) > 0
               ? [{ name: 'Total Allowances', amount: selectedTransaction?.total_allowances }]
               : [];
     const selectedBonusDetails = (selectedTransaction && Array.isArray(selectedTransaction.bonuses_detail)
          ? selectedTransaction.bonuses_detail
          : []) as PayrollDetailItem[];
     const incomeTaxDetail = selectedDeductionDetails.find((item) => item?.type === 'income_tax');
     const selectedTaxReliefDetails = Array.isArray(incomeTaxDetail?.tax_relief_details)
          ? incomeTaxDetail.tax_relief_details
          : [];

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
               <div className={screens.page}>
               {feedback}
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
          <div className={screens.page}>
               {feedback}
               {/* Header */}
               <div className={screens.header}>
                    <Link href="/human-resource/payroll/periods" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="flex-grow-1">
                         <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                   <RiCalendarLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <div>
                                        <span className={screens.eyebrow}>Payroll / Payroll operations</span>
<h1 className={screens.title}>{period.period_name}</h1>
                                        <p className="text-muted mb-0 small">
                                             {formatDate(period.period_start_date)} - {formatDate(period.period_end_date)}
                                        </p>
                                   </div>
                              </div>
                              <PayrollStatusBadge status={period.status} size="lg" />
                         </div>
                    </div>
               </div>

               <PayrollWorkflowRibbon status={period.status} />
               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className={screens.metric} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiUserLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Employees</span>
                              </div>
                              <div className="fs-4 fw-bold">{period.employee_count}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Gross Salary</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(period.total_gross_salary)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-danger" />
                                   <span className="fw-medium text-muted small">Total Deductions</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(period.total_deductions)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
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
                         handleRevert={reversePayrollStatus}
                         onMarkPaid={openPaymentModal}
                         onRecalculate={handleRecalculate}
                         loading={actionLoading}
                    />
               </div>

               {/* Transactions Table */}
               <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
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
                         <div className={screens.tableWrap}>
                              <table className={screens.table}>
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
                    <Modal show={showPaymentModal} onHide={() => !actionLoading && setShowPaymentModal(false)} backdrop="static" keyboard={!actionLoading} centered aria-labelledby="payroll-payment-title">
                                   <div className="modal-header">
                                        <h5 id="payroll-payment-title" className="modal-title fw-bold">Mark Payroll as Paid</h5>
                                        <button type="button" className="btn-close" disabled={actionLoading} aria-label="Close payment review" onClick={() => setShowPaymentModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        {feedback}
                                        <div className="mb-3">
                                             <label htmlFor="paymentDate" className="form-label fw-medium">Payment Date <span className="text-danger" aria-hidden="true">*</span></label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  id="paymentDate"
                                                  value={paymentDate}
                                                  onChange={(e) => setPaymentDate(e.target.value)}
                                                  required
                                             />
                                        </div>
                                        <SupplierPaymentSourceFields purpose="payroll" onReady={setFundingReady} accountId={paymentAccountId} method={paymentMethod} amount={Number(period?.total_net_salary||0)} disabled={actionLoading} onChange={(id,method)=>{setPaymentAccountId(id);setPaymentMethod(method);}}/>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" disabled={actionLoading} onClick={() => setShowPaymentModal(false)}>
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={confirmMarkPaid}
                                             disabled={actionLoading||!fundingReady}
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
                    </Modal>
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
                                        <button type="button" className="btn-close" aria-label="Dismiss message" onClick={() => setShowTransactionModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        {/* Employee Information */}
                                        <div className="row g-3 mb-4">
                                             <div className="col-md-6">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Employee</div>
                                                       <div className="fw-bold">{selectedTransaction.employee_name}</div>
                                                       <div className="small text-muted">{selectedTransaction.email}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
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
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Basic Salary</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.basic_salary ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Hourly Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.hourly_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Overtime Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.overtime_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Commission Earnings</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.commission_earnings ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Total Allowances</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_allowances ?? 0))}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-4">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Total Bonuses</div>
                                                            <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_bonuses ?? 0))}</div>
                                                       </div>
                                                  </div>
                                             </div>

                                             {(selectedAllowanceRows.length > 0 || selectedBonusDetails.length > 0) && (
                                                  <div className="mt-3">
                                                       <div className={screens.tableWrap}>
                                                            <table className={screens.table}>
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th className="text-start">Type</th>
                                                                           <th className="text-start">Name</th>
                                                                           <th className="text-start">Taxable</th>
                                                                           <th className="text-end">Amount</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {selectedAllowanceRows.map((item, index) => (
                                                                           <tr key={`allowance-${index}`}>
                                                                                <td className="text-start small">Allowance</td>
                                                                                <td className="text-start small">{item.name || item.type || 'Allowance'}</td>
                                                                                <td className="text-start small">{item.is_taxable === undefined ? 'N/A' : Number(item.is_taxable) === 1 || item.is_taxable === true ? 'Yes' : 'No'}</td>
                                                                                <td className="text-end small">{currencyFormatter.format(toNumber(item.amount))}</td>
                                                                           </tr>
                                                                      ))}
                                                                      {selectedBonusDetails.map((item, index) => (
                                                                           <tr key={`bonus-${index}`}>
                                                                                <td className="text-start small">Bonus</td>
                                                                                <td className="text-start small">{item.name || item.type || 'Bonus'}</td>
                                                                                <td className="text-start small">{item.is_taxable === undefined ? 'N/A' : Number(item.is_taxable) === 1 || item.is_taxable === true ? 'Yes' : 'No'}</td>
                                                                                <td className="text-end small">{currencyFormatter.format(toNumber(item.amount))}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>

                                        {/* Salary Summary */}
                                        <div className="row g-3 mb-4">
                                             <div className="col-md-4">
                                                  <div className={screens.detailItem}>
                                                       <div className="text-muted small mb-1">Gross Salary</div>
                                                       <div className="fw-bold fs-5 text-success">{currencyFormatter.format(Number(selectedTransaction.gross_salary ?? 0))}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className={screens.detailItem}>
                                                       <div className="text-muted small mb-1">Total Deductions</div>
                                                       <div className="fw-bold fs-5 text-danger">{currencyFormatter.format(Number(selectedTransaction.total_deductions ?? 0))}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className={screens.detailItem}>
                                                       <div className="text-muted small mb-1">Net Salary</div>
                                                       <div className="fw-bold fs-5 text-primary">{currencyFormatter.format(Number(selectedTransaction.net_salary ?? 0))}</div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Deductions Breakdown */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-danger mb-3">Deductions Breakdown</h6>
                                             {selectedDeductionDetails.length > 0 ? (
                                                  <div className={screens.tableWrap}>
                                                       <table className={screens.table}>
                                                            <thead className="table-light">
                                                                 <tr>
                                                                      <th className="text-start">Deduction</th>
                                                                      <th className="text-start">Source</th>
                                                                      <th className="text-start">Method</th>
                                                                      <th className="text-start">Statutory</th>
                                                                      <th className="text-end">Amount</th>
                                                                      <th className="text-end">Balance</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedDeductionDetails.map((item, index) => (
                                                                      <tr key={`${item.type || item.name || 'deduction'}-${index}`}>
                                                                           <td className="text-start small">{item.name || item.type || 'Deduction'}</td>
                                                                           <td className="text-start small text-capitalize">{item.source ? item.source.replace(/_/g, ' ') : 'N/A'}</td>
                                                                           <td className="text-start small text-capitalize">{item.calculation_method ? item.calculation_method.replace(/_/g, ' ') : 'N/A'}</td>
                                                                           <td className="text-start small">{item.is_statutory === undefined ? 'N/A' : item.is_statutory ? 'Yes' : 'No'}</td>
                                                                           <td className="text-end small">{currencyFormatter.format(toNumber(item.amount))}</td>
                                                                           <td className="text-end small">{item.remaining_balance !== undefined && item.remaining_balance !== null ? currencyFormatter.format(toNumber(item.remaining_balance)) : '-'}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="row g-3">
                                                       <div className="col-md-6">
                                                            <div className={screens.detailItem}>
                                                                 <div className="text-muted small mb-1">Total Deductions</div>
                                                                 <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_deductions ?? 0))}</div>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className={screens.detailItem}>
                                                                 <div className="text-muted small mb-1">Other Deductions</div>
                                                                 <div className="fw-bold fs-6">{currencyFormatter.format(Number(selectedTransaction.total_other_deductions ?? 0))}</div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             )}

                                             {selectedTaxReliefDetails.length > 0 && (
                                                  <div className="mt-3">
                                                       <div className={screens.panel} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                            <div className="small text-muted mb-1">Tax Relief Summary</div>
                                                            <div className="fw-bold">
                                                                 Total Relief Applied: {currencyFormatter.format(toNumber(incomeTaxDetail?.tax_relief_total ?? selectedTransaction.tax_relief ?? 0))}
                                                            </div>
                                                            <div className="small text-muted">
                                                                 Taxable Income: {currencyFormatter.format(toNumber(incomeTaxDetail?.taxable_income))} | Effective Tax Rate: {toNumber(incomeTaxDetail?.effective_tax_rate).toFixed(2)}%
                                                            </div>
                                                       </div>

                                                       <div className={screens.tableWrap}>
                                                            <table className={screens.table}>
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th className="text-start">Relief Name</th>
                                                                           <th className="text-start">Method</th>
                                                                           <th className="text-end">Configured</th>
                                                                           <th className="text-end">Applied</th>
                                                                           <th className="text-start">Disability Required</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {selectedTaxReliefDetails.map((relief, index) => (
                                                                           <tr key={`relief-${index}`}>
                                                                                <td className="text-start small">{relief.relief_name || relief.name || 'Tax Relief'}</td>
                                                                                <td className="text-start small text-capitalize">{relief.calculation_method ? relief.calculation_method.replace(/_/g, ' ') : 'N/A'}</td>
                                                                                <td className="text-end small">{currencyFormatter.format(toNumber(relief.amount))}</td>
                                                                                <td className="text-end small">{currencyFormatter.format(toNumber(relief.relief_amount))}</td>
                                                                                <td className="text-start small">{relief.requires_disability ? 'Yes' : 'No'}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>

                                        {/* Work Summary */}
                                        <div className="mb-4">
                                             <h6 className="fw-bold text-secondary mb-3">Work Summary</h6>
                                             <div className="row g-3">
                                                  <div className="col-md-3">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Days Worked</div>
                                                            <div className="fw-bold fs-5">{selectedTransaction.days_worked ?? 0}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Hours Worked</div>
                                                            <div className="fw-bold fs-5">{Number(selectedTransaction.hours_worked ?? 0)}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Overtime Hours</div>
                                                            <div className="fw-bold fs-5">{Number(selectedTransaction.overtime_hours ?? 0)}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <div className={screens.detailItem}>
                                                            <div className="text-muted small mb-1">Days Absent</div>
                                                            <div className="fw-bold fs-5">{selectedTransaction.days_absent ?? 0}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Status & Payment */}
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="text-muted small mb-1">Status</div>
                                                       <span className={`badge fs-6 px-3 py-2 ${selectedTransaction.status === 'paid' ? 'bg-success' : selectedTransaction.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                            {selectedTransaction.status}
                                                       </span>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
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
                                        <button type="button" className="btn-close" aria-label="Dismiss message" onClick={closePayslipPreview}></button>
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
