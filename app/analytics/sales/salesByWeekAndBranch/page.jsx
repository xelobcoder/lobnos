"use client"
import { useEffect, useState, useCallback } from "react";
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiCalendarLine, RiRefreshLine } from "@remixicon/react";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const getInitialDates = () => {
     const today = new Date();
     const currentYear = today.getFullYear();
     const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0]; // January 1st
     const endDate = new Date(currentYear, 11, 31).toISOString().split("T")[0]; // December 31st
     return { startDate, endDate };
};

export default function SalesByWeekAndBranch() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [dateFilter, setDateFilter] = useState("");

     const initialDates = getInitialDates();
     const [startDate, setStartDate] = useState(initialDates.startDate);
     const [endDate, setEndDate] = useState(initialDates.endDate);

     const { user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     const fetchData = useCallback(async (fetchStartDate, fetchEndDate, currentEmployeeId) => {
          if (!currentEmployeeId) {
               setError("Employee information is not loaded yet.");
               setLoading(false);
               return;
          }

          const url = `financials/billing/summary?key=salesByWeekAndBranch&employeeid=${currentEmployeeId}&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
          setLoading(true);
          setError(null);
          try {
               const fetchedData = await customFetch(url);
               if (fetchedData && Array.isArray(fetchedData)) {
                    setData(fetchedData);
               } else {
                    setError("Received data is not in expected format");
                    setData([]);
               }
          } catch (err) {
               setError(err.message || "Failed to fetch data");
               setData([]);
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          if (employeeid) {
               fetchData(startDate, endDate, employeeid);
          } else {
               setLoading(false);
               setError("Employee information is not loaded yet.");
          }
     }, [employeeid, fetchData]);

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);
     const handleResetFilters = () => {
          const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
          setStartDate(defaultStartDate);
          setEndDate(defaultEndDate);
          setDateFilter("");
          if (employeeid) fetchData(defaultStartDate, defaultEndDate, employeeid);
     };
     const handleLoadData = () => {
          if (employeeid) {
               fetchData(startDate, endDate, employeeid);
          }
     };

     const processChartData = () => {
          const groupedData = {};
          data.forEach((entry) => {
               if (!groupedData[entry.week]) groupedData[entry.week] = {};
               groupedData[entry.week][entry.name.trim()] = parseFloat(entry.earned_revenue) || 0;
          });

          return Object.keys(groupedData).map((week) => ({
               week: `Week ${week}`,
               ...groupedData[week],
          }));
     };

     const chartData = processChartData();
     const uniqueBranches = [...new Set(data.map((entry) => entry.name?.trim() || "Unknown Branch"))];

     const branchSpecificData = uniqueBranches.map((branch) => ({
          branchName: branch,
          data: data.filter((entry) => (entry.name?.trim() || "Unknown Branch") === branch),
     }));

     const CustomTooltip = ({ active, payload, label }) => {
          if (active && payload && payload.length) {
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
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Week</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((entry) => (
                              <div key={entry.name} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{entry.name}</span>
                                   <span className="fw-bold d-block" style={{ color: entry.color }}>
                                        {currencyFormatter.format(entry.value)}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading sales data...</p>
                    </div>
               );
          }

          if (error) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
               );
          }

          if (data.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                         <h5 className="fw-medium mb-1">No Data Available</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                              No sales data available for the selected period.
                         </p>
                    </div>
               );
          }

          return (
               <div className="space-y-4">
                    {/* Main Combined Chart */}
                    <div className="bg-gray-50 p-4 rounded-lg border" style={{ borderColor: COLOR_BORDER }}>
                         <h3 className="text-lg font-semibold mb-4 text-gray-700 d-flex align-items-center">
                              <RiBarChartBoxLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                              Weekly Payable Comparison by Branch
                         </h3>
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                        <XAxis
                                             dataKey="week"
                                             tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                             axisLine={{ stroke: COLOR_BORDER }}
                                             tickLine={{ stroke: COLOR_BORDER }}
                                        />
                                        <YAxis
                                             tickFormatter={(value) => currencyFormatter.format(value)}
                                             tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                             axisLine={false}
                                             tickLine={false}
                                             width={95}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                        <Legend
                                             verticalAlign="top"
                                             align="right"
                                             iconType="circle"
                                             iconSize={8}
                                             wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                                        />
                                        {Array.isArray(uniqueBranches) && uniqueBranches.map((branch, index) => (
                                             <Bar
                                                  key={branch}
                                                  dataKey={branch}
                                                  fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                                                  name={branch}
                                                  radius={[4, 4, 0, 0]}
                                                  maxBarSize={40}
                                             />
                                        ))}
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    </div>

                    {/* Individual Branch Charts */}
                    {Array.isArray(branchSpecificData) && branchSpecificData.length > 0 && branchSpecificData.map((branchData, index) => (
                         <div key={branchData.branchName} className="bg-gray-50 p-4 rounded-lg border" style={{ borderColor: COLOR_BORDER }}>
                              <h3 className="text-lg font-semibold mb-4 text-gray-700 d-flex align-items-center">
                                   <RiLineChartLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                   {branchData.branchName} - Financial Trends
                              </h3>
                              <div style={{ width: "100%", height: 300 }}>
                                   <ResponsiveContainer>
                                        <BarChart
                                             data={branchData.data.map(item => ({
                                                  week: `Week ${item.week}`,
                                                  earned_revenue: parseFloat(item.earned_revenue) || 0,
                                                  gross_revenue: parseFloat(item.gross_revenue) || 0,
                                                  cash_collected: parseFloat(item.cash_collected) || 0,
                                                  discount: parseFloat(item.discount) || 0,
                                                  total_refunded: parseFloat(item.total_refunded) || 0
                                             }))}
                                             margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                        >
                                             <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                             <XAxis
                                                  dataKey="week"
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={{ stroke: COLOR_BORDER }}
                                                  tickLine={{ stroke: COLOR_BORDER }}
                                             />
                                             <YAxis
                                                  tickFormatter={(value) => currencyFormatter.format(value)}
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={false}
                                                  tickLine={false}
                                                  width={95}
                                             />
                                             <Tooltip
                                                  formatter={(value, name) => [currencyFormatter.format(value), name]}
                                                  contentStyle={{
                                                       backgroundColor: COLOR_TOOLTIP_BG,
                                                       borderColor: COLOR_BORDER,
                                                  }}
                                                  labelStyle={{ color: COLOR_TOOLTIP_FG }}
                                                  cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                                             />
                                             <Legend verticalAlign="top" height={36} />
                                             <Bar dataKey="cash_collected" name="Cash Collected" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                             <Bar dataKey="earned_revenue" name="Earned Revenue" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                             <Bar dataKey="gross_revenue" name="Gross Revenue" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    ))}

                    {/* Summary Statistics */}
                    <div className="bg-blue-50 p-4 rounded-lg border" style={{ borderColor: COLOR_BORDER }}>
                         <h3 className="text-lg font-semibold mb-4 text-gray-700 d-flex align-items-center">
                              <RiBubbleChartLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                              Branch Financial Summary
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {branchSpecificData.map((branchData) => {
                                   const earned_revenue = branchData.data.reduce((sum, item) => sum + (parseFloat(item.earned_revenue) || 0), 0);
                                   const gross_revenue = branchData.data.reduce((sum, item) => sum + (parseFloat(item.gross_revenue) || 0), 0);
                                   const cash_collected = branchData.data.reduce((sum, item) => sum + (parseFloat(item.cash_collected) || 0), 0);
                                   const discount = branchData.data.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
                                   const total_refunded = branchData.data.reduce((sum, item) => sum + (parseFloat(item.total_refunded) || 0), 0);
                                   const outstanding = branchData.data.reduce((sum, item) => sum + (parseFloat(item.outstanding) || 0), 0);
                                   const profit = earned_revenue - gross_revenue;
                                   const collectionRate = earned_revenue > 0 ? (cash_collected / earned_revenue) * 100 : 0;

                                   return (
                                        <div key={branchData.branchName} className="bg-white rounded-lg border shadow-sm overflow-hidden" style={{ borderColor: COLOR_BORDER }}>
                                             <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                                  <h4 className="font-semibold text-gray-800 m-0 text-base">{branchData.branchName}</h4>
                                             </div>
                                             <div className="p-4">
                                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                                       <div>
                                                            <p className="text-xs text-muted uppercase mb-1">Earned Revenue</p>
                                                            <p className="font-bold text-lg" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(earned_revenue)}</p>
                                                       </div>
                                                       <div>
                                                            <p className="text-xs text-muted uppercase mb-1">Cash Collected</p>
                                                            <p className="font-bold text-lg text-blue-600">{currencyFormatter.format(cash_collected)}</p>
                                                       </div>
                                                  </div>

                                                  <div className="border-t pt-3 mb-3" style={{ borderColor: COLOR_BORDER }}>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Gross Revenue</span>
                                                            <span className="font-medium">{currencyFormatter.format(gross_revenue)}</span>
                                                       </div>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Profit/Loss</span>
                                                            <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(profit)}</span>
                                                       </div>
                                                  </div>

                                                  <div className="border-t pt-3 mb-3" style={{ borderColor: COLOR_BORDER }}>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Discounts</span>
                                                            <span className="text-orange-600">{currencyFormatter.format(discount)}</span>
                                                       </div>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Refunds</span>
                                                            <span className="text-red-600">{currencyFormatter.format(total_refunded)}</span>
                                                       </div>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Outstanding</span>
                                                            <span className="text-danger font-bold">{currencyFormatter.format(outstanding)}</span>
                                                       </div>
                                                  </div>

                                                  <div className="border-t pt-3" style={{ borderColor: COLOR_BORDER }}>
                                                       <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${collectionRate >= 90 ? 'bg-green-100 text-green-800' : collectionRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                                 {collectionRate.toFixed(1)}%
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white p-4 rounded-lg border" style={{ borderColor: COLOR_BORDER }}>
                         <div className="d-flex justify-content-between mb-2">
                              <div>
                                   <h3 className="text-lg font-semibold mb-3 text-gray-700 d-flex align-items-center">
                                        <RiBubbleChartLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                        Weekly Sales Data by Branch
                                   </h3>
                              </div>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Week</th>
                                             <th scope="col" className="py-2">Branch</th>
                                             <th scope="col" className="py-2 text-end">Earned Revenue</th>
                                             <th scope="col" className="py-2 text-end">Cash Collected</th>
                                             <th scope="col" className="py-2 text-end">Gross Revenue</th>
                                             <th scope="col" className="py-2 text-end">Discount</th>
                                             <th scope="col" className="py-2 text-end">Refunded</th>
                                             <th scope="col" className="py-2 text-end">Outstanding</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.map((entry, index) => (
                                             <tr key={`${entry.week}-${entry.name}-${index}`}>
                                                  <td className="py-2">{`Week ${entry.week}`}</td>
                                                  <td className="py-2">{entry.name?.trim() || "Unknown Branch"}</td>
                                                  <td className="py-2 text-end fw-medium">{currencyFormatter.format(parseFloat(entry.earned_revenue) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.cash_collected) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.gross_revenue) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.discount) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.total_refunded) || 0)}</td>
                                                  <td className="py-2 text-end text-danger fw-bold">{currencyFormatter.format(parseFloat(entry.outstanding) || 0)}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>
          );
     };

     return (
          <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
               <div className="card-header px-4 py-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                    <div className="d-flex justify-content-between flex-md-row align-items-md-center gap-2">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                              <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Sales by Week and Branch
                         </h2>
                         <div className="d-flex flex-row align-items-center gap-2 flex-nowrap" style={{ overflowX: 'auto', minWidth: 0 }}>
                              <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                   <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                        <RiCalendarLine size={16} />
                                   </span>
                                   <input
                                        type="date"
                                        className="form-control shadow-none border-start-0"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        aria-label="Start Date"
                                        style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }}
                                   />
                              </div>
                              <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                   <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                        <RiCalendarLine size={16} />
                                   </span>
                                   <input
                                        type="date"
                                        className="form-control shadow-none border-start-0"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        min={startDate}
                                        aria-label="End Date"
                                        style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }}
                                   />
                              </div>
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(startDate, endDate) => {
                                        setStartDate(startDate);
                                        setEndDate(endDate);
                                        if (employeeid) fetchData(startDate, endDate, employeeid);
                                   }}
                                   label="Filter by"
                                   className="w-auto"
                              />
                              <button
                                   onClick={handleLoadData}
                                   className="btn btn-sm btn-primary d-flex align-items-center"
                                   type="button"
                                   aria-label="Load data"
                                   style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                              >
                                   <RiRefreshLine size={16} className="me-1" /> Load
                              </button>
                              <button
                                   onClick={handleResetFilters}
                                   className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                   type="button"
                                   aria-label="Reset date filters"
                                   style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                              >
                                   <RiRefreshLine size={16} className="me-1" /> Reset
                              </button>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                   Print
                              </button>
                         </div>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    {renderContent()}
               </div>

               <style jsx global>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
                    @media print {
                         .card {
                              border: none !important;
                              box-shadow: none !important;
                         }
                         .card-header {
                              background: white !important;
                              border-bottom: 1px solid #000 !important;
                              -webkit-print-color-adjust: exact;
                         }
                         .card-body {
                              padding: 1rem !important;
                         }
                         .bg-gray-50, .bg-blue-50, .bg-white {
                              background: white !important;
                              -webkit-print-color-adjust: exact;
                         }
                         .grid {
                              display: block !important;
                         }
                         .grid-cols-1, .md\\:grid-cols-2, .lg\\:grid-cols-3 {
                              display: block !important;
                         }
                         .gap-4 > * {
                              margin-bottom: 1rem !important;
                         }
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
                         .printable-table-with-borders thead th {
                              font-weight: bold !important;
                              color: #000 !important;
                         }
                    }
               `}</style>
          </div>
     );
}