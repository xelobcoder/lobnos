"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import {
     ResponsiveContainer,
     PieChart,
     Pie,
     Cell,
     Tooltip,
     Legend,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     LineChart,
     Line,
     Area,
     AreaChart,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🚀</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconLine = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📈</span>;
const IconArea = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>�</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', color: "#64748B" }}>📅</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_HOVER = 'oklch(0.646 0.222 41.116 / 0.1)';

const PIE_CHART_COLORS = [
     COLOR_ACCENT, 'oklch(0.6 0.15 142)', 'oklch(0.7 0.2 85)', 'oklch(0.5 0.25 25)',
     'oklch(0.55 0.2 15)', '#A855F7', '#EC4899', '#78716C', '#F97316', '#D946EF'
];

export default function TopFacilitiesOutsourcingAnalytics() {
     const [data, setData] = useState<any[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [view, setView] = useState<"bar" | "pie" | "line" | "area">("bar");
     const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
     const [branches, setBranches] = useState<any[]>([]);
     const [branchesLoading, setBranchesLoading] = useState<boolean>(false);
     const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

     const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

     const fetchBranches = useCallback(async () => {
          setBranchesLoading(true);
          try {
               const response = await customFetch('branches');
               if (response && response.result && Array.isArray(response.result)) {
                    setBranches(response.result);
                    if (response.result.length > 0 && selectedBranch === undefined) {
                         setSelectedBranch(response.result[0].branchid);
                    }
               } else if (response && Array.isArray(response)) {
                    setBranches(response);
                    if (response.length > 0 && selectedBranch === undefined) {
                         setSelectedBranch(response[0].branchid);
                    }
               } else {
                    setBranches([]);
               }
          } catch (err) {
               setBranches([]);
          } finally {
               setBranchesLoading(false);
          }
     }, [selectedBranch]);

     const fetchData = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const branchParam = selectedBranch ? `&branchid=${selectedBranch}` : '';
               const url = `financials/billing/summary?key=top20OutsourcedFacilities${branchParam}&year=${selectedYear}`;

               const response = await customFetch(url);
               if (response && Array.isArray(response)) {
                    setData(response);
               } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                    setData([response]);
               } else {
                    setData([]);
                    setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
               }
          } catch (err) {
               setData([]);
               setError(err instanceof Error ? err.message : "An unknown error occurred");
          } finally {
               setLoading(false);
          }
     }, [selectedBranch, selectedYear]);

     useEffect(() => {
          fetchBranches();
     }, [fetchBranches]);

     useEffect(() => {
          if (selectedBranch !== undefined) {
               fetchData();
          }
     }, [selectedBranch, selectedYear, fetchData]);

     const calculateTotals = () => {
          if (!data.length) return { totalAmount: 0, totalServices: 0 };

          return data.reduce((acc, item) => {
               const amount = parseFloat(item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
               const services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
               return {
                    totalAmount: acc.totalAmount + amount,
                    totalServices: acc.totalServices + services
               };
          }, { totalAmount: 0, totalServices: 0 });
     };

     const { totalAmount, totalServices } = calculateTotals();

     const CustomTooltipContent = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const currentData = payload[0].payload;
               const name = label || currentData.facility_name || currentData.outsourced_facility;

               return (
                    <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, color: COLOR_TOOLTIP_FG, minWidth: '200px', fontSize: '0.8rem' }}>
                         <div className="mb-2 fw-medium" style={{ color: COLOR_TOOLTIP_FG }}>{name}</div>

                         {currentData.total_amount_outsourced && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Outsourced</span>
                                   <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                        {currencyFormatter.format(currentData.total_amount_outsourced)}
                                   </span>
                              </div>
                         )}

                         {(currentData.services_count || currentData.total_services || currentData.total_outsourced_services) && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Services</span>
                                   <span className="fw-bold d-block">
                                        {currentData.services_count || currentData.total_services || currentData.total_outsourced_services}
                                   </span>
                              </div>
                         )}

                         {(currentData.facility_name || currentData.outsourced_facility) && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Facility</span>
                                   <span className="fw-bold d-block">
                                        {currentData.facility_name || currentData.outsourced_facility}
                                   </span>
                              </div>
                         )}

                         {currentData.contactPerson && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Contact</span>
                                   <span className="fw-bold d-block">
                                        {currentData.contactPerson}
                                   </span>
                              </div>
                         )}

                         {currentData.contactNumber && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Phone</span>
                                   <span className="fw-bold d-block">
                                        {currentData.contactNumber}
                                   </span>
                              </div>
                         )}

                         {currentData.organizationType && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Type</span>
                                   <span className="fw-bold d-block">
                                        {currentData.organizationType}
                                   </span>
                              </div>
                         )}

                         {totalAmount > 0 && currentData.total_amount_outsourced && (
                              <div className="mt-2 pt-1 border-top" style={{ borderColor: COLOR_BORDER }}>
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Share of Total</span>
                                   <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                        {((currentData.total_amount_outsourced / totalAmount) * 100).toFixed(1)}%
                                   </span>
                              </div>
                         )}
                    </div>
               );
          }
          return null;
     };

     const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
          const RADIAN = Math.PI / 180;
          const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          if (percent * 100 < 3) return null;
          return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">{`${(percent * 100).toFixed(0)}%`}</text>);
     };

     const renderChartArea = () => {
          if (loading) {
               return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}><IconLoader /><p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading top facilities analytics...</p></div>);
          }
          if (error && data.length === 0) {
               return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}><IconError /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p></div>);
          }
          if (data.length === 0) {
               return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}><IconEmpty /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>No top facilities data found for {selectedYear}.</p></div>);
          }

          const chartHeight = 450;

          const chartData = data.map(item => {
               let name = item.facility_name || item.outsourced_facility || 'Unknown';
               if (name.length > 20) {
                    name = name.substring(0, 18) + '...';
               }
               return {
                    ...item,
                    name,
                    value: parseFloat(item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0
               };
          });

          if (view === "pie") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                   <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={Math.min(window.innerWidth / 4.5, 160)}
                                        labelLine={false}
                                        label={renderCustomizedPieLabel}
                                   >
                                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}
                                   </Pie>
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{
                                             fontSize: '12px',
                                             color: COLOR_TOOLTIP_FG,
                                             paddingLeft: '15px',
                                             maxHeight: chartHeight - 40,
                                             overflowY: 'auto'
                                        }}
                                        formatter={(value) => <span style={{ color: COLOR_TEXT_MUTED }}>{value.length > 20 ? value.substring(0, 18) + '...' : value}</span>}
                                   />
                              </PieChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          if (view === "line") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                   <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Line type="monotone" dataKey="value" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ fill: COLOR_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: COLOR_ACCENT, strokeWidth: 2 }} />
                              </LineChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          if (view === "area") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                   <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Area type="monotone" dataKey="value" stroke={COLOR_ACCENT} fill={COLOR_HOVER} strokeWidth={2} />
                              </AreaChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          const numDataPoints = chartData.length;
          const angleXAxis = numDataPoints > 7;
          const bottomMargin = angleXAxis ? 100 : 60;

          return (
               <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }} barGap={4} barCategoryGap="20%">
                              <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                              <XAxis dataKey="name" angle={angleXAxis ? -45 : 0} textAnchor={angleXAxis ? "end" : "middle"} height={angleXAxis ? 110 : 70} interval={0} tick={{ fontSize: 10, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                              <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                              <Tooltip content={<CustomTooltipContent />} cursor={{ fill: COLOR_HOVER }} />
                              <Bar dataKey="value" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={50} />
                         </BarChart>
                    </ResponsiveContainer>
               </div>
          );
     };

     return (
          <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <IconChart /> Top 20 Outsourcing Facilities ({selectedYear})
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <Dropdown>
                                   <Dropdown.Toggle variant="outline-secondary" id="branchDropdown" className="d-flex align-items-center" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', flexBasis: '140px', minWidth: '130px' }}>
                                        🏢 {branchesLoading ? 'Loading...' : (branches.find(b => b.branchid === selectedBranch)?.name || `Select Branch (${branches.length} available)`)}
                                   </Dropdown.Toggle>
                                   <Dropdown.Menu>
                                        {branches.length === 0 && !branchesLoading && (
                                             <Dropdown.Item disabled style={{ fontSize: '0.875rem' }}>
                                                  No branches available
                                             </Dropdown.Item>
                                        )}
                                        {branches.map(branch => (
                                             <Dropdown.Item key={branch.branchid} onClick={() => setSelectedBranch(branch.branchid)} style={{ fontSize: '0.875rem' }}>
                                                  {branch.name}
                                             </Dropdown.Item>
                                        ))}
                                   </Dropdown.Menu>
                              </Dropdown>

                              <Dropdown>
                                   <Dropdown.Toggle variant="outline-secondary" id="yearDropdown" className="d-flex align-items-center" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                                        📅 {selectedYear}
                                   </Dropdown.Toggle>
                                   <Dropdown.Menu>
                                        {years.map(year => (
                                             <Dropdown.Item key={year} onClick={() => setSelectedYear(year)} style={{ fontSize: '0.875rem' }}>
                                                  {year}
                                             </Dropdown.Item>
                                        ))}
                                   </Dropdown.Menu>
                              </Dropdown>

                              <div className="btn-group btn-group-sm" role="group">
                                   <button type="button" className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('bar')} style={view === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconBar /> Bar
                                   </button>
                                   <button type="button" className={`btn ${view === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('line')} style={view === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconLine /> Line
                                   </button>
                                   <button type="button" className={`btn ${view === 'area' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('area')} style={view === 'area' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconArea /> Area
                                   </button>
                              </div>

                              <button onClick={fetchData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Refresh data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                   <IconRefresh /> Refresh
                              </button>
                         </div>
                    </div>
               </div>

               <div className="card-body p-3 p-md-4">
                    {error && data.length > 0 && (
                         <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                              <IconError /> <span className="ms-2">{error}</span>
                              <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                         </div>
                    )}
                    {renderChartArea()}
               </div>

               {data.length > 0 && !loading && !error && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                   <div className="card h-100 border-0 bg-primary bg-opacity-10">
                                        <div className="card-body text-center">
                                             <h6 className="card-title text-primary mb-2">Total Amount</h6>
                                             <h4 className="card-text mb-0 text-primary fw-bold">
                                                  {currencyFormatter.format(totalAmount)}
                                             </h4>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-6">
                                   <div className="card h-100 border-0 bg-success bg-opacity-10">
                                        <div className="card-body text-center">
                                             <h6 className="card-title text-success mb-2">Total Services</h6>
                                             <h4 className="card-text mb-0 text-success fw-bold">
                                                  {totalServices.toLocaleString()}
                                             </h4>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <h4 className="fs-6 fw-medium mb-3">Top Facilities Data ({selectedYear})</h4>
                         <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              <table className="table table-sm table-hover table-striped small">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Facility</th>
                                             <th scope="col" className="py-2">Amount</th>
                                             <th scope="col" className="py-2">Services</th>
                                             <th scope="col" className="py-2">Contact</th>
                                             <th scope="col" className="py-2">Type</th>
                                             <th scope="col" className="py-2">% of Total</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.map((entry, index) => {
                                             const amount = parseFloat(entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                             const services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;

                                             return (
                                                  <tr key={`${entry.facility_name || entry.outsourced_facility}-${index}`}>
                                                       <td className="py-2">
                                                            {entry.facility_name || entry.outsourced_facility || 'Unknown'}
                                                       </td>
                                                       <td className="py-2">
                                                            {currencyFormatter.format(amount)}
                                                       </td>
                                                       <td className="py-2">
                                                            {services > 0 ? services.toLocaleString() : '-'}
                                                       </td>
                                                       <td className="py-2">
                                                            {entry.contactPerson ? `${entry.contactPerson}${entry.contactNumber ? ` (${entry.contactNumber})` : ''}` : '-'}
                                                       </td>
                                                       <td className="py-2">
                                                            {entry.organizationType || '-'}
                                                       </td>
                                                       <td className="py-2">
                                                            {totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0.0'}%
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                                   <tfoot className="fw-bold border-top">
                                        <tr>
                                             <td className="py-2">Total</td>
                                             <td className="py-2">{currencyFormatter.format(totalAmount)}</td>
                                             <td className="py-2">{totalServices.toLocaleString()}</td>
                                             <td className="py-2">-</td>
                                             <td className="py-2">-</td>
                                             <td className="py-2">100.0%</td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    </div>
               )}
               <style jsx global>{`
                .recharts-default-legend { margin-left: 15px !important; }
                .table-responsive thead.sticky-top th { background-color: var(--bs-tertiary-bg) !important; border-bottom: 2px solid var(--bs-border-color); }
            `}</style>
          </div>
     );
}