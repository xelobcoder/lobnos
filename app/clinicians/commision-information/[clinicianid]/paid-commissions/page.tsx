"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { customFetch, currencyFormatter } from '../../../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { RiUserLine, RiFileList3Line, RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine } from '@remixicon/react';
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     LineChart,
     Line,
     AreaChart,
     Area,
} from "recharts";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue for payment_amount
const COLOR_TERTIARY = '#ea580c'; // Orange for waived_amount
const COLOR_EXPENSES = '#dc2626'; // Red for total_commission_amount

interface PaidCommissionData {
     id: number;
     batch_reference: string;
     recipient_type: string;
     recipient_id: number;
     start_date: string;
     end_date: string;
     total_commission_amount: string;
     payment_amount: string;
     waived_amount: string;
     status: string;
     payment_date: string;
     created_by: number;
     notes: string | null;
     created_at: string;
     updated_at: string;
     payment_method: number;
     created_by_username: string;
     payment_mode: string;
     recipient_name: string;
}

async function getPaidCommissions({ clinicianid, startDate, endDate }: { clinicianid: string, startDate: string, endDate: string }) {
     try {
          const url = `commission-payments/commission/batch/information?recipient_type=clinician&recipient_id=${encodeURIComponent(clinicianid)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
          const response = await customFetch(url);
          if (!response || !(response.success || response.status === true || response.status === 'success')) {
               throw new Error('API returned no data or failed.');
          }
          const records = Array.isArray(response.data) ? response.data : [];
          return records as PaidCommissionData[];
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}

export default function PaidCommissionsPage({ params }: { params: { clinicianid: string } }) {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [chartView, setChartView] = useState<'bar' | 'line' | 'area'>('bar');
     const [showBreakdownModal, setShowBreakdownModal] = useState(false);
     const [selectedCommission, setSelectedCommission] = useState<PaidCommissionData | null>(null);
     const [breakdownData, setBreakdownData] = useState<any[]>([]);
     const [breakdownLoading, setBreakdownLoading] = useState(false);

     const fetchBreakdownData = async (batchId: number) => {
          setBreakdownLoading(true);
          try {
               const url = `commission-payments/commission/batch/information/${batchId}/batch`;
               const response = await customFetch(url);
               if (response?.status == true && Array.isArray(response.data)) {
                    setBreakdownData(response.data || []);
               } else {
                    setBreakdownData([]);
               }
          } catch (error) {
               setBreakdownData([]);
          } finally {
               setBreakdownLoading(false);
          }
     };

     useEffect(() => {
          if (showBreakdownModal && selectedCommission) {
               fetchBreakdownData(selectedCommission.id);
          }
     }, [showBreakdownModal, selectedCommission]);

     useEffect(() => {
          setLoading(true);
          setError(null);
          getPaidCommissions({ clinicianid: params.clinicianid, startDate, endDate })
               .then((res) => {
                    if ((res as any).error) {
                         setError((res as any).error);
                         setPaidCommissions([]);
                    } else {
                         setPaidCommissions(res as PaidCommissionData[]);
                    }
               })
               .catch(e => {
                    setError(e.message || 'An unknown error occurred');
                    setPaidCommissions([]);
               })
               .finally(() => setLoading(false));
     }, [params.clinicianid, startDate, endDate]);

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setStartDate(e.target.value);
     };
     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEndDate(e.target.value);
     };
     const handleResetFilters = () => {
          setStartDate(defaultStart);
          setEndDate(today);
     };

     // Process data for chart
     const chartData = useMemo(() => {
          const groupedData = paidCommissions.reduce((acc, record) => {
               const date = dayjs(record.payment_date).format('YYYY-MM-DD');
               if (!acc[date]) {
                    acc[date] = {
                         date,
                         totalCommission: 0,
                         paymentAmount: 0,
                         waivedAmount: 0,
                         count: 0
                    };
               }
               acc[date].totalCommission += Number(record.total_commission_amount);
               acc[date].paymentAmount += Number(record.payment_amount);
               acc[date].waivedAmount += Number(record.waived_amount);
               acc[date].count += 1;
               return acc;
          }, {} as Record<string, any>);

          return Object.values(groupedData).sort((a: any, b: any) =>
               new Date(a.date).getTime() - new Date(b.date).getTime()
          );
     }, [paidCommissions]);

     const formatDateForDisplay = (dateString: string) => {
          return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
     };

     const formatDateForTable = (dateString: string) => {
          return new Date(dateString).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: COLOR_TOOLTIP_BG,
                              borderColor: COLOR_BORDER,
                              minWidth: '220px',
                              fontSize: '0.8rem'
                         }}
                    >
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{formatDateForTable(label)}</span>
                         </div>
                         {payload.map((item: any, index: number) => {
                              const value = item.value;
                              const name = item.name;
                              const color = item.color;
                              return (
                                   <div key={index} className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{name}</span>
                                        <span className="fw-bold d-block" style={{ color }}>
                                             {currencyFormatter.format(value)}
                                        </span>
                                   </div>
                              );
                         })}
                    </div>
               );
          }
          return null;
     };

     const renderChart = () => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };
          const xAxisProps = {
               dataKey: "date",
               tickFormatter: formatDateForDisplay,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };
          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };
          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (chartView === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="paymentAmount" name="Payment Amount" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="totalCommission" name="Total Commission" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="waivedAmount" name="Waived Amount" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (chartView === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="paymentAmount" name="Payment Amount" stroke={COLOR_SECONDARY} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                         <Line type="monotone" dataKey="totalCommission" name="Total Commission" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                         <Line type="monotone" dataKey="waivedAmount" name="Waived Amount" stroke={COLOR_TERTIARY} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorPaymentFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorCommissionFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorWaivedFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_TERTIARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_TERTIARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="paymentAmount" name="Payment Amount" stroke={COLOR_SECONDARY} fill="url(#colorPaymentFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    <Area type="monotone" dataKey="totalCommission" name="Total Commission" stroke={COLOR_ACCENT} fill="url(#colorCommissionFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    <Area type="monotone" dataKey="waivedAmount" name="Waived Amount" stroke={COLOR_TERTIARY} fill="url(#colorWaivedFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
               </AreaChart>
          );
     };

     const renderChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading commission data...</p>
                    </div>
               );
          }

          if (error && chartData.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
               );
          }

          if (chartData.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                         <h5 className="fw-medium mb-1">No Data Available</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                              No commission payment data for the selected period.
                         </p>
                    </div>
               );
          }

          return (
               <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                         {renderChart()}
                    </ResponsiveContainer>
               </div>
          );
     };

     const viewButtons = [
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     if (error) {
          return (
               <main className="container py-4">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                         <RiUserLine size={32} className="me-2" />
                         <div>
                              <strong>Could Not Load Paid Commissions</strong>
                              <div>There was a problem connecting to the API.</div>
                              <div>{error}</div>
                         </div>
                    </div>
               </main>
          );
     }
     if (!paidCommissions.length) {
          return (
               <main className="container py-4">
                    <div className="alert alert-info d-flex align-items-center" role="alert">
                         <RiUserLine size={28} className="me-2" style={{ opacity: 0.5 }} />
                         <div>
                              <strong>No Paid Commissions Found</strong>
                              <div>No paid commission records found for this clinician.</div>
                         </div>
                    </div>
               </main>
          );
     }
     return (
          <div className="py-4">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="h4 fw-bold text-primary d-flex align-items-center"><RiUserLine className="me-2" /> Paid Commissions</h1>
                    <Link
                         href={`/clinicians/commision-information/${params.clinicianid}`}
                         className="btn btn-outline-primary btn-sm"
                         target="_blank"
                         rel="noopener noreferrer"
                    >
                         Update Commission Records
                    </Link>
               </div>
               <hr />

               {/* Chart Section - Same format as Daily Sales Trend */}
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, marginBottom: '2rem' }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Commission Payments Trend
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                        {viewButtons.map(btn => (
                                             <button
                                                  key={btn.type}
                                                  type="button"
                                                  className={`btn ${chartView === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                  onClick={() => setChartView(btn.type)}
                                                  style={chartView === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                             </button>
                                        ))}
                                   </div>
                                   <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                                        </div>
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                                        </div>
                                        <button onClick={() => {
                                             setLoading(true);
                                             setError(null);
                                             getPaidCommissions({ clinicianid: params.clinicianid, startDate, endDate })
                                                  .then((res) => {
                                                       if ((res as any).error) {
                                                            setError((res as any).error);
                                                            setPaidCommissions([]);
                                                       } else {
                                                            setPaidCommissions(res as PaidCommissionData[]);
                                                       }
                                                  })
                                                  .catch(e => {
                                                       setError(e.message || 'An unknown error occurred');
                                                       setPaidCommissions([]);
                                                  })
                                                  .finally(() => setLoading(false));
                                        }} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load commission data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                             Load Data
                                        </button>
                                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                             <RiRefreshLine size={16} className="me-1" /> Reset
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {error && chartData.length > 0 && (
                              <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                                   <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                                   {error}
                                   <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                              </div>
                         )}
                         {renderChartContainerContent()}
                    </div>
               </div>

               <div className="card  mb-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                         <h2 className="h6 fw-semibold text-dark mb-0 d-flex align-items-center">
                              <RiFileList3Line className="me-2" />
                              Paid Commission Batches
                         </h2>
                    </div>
                    <div className="card-body">
                         {paidCommissions.length > 0 && (
                              <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                                   <div className="print-date-range" style={{ display: 'none' }}>
                                        Commission Payments Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                   </div>
                                   <div className="d-flex justify-content-between mb-2">
                                        <h4 className="fs-6 fw-medium mb-3">
                                             Commission Payments Data Table
                                        </h4>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                             Print
                                        </button>
                                   </div>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th scope="col" className="py-2">Batch Reference</th>
                                                       <th scope="col" className="py-2">Start Date</th>
                                                       <th scope="col" className="py-2">End Date</th>
                                                       <th scope="col" className="py-2">Total Commission</th>
                                                       <th scope="col" className="py-2">Payment Amount</th>
                                                       <th scope="col" className="py-2">Waived Amount</th>
                                                       <th scope="col" className="py-2">Status</th>
                                                       <th scope="col" className="py-2">Payment Date</th>
                                                       <th scope="col" className="py-2">Payment Mode</th>
                                                       <th scope="col" className="py-2">Created By</th>
                                                       <th scope="col" className="py-2">Recipient Name</th>
                                                       <th scope="col" className="py-2">Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {paidCommissions.map((entry) => (
                                                       <tr key={entry.id}>
                                                            <td className="py-2">{entry.batch_reference}</td>
                                                            <td className="py-2">{formatDateForTable(entry.start_date)}</td>
                                                            <td className="py-2">{formatDateForTable(entry.end_date)}</td>
                                                            <td className="py-2 fw-medium">{currencyFormatter.format(Number(entry.total_commission_amount))}</td>
                                                            <td className="py-2 fw-medium">{currencyFormatter.format(Number(entry.payment_amount))}</td>
                                                            <td className="py-2 fw-medium">{currencyFormatter.format(Number(entry.waived_amount))}</td>
                                                            <td className="py-2">
                                                                 <span className={`badge ${entry.status === 'paid' ? 'bg-success' : entry.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                                 </span>
                                                            </td>
                                                            <td className="py-2">{formatDateForTable(entry.payment_date)}</td>
                                                            <td className="py-2">{entry.payment_mode}</td>
                                                            <td className="py-2">{entry.created_by_username}</td>
                                                            <td className="py-2">{entry.recipient_name}</td>
                                                            <td className="py-2">
                                                                 <button
                                                                      type="button"
                                                                      className="btn btn-outline-primary btn-sm"
                                                                      onClick={() => {
                                                                           setSelectedCommission(entry);
                                                                           setShowBreakdownModal(true);
                                                                      }}
                                                                 >
                                                                      Breakdown
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                                  <tr className="fw-bold border-top">
                                                       <td className="py-2">Total</td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, entry) => sum + Number(entry.total_commission_amount), 0))}</td>
                                                       <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, entry) => sum + Number(entry.payment_amount), 0))}</td>
                                                       <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, entry) => sum + Number(entry.waived_amount), 0))}</td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                       <td className="py-2"></td>
                                                  </tr>
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         )}
                    </div>


               </div>

               <style jsx global>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
                    .table-responsive thead.sticky-top th {
                         border-bottom: 2px solid var(--bs-border-color);
                    }
                    .table-responsive thead th {
                         font-weight: bold !important;
                         color: #000 !important;
                    }
                    @media print {
                         .printable-table-with-borders tbody tr {
                              border: none !important;
                              border-bottom: 2px solid #000 !important;
                         }
                         .printable-table-with-borders tbody tr:nth-child(odd) {
                              background-color: #f8f9fa !important;
                         }
                         .printable-table-with-borders th,
                         .printable-table-with-borders td {
                              padding: 0.25rem 0.5rem !important;
                         }
                    }
               `}</style>

               {/* Breakdown Modal */}
               {showBreakdownModal && selectedCommission && (
                    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Commission Breakdown - {selectedCommission.batch_reference}</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowBreakdownModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        {breakdownLoading ? (
                                             <div className="d-flex flex-column justify-content-center align-items-center py-5">
                                                  <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                                       <span className="visually-hidden">Loading commission breakdown...</span>
                                                  </div>
                                                  <h6 className="text-muted">Loading Commission Breakdown</h6>
                                                  <p className="text-muted small">Please wait while we fetch the detailed breakdown data...</p>
                                             </div>
                                        ) : (
                                             <>
                                                  <div className="row g-3 mb-4">
                                                       <div className="col-md-6">
                                                            <div className="border rounded p-3">
                                                                 <h6 className="fw-bold mb-3">Commission Details</h6>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Batch Reference:</strong></div>
                                                                      <div className="col-6">{selectedCommission.batch_reference}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Period:</strong></div>
                                                                      <div className="col-6">{formatDateForTable(selectedCommission.start_date)} - {formatDateForTable(selectedCommission.end_date)}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Status:</strong></div>
                                                                      <div className="col-6">
                                                                           <span className={`badge ${selectedCommission.status === 'paid' ? 'bg-success' : selectedCommission.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                                {selectedCommission.status.charAt(0).toUpperCase() + selectedCommission.status.slice(1)}
                                                                           </span>
                                                                      </div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Payment Date:</strong></div>
                                                                      <div className="col-6">{formatDateForTable(selectedCommission.payment_date)}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Payment Mode:</strong></div>
                                                                      <div className="col-6">{selectedCommission.payment_mode}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Created By:</strong></div>
                                                                      <div className="col-6">{selectedCommission.created_by_username}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Recipient:</strong></div>
                                                                      <div className="col-6">{selectedCommission.recipient_name}</div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className="border rounded p-3">
                                                                 <h6 className="fw-bold mb-3">Financial Summary</h6>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Total Commission:</strong></div>
                                                                      <div className="col-6 fw-bold text-primary">{currencyFormatter.format(Number(selectedCommission.total_commission_amount))}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Payment Amount:</strong></div>
                                                                      <div className="col-6 fw-bold text-success">{currencyFormatter.format(Number(selectedCommission.payment_amount))}</div>
                                                                 </div>
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Waived Amount:</strong></div>
                                                                      <div className="col-6 fw-bold text-warning">{currencyFormatter.format(Number(selectedCommission.waived_amount))}</div>
                                                                 </div>
                                                                 <hr />
                                                                 <div className="row">
                                                                      <div className="col-6"><strong>Net Amount:</strong></div>
                                                                      <div className="col-6 fw-bold">
                                                                           {currencyFormatter.format(Number(selectedCommission.payment_amount) - Number(selectedCommission.waived_amount))}
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {selectedCommission.notes && (
                                                       <div className="mb-4">
                                                            <h6 className="fw-bold">Notes</h6>
                                                            <p className="mb-0 text-muted">{selectedCommission.notes}</p>
                                                       </div>
                                                  )}

                                                  <div className="border-top pt-4">
                                                       <h6 className="fw-bold mb-3">Commission Breakdown</h6>
                                                       {breakdownData.length > 0 ? (
                                                            <div className="table-responsive">
                                                                 <table className="table table-sm table-striped">
                                                                      <thead className="table-light">
                                                                           <tr>
                                                                                <th>Service ID</th>
                                                                                <th>Commission Due</th>
                                                                                <th>Amount Allocated</th>
                                                                                <th>Waived Amount</th>
                                                                                <th>Commission %</th>
                                                                                <th>Status</th>
                                                                                <th>Date</th>
                                                                           </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                           {breakdownData.map((item: any, index: number) => (
                                                                                <tr key={index}>
                                                                                     <td>{item.serviceid || 'N/A'}</td>
                                                                                     <td>{currencyFormatter.format(Number(item.commission_due || 0))}</td>
                                                                                     <td>{currencyFormatter.format(Number(item.amount_allocated || 0))}</td>
                                                                                     <td>{currencyFormatter.format(Number(item.waived_amount || 0))}</td>
                                                                                     <td>{item.commission_percentage || 'N/A'}%</td>
                                                                                     <td>
                                                                                          <span className={`badge ${item.status === 'paid' ? 'bg-success' : item.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                                               {item.status || 'N/A'}
                                                                                          </span>
                                                                                     </td>
                                                                                     <td>{item.created_at ? formatDateForTable(item.created_at) : 'N/A'}</td>
                                                                                </tr>
                                                                           ))}
                                                                           <tr className="fw-bold border-top">
                                                                                <td>Total</td>
                                                                                <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.commission_due || 0), 0))}</td>
                                                                                <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.amount_allocated || 0), 0))}</td>
                                                                                <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.waived_amount || 0), 0))}</td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                           </tr>
                                                                      </tbody>
                                                                 </table>
                                                            </div>
                                                       ) : (
                                                            <div className="text-center py-4">
                                                                 <p className="text-muted">No detailed breakdown data available for this commission batch.</p>
                                                            </div>
                                                       )}
                                                  </div>
                                             </>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowBreakdownModal(false)}>Close</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

          </div>
     );
}
