'use client';
import screens from '../../PayrollScreens.module.css';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from 'react-bootstrap';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { currencyFormatter, formatDate } from '../../../../../components/HR/Payroll/utils';
import Loader from '../../../../../components/isLoading';
import { toast } from 'react-toastify';
import { RiArrowLeftLine, RiPrinterLine } from '@remixicon/react';

interface EmployeePayslip {
     employeeid: number;
     employee_name: string;
     staff_id?: string;
     grade?: string;
     level?: string;
     region?: string;
     district?: string;
     agency?: string;
     department?: string;
     unit?: string;
     period_start: string;
     period_end: string;
     basic_salary: string;
     hourly_earnings: string;
     overtime_earnings: string;
     commission_earnings: string;
     total_allowances: string;
     total_bonuses: string;
     gross_salary: string;
     income_tax: string;
     employee_ssnit: string;
     employer_ssnit: string;
     employee_tier3: string;
     employer_tier3: string;
     nhis: string;
     total_other_deductions: string;
     total_deductions: string;
     net_salary: string;
     employer_cost: string;
     payment_method: string;
     period_name: string;
     branch_name: string;
}

const PayslipTemplate: React.FC<{ payslip: EmployeePayslip }> = ({ payslip }) => {
     const formatPeriod = () => {
          const start = new Date(payslip.period_start);
          const end = new Date(payslip.period_end);
          return `FROM ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()} TO ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}`;
     };

     const formatMonthYear = () => {
          const end = new Date(payslip.period_end);
          return `${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}`;
     };

     return (
          <div style={{
               fontFamily: 'Arial, Helvetica, sans-serif',
               margin: 0,
               padding: '30px',
               backgroundColor: '#f9f9f9',
               minHeight: '100vh'
          }}>
               <style>
                    {`
                         @media print {
                              body { background: white !important; padding: 10px !important; }
                              .payslip { border: none !important; }
                              @page { margin: 0.5cm; }
                              button { display: none !important; }
                         }
                    `}
               </style>
               <style>
                    {`
                         @media print {
                              body { background: white !important; padding: 10px !important; }
                              .payslip { border: none !important; }
                              @page { margin: 0.5cm; }
                              button { display: none !important; }
                         }
                    `}
               </style>
               <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    backgroundColor: 'white',
                    border: '2px solid #000',
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden'
               }}>
                    {/* Watermark */}
                    <div style={{
                         position: 'absolute',
                         top: '50%',
                         left: '50%',
                         transform: 'translate(-50%, -50%)',
                         opacity: 0.15,
                         pointerEvents: 'none',
                         zIndex: 0
                    }}>
                         <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Coat_of_arms_of_Ghana.svg/1229px-Coat_of_arms_of_Ghana.svg.png"
                              alt="Watermark"
                              style={{ width: '600px' }}
                         />
                    </div>
                    <div style={{
                         position: 'absolute',
                         bottom: '30%',
                         left: '50%',
                         transform: 'translateX(-50%)',
                         fontSize: '40px',
                         color: '#000',
                         opacity: 0.1,
                         whiteSpace: 'nowrap'
                    }}>
                         GOVERNMENT OF GHANA
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                         {/* Header */}
                         <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottom: '2px solid #000',
                              paddingBottom: '15px',
                              marginBottom: '20px'
                         }}>
                              <img
                                   src="https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=672720411525356"
                                   alt="GHS Logo"
                                   style={{ width: '180px' }}
                              />
                              <img
                                   src="https://citinewsroom.com/wp-content/uploads/2023/01/cagd-2.jeg_.webp"
                                   alt="CAGD Logo"
                                   style={{ width: '120px' }}
                              />
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                   <span className={screens.eyebrow}>Payroll / Employee reports</span>
<h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                                        CONTROLLER AND ACCOUNTANT GENERALS DEPARTMENT
                                   </h1>
                              </div>
                              <img
                                   src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Coat_of_arms_of_Ghana.svg/1229px-Coat_of_arms_of_Ghana.svg.png"
                                   alt="Coat of Arms"
                                   style={{ width: '140px' }}
                              />
                         </div>

                         {/* Employee Information */}
                         <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '15px',
                              marginBottom: '20px',
                              fontSize: '14px'
                         }}>
                              <div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>DATE:</span>
                                        <span>{new Date(payslip.period_end).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>PERIOD:</span>
                                        <span>{formatPeriod()}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>NAME:</span>
                                        <span>{payslip.employee_name}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>EMPLOYEE ID:</span>
                                        <span>{payslip.employeeid}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>BRANCH:</span>
                                        <span>{payslip.branch_name}</span>
                                   </div>
                              </div>
                              <div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>PERIOD NAME:</span>
                                        <span>{payslip.period_name}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>PAYMENT METHOD:</span>
                                        <span>{payslip.payment_method}</span>
                                   </div>
                                   <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '180px' }}>EMPLOYEE ROLE:</span>
                                        {/* <span>{payslip.employee_role || 'N/A'}</span> */}
                                   </div>
                              </div>
                         </div>

                         {/* Payroll Table */}
                         <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '14px'
                         }}>
                              <thead>
                                   <tr>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>MONTH/YEAR</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>NATURE</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>ITEM CODE</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>DESCRIPTION</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>AMOUNT</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>PAYMENTS</th>
                                        <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#e0e0e0', textAlign: 'center' }}>DEDUCTIONS</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   <tr>
                                        <td rowSpan={8} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{formatMonthYear()}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Basic Salary</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.basic_salary))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Hourly Earnings</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.hourly_earnings))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Overtime Earnings</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.overtime_earnings))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Commission Earnings</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.commission_earnings))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Total Allowances</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.total_allowances))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Total Bonuses</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.total_bonuses))}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Income Tax</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.income_tax))}</td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Employee SSNIT</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.employee_ssnit))}</td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>NHIS</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.nhis))}</td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Other Deductions</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.total_other_deductions))}</td>
                                   </tr>
                              </tbody>
                         </table>

                         {/* Footer Notes */}
                         <div style={{
                              marginTop: '20px',
                              fontSize: '12px',
                              textAlign: 'center'
                         }}>
                              *** EMPLOYER SSNIT: {currencyFormatter.format(parseFloat(payslip.employer_ssnit))} | EMPLOYER TIER 3: {currencyFormatter.format(parseFloat(payslip.employer_tier3))} ***<br />
                              GENERATED FROM PAYROLL SYSTEM<br /><br />
                              *** This is a computer generated payslip and does not require signature ***
                         </div>

                         {/* Totals Table */}
                         <table style={{
                              marginTop: '30px',
                              fontSize: '14px',
                              width: '100%',
                              borderCollapse: 'collapse'
                         }}>
                              <tbody>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>BASIC SALARY</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.basic_salary))}</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>EMPLOYEE SSNIT</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.employee_ssnit))}</td>
                                        <td rowSpan={4} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>TOTALS</td>
                                        <td rowSpan={4} style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', verticalAlign: 'middle', fontSize: '16px', fontWeight: 'bold' }}>{currencyFormatter.format(parseFloat(payslip.gross_salary))}</td>
                                        <td rowSpan={4} style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', verticalAlign: 'middle', fontSize: '16px', fontWeight: 'bold' }}>{currencyFormatter.format(parseFloat(payslip.total_deductions))}</td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>TOTAL ALLOWANCES</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.total_allowances))}</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>INCOME TAX</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.income_tax))}</td>
                                   </tr>
                                   <tr>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>TOTAL BONUSES</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.total_bonuses))}</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>NHIS</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{currencyFormatter.format(parseFloat(payslip.nhis))}</td>
                                   </tr>
                                   <tr>
                                        <td colSpan={2} style={{ border: '1px solid #000', padding: '10px' }}></td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>PAYMENT METHOD</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{payslip.payment_method}</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>NET SALARY</td>
                                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{currencyFormatter.format(parseFloat(payslip.net_salary))}</td>
                                   </tr>
                              </tbody>
                         </table>

                         {/* Page Number */}
                         <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
                              Page 1 / 1
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default function EmployeePayslipPage() {
     const params = useParams();
     const router = useRouter();
     const searchParams = useSearchParams();
     const employeeId = params?.id as string;
     const periodId = searchParams?.get('periodId');

     const [payslip, setPayslip] = useState<EmployeePayslip | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          if (employeeId) {
               loadEmployeePayslip();
          }
     }, [employeeId, periodId]);

     const loadEmployeePayslip = async () => {
          try {
               setLoading(true);
               setError(null);

               // This would be the API endpoint to fetch employee payslip data
               const queryParams = periodId ? `?periodId=${periodId}` : '';
               const response = await customFetch(`payroll/employee/${employeeId}/payslip${queryParams}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setPayslip(response.result);
               } else {
                    setError(response.error || 'Failed to load payslip data');
               }
          } catch (err) {
               console.error('Error loading payslip:', err);
               setError('Failed to load payslip data');
               toast.error('Failed to load payslip data');
          } finally {
               setLoading(false);
          }
     };

     const handlePrint = () => {
          window.print();
     };

     const handleBack = () => {
          router.push('/human-resource/payroll/employee/history?employeeId=' + employeeId);
     };

     if (loading) {
          return <Loader />;
     }

     if (error) {
          return (
               <div className={screens.page}>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                         <Button variant="outline-secondary" onClick={handleBack}>
                              <RiArrowLeftLine size={16} className="me-2" />
                              Back to History
                         </Button>
                    </div>
                    <div role="alert" className="alert alert-danger">
                         <h5>Error Loading Payslip</h5>
                         <p>{error}</p>
                    </div>
               </div>
          );
     }

     if (!payslip) {
          return (
               <div className={screens.page}>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                         <Button variant="outline-secondary" onClick={handleBack}>
                              <RiArrowLeftLine size={16} className="me-2" />
                              Back to History
                         </Button>
                    </div>
                    <div className="alert alert-warning">
                         <h5>No Payslip Data Found</h5>
                         <p>No payslip data available for this employee.</p>
                    </div>
               </div>
          );
     }

     return (
          <div className={screens.page}>
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <Button variant="outline-secondary" onClick={handleBack}>
                         <RiArrowLeftLine size={16} className="me-2" />
                         Back to History
                    </Button>
                    <Button variant="outline-primary" onClick={handlePrint}>
                         <RiPrinterLine size={16} className="me-2" />
                         Print Payslip
                    </Button>
               </div>
               <PayslipTemplate payslip={payslip} />
          </div>
     );
}