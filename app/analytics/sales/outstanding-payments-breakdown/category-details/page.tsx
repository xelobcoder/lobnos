"use client";

import { RiArrowLeftLine, RiCalendarEventLine, RiLoader4Line, RiTableLine, RiBankCardLine, RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiRefreshLine, RiMoneyDollarCircleLine } from "@remixicon/react";
import dayjs from "dayjs";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import { customFetch, currencyFormatter } from "../../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { plsEncryption } from "../../../../../lib/encryption";

interface ServiceDetail {
     service_name: string;
     outstanding: number;
}

interface TransactionDetail {
     billingid: number;
     patientid: number;
     patient_id?: number;
     patient_name: string;
     organization_name: string;
     total_transaction_outstanding: number;
     services: ServiceDetail[];
}

interface OrganizationSummary {
     organization_name: string;
     total_outstanding: string;
}

interface CategoryDetailsResponse {
     byOrganization: OrganizationSummary[];
     byTransaction: TransactionDetail[];
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const AnalyticCard = ({ title, value, Icon, bgColor, iconColor }: any) => (
     <div
          className="card border-0 shadow-sm rounded"
          style={{
               background: bgColor,
               borderRadius: "8px",
               transition: "all 0.2s ease",
               height: "150px",
               border: "1px solid var(--bs-border-color)",
               color: "white",
               cursor: "pointer",
          }}
          onMouseEnter={(e) => {
               e.currentTarget.style.transform = "translateY(-2px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          }}
     >
          <div className="card-body p-3 d-flex flex-column h-100">
               <div className="d-flex align-items-center mb-2">
                    <div
                         className="d-flex align-items-center justify-content-center me-2"
                         style={{
                              background: iconColor,
                              padding: "6px",
                              borderRadius: "6px",
                              width: "32px",
                              height: "32px",
                         }}
                    >
                         <Icon size={20} style={{ color: "white" }} />
                    </div>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: "1rem", lineHeight: "1.2", color: "rgba(255,255,255,0.9)" }}>
                         {title}
                    </h6>
               </div>
               <hr className="my-2" style={{ borderColor: "rgba(255,255,255,0.3)", borderWidth: "1px" }} />
               <div className="fw-bold" style={{ fontSize: "1.8rem", lineHeight: "1.3" }}>
                    {value}
               </div>
          </div>
     </div>
);

export default function CategoryDetailsPage() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const category = searchParams?.get("category") || "";
     const initialStartDate = searchParams?.get("startdate") || dayjs().startOf("month").format("YYYY-MM-DD");
     const initialEndDate = searchParams?.get("enddate") || dayjs().endOf("month").format("YYYY-MM-DD");

     const [data, setData] = useState<CategoryDetailsResponse | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [view, setView] = useState<"line" | "bar" | "area">("bar");
     const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
     
     // Date filter states
     const [dateFilter, setDateFilter] = useState("");
     const [selectedDate, setSelectedDate] = useState({
          _dateFrom: initialStartDate,
          _dateEnd: initialEndDate
     });

     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const formatCurrency = (value: string | number | undefined | null): string => {
          if (value === null || value === undefined) return "GHS 0.00";
          const num = typeof value === "string" ? parseFloat(value) : value;
          if (isNaN(num)) return "GHS 0.00";
          return new Intl.NumberFormat("en-GH", {
               style: "currency",
               currency: "GHS",
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
          }).format(num);
     };

     const fetchCategoryDetails = async () => {
          if (!user?.employeeid || !category) return;
          setLoading(true);
          setError(null);

          try {
               const endpoint = `outstanding/report/service-category?startdate=${selectedDate._dateFrom}&enddate=${selectedDate._dateEnd}&employeeid=${user.employeeid}&tenantId=${user.tenantid}&serviceCategory=${encodeURIComponent(category)}`;
               const response = await customFetch(endpoint);
               
               if (response?.result) {
                    setData(response.result);
               } else {
                    setData(null);
               }
          } catch (err) {
               setError("Error fetching category details");
               setData(null);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchCategoryDetails();
     }, [user?.employeeid, category, selectedDate._dateFrom, selectedDate._dateEnd]);

