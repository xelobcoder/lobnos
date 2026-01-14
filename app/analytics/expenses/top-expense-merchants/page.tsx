"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiShoppingBagLine, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiCalendarEventLine, RiRefreshLine, RiPrinterLine, RiEyeLine } from "@remixicon/react";
import dayjs from 'dayjs';

// Color variables to match sales chart
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue
const COLOR_TERTIARY = '#ea580c'; // Orange
const COLOR_EXPENSES = '#dc2626'; // Red

interface TopExpenseMerchant {
     merchant_id: number;
     merchant_name: string;
     expense_date: string;
     total_amount: string;
     expense_count: number;
}

interface MerchantPaymentDetail {
     payment_id: string;
     payment_date: string;
     payment_amount: string;
     payment_method: string;
     payment_status: string;
     expense_date: string;
     expense_description: string;
     category_name: string;
     employee_name: string;
}

export default function TopExpenseMerchants() {
     const [data, setData] = useState<TopExpenseMerchant[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [startDate, setStartDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
     });
     const [endDate, setEndDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
     });
     const [branches, setBranches] = useState<any[]>([]);
     const [branchid, setBranchid] = useState<number | null>(null);
     const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
     const [showDetailsModal, setShowDetailsModal] = useState(false);
     const [selectedMerchant, setSelectedMerchant] = useState<string>("");
     const [merchantPayments, setMerchantPayments] = useState<MerchantPaymentDetail[]>([]);
     const [loadingPayments, setLoadingPayments] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(10);
     const [totalRecords, setTotalRecords] = useState(0);
     const [totalPages, setTotalPages] = useState(0);
     const { user } = useApplication();

     const fetchData = async () => {
          if (!branchid) return;
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/trends/merchant?branchid=${branchid}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
               const response = await customFetch(endpoint);
               const { data } = response;
               if (response && data && Array.isArray(data)) {
                    setData(data);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err: any) {
               setError(err.message || "Failed to fetch data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          async function fetchBranches() {
               try {
                    const response = await customFetch("branches");
                    if (response && Array.isArray(response.result)) {
                         setBranches(response.result);
                         if (response.result.length > 0) setBranchid(response.result[0].branchid);
                    }
               } catch { }
          }
          fetchBranches();
     }, []);

     useEffect(() => {
          if (branchid) {
               fetchData();
          }
     }, [branchid]);

     const totalAmountSum = data.reduce((sum, entry) => sum + parseFloat(entry.total_amount), 0);
     const totalExpenseCount = data.reduce((sum, entry) => sum + entry.expense_count, 0);

     // Prepare data for the chart
     const chartData = useMemo(() =>
          data.map(item => ({
               ...item,
               total_amount: parseFloat(item.total_amount),
               merchant_name: item.merchant_name
          })), [data]);

     const totalChartAmountSum = useMemo(() => chartData.reduce((sum, entry) => sum + entry.total_amount, 0), [chartData]);

     // Prepare chart data for modal payments
     const modalChartData = useMemo(() => {
          const grouped = merchantPayments.reduce((acc, payment) => {
               console.log('Payment date:', payment.payment_date, 'Type:', typeof payment.payment_date);
               const paymentDate = dayjs(payment.payment_date);
               if (!paymentDate.isValid()) {
                    console.log('Invalid date:', payment.payment_date);
                    return acc; // Skip invalid dates
               }

               const date = paymentDate.format('DD-MM-YYYY');
               if (!acc[date]) {
                    acc[date] = { date, totalAmount: 0, count: 0 };
               }
               acc[date].totalAmount += parseFloat(payment.payment_amount) || 0;
               acc[date].count += 1;
               return acc;
          }, {} as Record<string, { date: string; totalAmount: number; count: number }>);

          return Object.values(grouped)
               .filter(item => dayjs(item.date, 'DD-MM-YYYY').isValid())
               .sort((a, b) => dayjs(a.date, 'DD-MM-YYYY').valueOf() - dayjs(b.date, 'DD-MM-YYYY').valueOf());
     }, [merchantPayments]);

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const entry = payload[0].payload;
               const percentageOfTotal = totalChartAmountSum > 0 ? ((entry.total_amount / totalChartAmountSum) * 100).toFixed(1) : '0.0';
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: COLOR_TOOLTIP_BG,
                              borderColor: COLOR_BORDER,
                              minWidth: '200px',
                              fontSize: '0.8rem'
                         }}
                    >
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Merchant</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.merchant_name}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                   {currencyFormatter.format(entry.total_amount)} ({percentageOfTotal}%)
                              </span>
                         </div>
                         <div>
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expense Count</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.expense_count}</span>
                         </div>
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
               dataKey: "merchant_name",
               tickFormatter: (value: string) => value.length > 15 ? `${value.substring(0, 15)}...` : value,
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

          if (chartType === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
               );
          }
          if (chartType === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }
          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorTotalSpentFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorTotalSpentFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const viewButtons = [
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     const handleResetFilters = () => {
          const now = new Date();
          setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
          setEndDate(new Date().toISOString().slice(0, 10));
     };

     const openDetailsModal = async (merchant: TopExpenseMerchant, page: number = 1) => {
          setSelectedMerchant(merchant.merchant_name);
          setShowDetailsModal(true);
          setLoadingPayments(true);
          setCurrentPage(page);
          try {
               const merchantParam = encodeURIComponent(merchant.merchant_id);
               const endpoint = `expenses/analytics/payments-by-merchant/${merchantParam}?count=${pageSize}&page=${page}`;
               const response = await customFetch(endpoint);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setMerchantPayments(response.data || []);
                    // Update pagination info
                    if (response.pagination) {
                         setTotalRecords(response.pagination.totalRecords || 0);
                         setTotalPages(response.pagination.totalPages || 0);
                    }
               } else {
                    setMerchantPayments([]);
                    setTotalRecords(0);
                    setTotalPages(0);
               }
          } catch (error) {
               setMerchantPayments([]);
               setTotalRecords(0);
               setTotalPages(0);
          } finally {
               setLoadingPayments(false);
          }
     };

     const closeDetailsModal = () => {
          setShowDetailsModal(false);
          setSelectedMerchant("");
          setMerchantPayments([]);
          setCurrentPage(1);
          setTotalRecords(0);
          setTotalPages(0);
     };

     const handlePageChange = async (page: number) => {
          if (selectedMerchant && data.find(m => m.merchant_name === selectedMerchant)) {
               const merchant = data.find(m => m.merchant_name === selectedMerchant);
               if (merchant) {
                    await openDetailsModal(merchant, page);
               }
          }
     };

     const handlePageSizeChange = async (newSize: number) => {
          if (newSize < 1) newSize = 1;
          if (newSize > 100) newSize = 100;
          setPageSize(newSize);
          setCurrentPage(1); // Reset to page 1
          if (selectedMerchant) {
               const merchant = data.find(m => m.merchant_name === selectedMerchant);
               if (merchant) {
                    await openDetailsModal(merchant, 1);
               }
          }
     };

     const handleApplyPageSize = async () => {
          let validSize = pageSize;
          if (validSize < 1) validSize = 1;
          if (validSize > 100) validSize = 100;
          setPageSize(validSize);
          setCurrentPage(1);
          if (selectedMerchant) {
               const merchant = data.find(m => m.merchant_name === selectedMerchant);
               if (merchant) {
                    await openDetailsModal(merchant, 1);
               }
          }
     };

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiShoppingBagLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Top Expense Merchants
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                   {viewButtons.map(btn => (
                                        <button
                                             key={btn.type}
                                             type="button"
                                             className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => setChartType(btn.type)}
                                             style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
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
                                        <input id="startDateTEM" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                                   </div>
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                             <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                        </span>
                                        <input id="endDateTEM" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} min={startDate} />
                                   </div>
                                   <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        <RiRefreshLine size={16} className="me-1" /> Reset
                                   </button>
                                   <button onClick={fetchData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>
                                        <RiLoader4Line size={16} className="me-1" /> Load Data
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    {loading ? (
                         <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading merchant data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                         </div>
                    ) : data.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                                   No merchant expense data for the selected period.
                              </p>
                         </div>
                    ) : (
                         <div>
                              <div style={{ width: "100%", height: 350 }} className="mb-4">
                                   <ResponsiveContainer>
                                        {renderChart()}
                                   </ResponsiveContainer>
                              </div>
                              <div>
                                   <div className="d-flex justify-content-between mb-2">
                                        <h4 className="fs-6 fw-medium mb-3">
                                             Top Expense Merchants Data
                                        </h4>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                             Print
                                        </button>
                                   </div>
                                   <div className="print-date-range" style={{ display: 'none' }}>
                                        Expense Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                   </div>
                                   <div className="table-responsive" style={{ maxHeight: 'none' }}>
                                        <table className="table table-hover table-striped printable-table-with-borders" style={{ fontSize: '1.1rem' }}>
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th scope="col" className="py-2 text-start">#</th>
                                                       <th scope="col" className="py-2 text-start">Merchant Name</th>
                                                       <th scope="col" className="py-2 text-start">Total Amount</th>
                                                       <th scope="col" className="py-2 text-start">Expense Count</th>
                                                       <th scope="col" className="py-2 text-start">Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.map((merchant, idx) => (
                                                       <tr key={`${merchant.merchant_name}-${idx}`}>
                                                            <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                            <td className="py-2 text-start fw-medium">{merchant.merchant_name}</td>
                                                            <td className="py-2 text-start fw-medium">{currencyFormatter.format(parseFloat(merchant.total_amount))}</td>
                                                            <td className="py-2 text-start">{merchant.expense_count}</td>
                                                            <td className="py-2 text-start">
                                                                 <button className="btn btn-sm btn-outline-primary" onClick={() => openDetailsModal(merchant)}>
                                                                      <RiEyeLine size={14} className="me-1" />
                                                                      View Details
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                             <tfoot>
                                                  <tr className="fw-bold border-top">
                                                       <td className="py-2 text-start" colSpan={2}>Total</td>
                                                       <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                                       <td className="py-2 text-start">{totalExpenseCount}</td>
                                                       <td className="py-2 text-start"></td>
                                                  </tr>
                                             </tfoot>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
               {data.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="row g-3">
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-primary">{data.length}</div>
                                        <div className="text-muted small">Top Merchants</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-success">{currencyFormatter.format(totalAmountSum)}</div>
                                        <div className="text-muted small">Total Expenses</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-info">{totalExpenseCount}</div>
                                        <div className="text-muted small">Total Transactions</div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {showDetailsModal && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Payment Details - {selectedMerchant}
                                             {totalRecords > 0 && <small className="text-muted ms-2">({totalRecords} total payments)</small>}
                                        </h5>
                                        <button type="button" className="btn-close" onClick={closeDetailsModal}></button>
                                   </div>
                                   <div className="modal-body">
                                        {loadingPayments ? (
                                             <div className="d-flex flex-column justify-content-center align-items-center py-4">
                                                  <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                                                  <p className="text-muted">Loading payment details...</p>
                                             </div>
                                        ) : merchantPayments.length === 0 ? (
                                             <div className="text-center py-4">
                                                  <RiInbox2Line size={48} className="mb-3 text-muted" />
                                                  <h5 className="fw-medium mb-1">No Payment Data Available</h5>
                                                  <p className="text-muted">No payment details found for this merchant.</p>
                                             </div>
                                        ) : (
                                             <div>
                                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                                       <div className="d-flex align-items-center">
                                                            <label htmlFor="pageSizeInput" className="form-label small fw-medium mb-0 me-2">Items per page:</label>
                                                            <input
                                                                 id="pageSizeInput"
                                                                 type="number"
                                                                 className="form-control form-control-sm"
                                                                 value={pageSize}
                                                                 onChange={(e) => setPageSize(Number(e.target.value))}
                                                                 min="1"
                                                                 max="100"
                                                                 style={{ width: '70px' }}
                                                            />
                                                            <button className="btn btn-sm btn-outline-primary ms-2" onClick={handleApplyPageSize}>Apply</button>
                                                       </div>
                                                       <div className="text-muted small">
                                                            Total: {totalRecords} payments
                                                       </div>
                                                  </div>
                                                  {modalChartData.length > 0 && (
                                                       <div style={{ width: "100%", height: 250 }} className="mb-3">
                                                            <ResponsiveContainer>
                                                                 <LineChart data={modalChartData} margin={{ top: 5, right: 5, left: 20, bottom: 45 }}>
                                                                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                                      <XAxis
                                                                           dataKey="date"
                                                                           tickFormatter={(value) => {
                                                                                const date = dayjs(value, 'DD-MM-YYYY');
                                                                                return date.isValid() ? date.format('DD-MM-YYYY') : value;
                                                                           }}
                                                                           angle={-45}
                                                                           textAnchor="end"
                                                                           height={60}
                                                                           interval="preserveStartEnd"
                                                                           tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                           axisLine={{ stroke: COLOR_BORDER }}
                                                                           tickLine={{ stroke: COLOR_BORDER }}
                                                                      />
                                                                      <YAxis
                                                                           tickFormatter={(value: number) => currencyFormatter.format(value)}
                                                                           tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                           axisLine={false}
                                                                           tickLine={false}
                                                                           width={95}
                                                                      />
                                                                      <Tooltip
                                                                           content={({ active, payload, label }) => {
                                                                                if (active && payload && payload.length) {
                                                                                     const data = payload[0].payload;
                                                                                     return (
                                                                                          <div
                                                                                               className="rounded-lg border p-2 shadow-sm"
                                                                                               style={{
                                                                                                    backgroundColor: COLOR_TOOLTIP_BG,
                                                                                                    borderColor: COLOR_BORDER,
                                                                                                    minWidth: '180px',
                                                                                                    fontSize: '0.8rem'
                                                                                               }}
                                                                                          >
                                                                                               <div className="mb-1">
                                                                                                    <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                                                                                                    <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                                                                                               </div>
                                                                                               <div className="mb-1">
                                                                                                    <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                                                                                                    <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                                                                                         {currencyFormatter.format(data.totalAmount)}
                                                                                                    </span>
                                                                                               </div>
                                                                                               <div>
                                                                                                    <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Payments</span>
                                                                                                    <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{data.count}</span>
                                                                                               </div>
                                                                                          </div>
                                                                                     );
                                                                                }
                                                                                return null;
                                                                           }}
                                                                           cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                                                                      />
                                                                      <Line type="monotone" dataKey="totalAmount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                                                                 </LineChart>
                                                            </ResponsiveContainer>
                                                       </div>
                                                  )}
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped">
                                                            <thead className="table-light">
                                                                 <tr>
                                                                      <th className="py-2">#</th>
                                                                      <th className="py-2">Payment Date</th>
                                                                      <th className="py-2">Amount</th>
                                                                      <th className="py-2">Method</th>
                                                                      <th className="py-2">Status</th>
                                                                      <th className="py-2">Expense Date</th>
                                                                      <th className="py-2">Description</th>
                                                                      <th className="py-2">Category</th>
                                                                      <th className="py-2">Employee</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {merchantPayments.map((payment, idx) => (
                                                                      <tr key={payment.payment_id}>
                                                                           <td className="py-2">{idx + 1}</td>
                                                                           <td className="py-2">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                                           <td className="py-2 fw-medium">{currencyFormatter.format(parseFloat(payment.payment_amount))}</td>
                                                                           <td className="py-2">{payment.payment_method}</td>
                                                                           <td className="py-2">
                                                                                <span className={`badge ${payment.payment_status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                                                                                     {payment.payment_status}
                                                                                </span>
                                                                           </td>
                                                                           <td className="py-2">{new Date(payment.expense_date).toLocaleDateString()}</td>
                                                                           <td className="py-2" style={{ maxWidth: '200px' }}>
                                                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payment.expense_description}>
                                                                                     {payment.expense_description}
                                                                                </div>
                                                                           </td>
                                                                           <td className="py-2">{payment.category_name}</td>
                                                                           <td className="py-2">{payment.employee_name}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}
                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                             <div className="d-flex justify-content-between align-items-center mt-3">
                                                  <div className="text-muted small">
                                                       Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} payments
                                                  </div>
                                                  <nav aria-label="Payment pagination">
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
                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                 let pageNum;
                                                                 if (totalPages <= 5) {
                                                                      pageNum = i + 1;
                                                                 } else if (currentPage <= 3) {
                                                                      pageNum = i + 1;
                                                                 } else if (currentPage >= totalPages - 2) {
                                                                      pageNum = totalPages - 4 + i;
                                                                 } else {
                                                                      pageNum = currentPage - 2 + i;
                                                                 }
                                                                 return (
                                                                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                                           <button
                                                                                className="page-link"
                                                                                onClick={() => handlePageChange(pageNum)}
                                                                           >
                                                                                {pageNum}
                                                                           </button>
                                                                      </li>
                                                                 );
                                                            })}
                                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                 <button
                                                                      className="page-link"
                                                                      onClick={() => handlePageChange(currentPage + 1)}
                                                                      disabled={currentPage === totalPages}
                                                                 >
                                                                      Next
                                                                 </button>
                                                            </li>
                                                       </ul>
                                                  </nav>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeDetailsModal}>Close</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
               {showDetailsModal && <div className="modal-backdrop fade show" onClick={closeDetailsModal}></div>}


               <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          </div>
     );
}