     const COLOR_ACCENT = "oklch(0.646 0.222 41.116)";
     const COLOR_BORDER = "var(--bs-border-color)";

     const totals = useMemo(() => {
          if (!data?.byTransaction) return { outstanding: 0 };
          return data.byTransaction.reduce((acc, item) => {
               acc.outstanding += Number(item.total_transaction_outstanding || 0);
               return acc;
          }, { outstanding: 0 });
     }, [data]);

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
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Organization</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color || COLOR_ACCENT }}>
                                        {currencyFormatter.format(item.value)}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderChart = () => {
          if (!data) return null;
          
          const commonProps = {
               data: data.byOrganization,
               margin: { top: 20, right: 30, left: 20, bottom: 60 },
          };

          const xAxisProps = {
               dataKey: "organization_name",
               angle: -45,
               textAnchor: "end" as const,
               interval: 0,
               height: 80,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => `GHS ${value}`,
               tick: { fontSize: 12, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               wrapperStyle: { paddingBottom: '20px', fontSize: '13px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bs-border-color-translucent)" />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_outstanding" name="Outstanding Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]}>
                              {data.byOrganization.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLOR_ACCENT : '#2563eb'} />
                              ))}
                         </Bar>
                    </BarChart>
               );
          }

          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bs-border-color-translucent)" />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} />
                         <Legend {...legendProps} />
                         <Line 
                              type="monotone" 
                              dataKey="total_outstanding" 
                              name="Outstanding Amount" 
                              stroke={COLOR_ACCENT} 
                              strokeWidth={2}
                              dot={{ r: 4, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6 }}
                         />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bs-border-color-translucent)" />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend {...legendProps} />
                    <Area 
                         type="monotone" 
                         dataKey="total_outstanding" 
                         name="Outstanding Amount" 
                         stroke={COLOR_ACCENT} 
                         fillOpacity={1} 
                         fill="url(#colorOutstanding)" 
                    />
               </AreaChart>
          );
     };

     const viewButtons = [
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header Section */}
               <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                         <button 
                              onClick={() => window.close()} 
                              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                         >
                              <RiArrowLeftLine size={16} /> Close Tab
                         </button>
                         {selectedTransactions.length > 0 && (
                              <button 
                                   onClick={() => {
                                        const pids = data?.byTransaction
                                             .filter(t => selectedTransactions.includes(t.billingid))
                                             .map(t => t.patientid || t.patient_id)
                                             .filter(Boolean);
                                        
                                        const uniquePid = pids && pids.length > 0 ? pids[0] : "";
                                        const billingIds = selectedTransactions.join(",");
                                        
                                        const url = `/billing/cash-collection?patientid=${plsEncryption((uniquePid || "").toString())}&&billingid=${billingIds}&&paymentstatus=pending`;
                                        window.open(url, '_blank');
                                   }}
                                   className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm animate-in fade-in zoom-in"
                              >
                                   <RiMoneyDollarCircleLine size={16} />
                                   Bulk Cash Payment ({selectedTransactions.length})
                              </button>
                         )}
                         <h1 className="fs-5 fw-bold mb-0 d-flex align-items-center gap-2">
                              <RiTableLine size={24} style={{ color: COLOR_ACCENT }} />
                              {category} - Outstanding Breakdown
                         </h1>
                    </div>

                    <div style={{ minWidth: '250px' }}>
                         <DateFilterReusable
                              value={dateFilter}
                              onChange={setDateFilter}
                              onDateRangeChange={(startDate, endDate) => {
                                   setSelectedDate({
                                        _dateFrom: startDate,
                                        _dateEnd: endDate
                                   });
                              }}
                              label="Change Date Range"
                              className="w-100"
                         />
                    </div>
               </div>

               {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "300px" }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Fetching breakdown for {category}...</p>
                    </div>
               ) : error ? (
                    <div className="p-5 text-center">
                         <p className="text-danger fw-bold mb-2">{error}</p>
                         <button onClick={fetchCategoryDetails} className="btn btn-sm btn-primary">Try Again</button>
                    </div>
               ) : !data || (!data.byOrganization.length && !data.byTransaction.length) ? (
                    <div className="p-5 text-center text-muted card" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                         No outstanding records found for this category in the selected period.
                    </div>
               ) : (
                    <>
                         {/* Total Outstanding - Full Row */}
                         <div className="row">
                              <div className="col-12">
                                   <AnalyticCard 
                                        title="Total Category Outstanding" 
                                        value={currencyFormatter.format(totals.outstanding)} 
                                        Icon={RiBankCardLine} 
                                        bgColor="#ea580c" 
                                        iconColor="#ef4444" 
                                   />
                              </div>
                         </div>

                         {/* Organization Summary Card - Table on Top, Chart at Bottom */}
                         <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                   <h6 className="mb-0 fw-bold small text-uppercase d-flex align-items-center">
                                        <RiBarChartBoxLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
                                        Organization Summary & Distribution
                                   </h6>
                              </div>
                              <div className="card-body p-0">
                                   {/* Table Part */}
                                   <div className="table-responsive border-bottom">
                                        <table className="table table-hover mb-0">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th className="px-4 py-3 small text-uppercase fw-bold" style={{ color: COLOR_TEXT_MUTED }}>Organization Name</th>
                                                       <th className="px-4 py-3 small text-uppercase fw-bold text-end" style={{ color: COLOR_TEXT_MUTED }}>Outstanding Amount</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.byOrganization.map((org, idx) => (
                                                       <tr key={idx}>
                                                            <td className="px-4 py-3 small fw-medium">{org.organization_name}</td>
                                                            <td className="px-4 py-3 small text-end fw-bold">{currencyFormatter.format(Number(org.total_outstanding))}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   {/* Chart Part */}
                                   <div className="p-4">
                                        <div className="d-flex justify-content-end mb-3">
                                             <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                  {viewButtons.map(btn => (
                                                       <button
                                                            key={btn.type}
                                                            type="button"
                                                            className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                            onClick={() => setView(btn.type)}
                                                            style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                       >
                                                            <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                                       </button>
                                                  ))}
                                             </div>
                                        </div>
                                        <div style={{ height: '400px', width: '100%' }}>
                                             {data.byOrganization && data.byOrganization.length > 0 && (
                                                  <ResponsiveContainer width="100%" height="100%">
                                                       {renderChart() as React.ReactElement<any>}
                                                  </ResponsiveContainer>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Transactions Table - Full Row */}
                         <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4 bg-light d-flex justify-content-between align-items-center" style={{ borderColor: COLOR_BORDER }}>
                                   <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-2 text-muted small fw-bold text-uppercase">
                                             <RiTableLine size={18} />
                                             <span>Detailed Services Breakdown</span>
                                        </div>
                                        {selectedTransactions.length > 0 && (
                                             <button 
                                                  onClick={() => {
                                                       const pids = data.byTransaction
                                                            .filter(t => selectedTransactions.includes(t.billingid))
                                                            .map(t => t.patientid || t.patient_id)
                                                            .filter(Boolean);
                                                       
                                                       const uniquePid = pids.length > 0 ? pids[0] : "";
                                                       const billingIds = selectedTransactions.join(",");
                                                       
                                                       const url = `/billing/cash-collection?patientid=${plsEncryption((uniquePid || "").toString())}&&billingid=${billingIds}&&paymentstatus=pending`;
                                                       window.open(url, '_blank');
                                                  }}
                                                  className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm animate-in fade-in zoom-in"
                                             >
                                                  <RiMoneyDollarCircleLine size={16} />
                                                  Bulk Cash Payment ({selectedTransactions.length})
                                             </button>
                                        )}
                                   </div>
                                   <div className="d-flex align-items-center gap-3">
                                        <div className="small text-muted d-none d-sm-block">
                                             <RiCalendarEventLine size={16} className="me-1" />
                                             <span>{dayjs(selectedDate._dateFrom).format("MMM DD, YYYY")} - {dayjs(selectedDate._dateEnd).format("MMM DD, YYYY")}</span>
                                        </div>
                                        <span className="badge bg-primary px-3 py-2">{data.byTransaction.length} Transactions</span>
                                   </div>
                              </div>

                              <div className="card-body p-0">
                                   <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th className="px-4 py-3" style={{ width: '40px' }}>
                                                            <input 
                                                                 type="checkbox" 
                                                                 className="form-check-input"
                                                                 checked={selectedTransactions.length === data.byTransaction.length && data.byTransaction.length > 0}
                                                                 onChange={(e) => {
                                                                      if (e.target.checked) {
                                                                           setSelectedTransactions(data.byTransaction.map(t => t.billingid));
                                                                      } else {
                                                                           setSelectedTransactions([]);
                                                                      }
                                                                 }}
                                                            />
                                                       </th>
                                                       <th className="px-4 py-3">Billing ID</th>
                                                       <th className="px-4 py-3">Patient & Organization</th>
                                                       <th className="px-4 py-3">Service Breakdown</th>
                                                       <th className="px-4 py-3 text-end">Total Outstanding</th>
                                                       <th className="px-4 py-3 text-center">Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.byTransaction.map((item, index) => (
                                                       <tr key={index} className={selectedTransactions.includes(item.billingid) ? "table-primary-subtle" : ""}>
                                                            <td className="px-4 py-3 align-top">
                                                                 <input 
                                                                      type="checkbox" 
                                                                      className="form-check-input"
                                                                      checked={selectedTransactions.includes(item.billingid)}
                                                                      onChange={(e) => {
                                                                           if (e.target.checked) {
                                                                                setSelectedTransactions(prev => [...prev, item.billingid]);
                                                                           } else {
                                                                                setSelectedTransactions(prev => prev.filter(id => id !== item.billingid));
                                                                           }
                                                                      }}
                                                                 />
                                                            </td>
                                                            <td className="px-4 py-3 fw-medium align-top">{item.billingid}</td>
                                                            <td className="px-4 py-3 align-top">
                                                                 <div className="fw-semibold">{item.patient_name}</div>
                                                                 <div className="small text-muted text-uppercase">{item.organization_name}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                 <div className="d-flex flex-column gap-2">
                                                                      {item.services.map((svc, sIdx) => (
                                                                           <div key={sIdx} className="d-flex justify-content-between align-items-center bg-light rounded px-3 py-2 small">
                                                                                <span className="text-muted fw-medium">{svc.service_name}</span>
                                                                                <span className="fw-bold">{currencyFormatter.format(svc.outstanding)}</span>
                                                                           </div>
                                                                      ))}
                                                                 </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-end fw-bold text-danger align-top">
                                                                 {currencyFormatter.format(item.total_transaction_outstanding)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center align-top">
                                                                 <button
                                                                      onClick={() => {
                                                                           const pid = item.patientid || item.patient_id;
                                                                           const url = `/billing/cash-collection?patientid=${plsEncryption((pid || "").toString())}&&billingid=${item.billingid}&&paymentstatus=pending`;
                                                                           window.open(url, '_blank');
                                                                      }}
                                                                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 mx-auto"
                                                                      title="Settle Outstanding Bill"
                                                                 >
                                                                      <RiMoneyDollarCircleLine size={16} />
                                                                      Cash Collection
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    </>
               )}

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
                         color: var(--bs-body-color) !important;
                         background-color: var(--bs-tertiary-bg) !important;
                    }
               `}</style>
          </div>
     );
}
