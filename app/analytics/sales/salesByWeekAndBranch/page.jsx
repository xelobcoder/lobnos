"use client"
import { useEffect, useState } from "react";
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
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line } from "@remixicon/react";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

export default function SalesByWeekAndBranch() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     const { user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (employeeid) {
               const fetchData = async () => {
                    const url = `financials/billing/summary?key=salesByWeekAndBranch&employeeid=${employeeid}`;
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
               };

               fetchData();
          } else {
               setLoading(false);
               setError("Employee information is not loaded yet.");
          }
     }, [employeeid]);

     const processChartData = () => {
          const groupedData = {};
          data.forEach((entry) => {
               if (!groupedData[entry.week]) groupedData[entry.week] = {};
               groupedData[entry.week][entry.name.trim()] = parseFloat(entry.totalPayable) || 0;
          });

          return Object.keys(groupedData).map((week) => ({
               week: `Week ${week}`,
               ...groupedData[week],
          }));
     };

     const chartData = processChartData();
     const uniqueBranches = [...new Set(data.map((entry) => entry.name.trim()))];

     const branchSpecificData = uniqueBranches.map((branch) => ({
          branchName: branch,
          data: data.filter((entry) => entry.name.trim() === branch),
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
                                                  totalPayable: parseFloat(item.totalPayable) || 0,
                                                  totalCost: parseFloat(item.totalCost) || 0,
                                                  totalPaid: parseFloat(item.totalPaid) || 0,
                                                  totalDiscount: parseFloat(item.totalDiscount) || 0,
                                                  totalRefunded: parseFloat(item.totalRefunded) || 0
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
                                             <Bar dataKey="totalPaid" name="Paid" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                             <Bar dataKey="totalPayable" name="Payable" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                             <Bar dataKey="totalCost" name="Cost" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={30} />
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
                                   const totalPayable = branchData.data.reduce((sum, item) => sum + (parseFloat(item.totalPayable) || 0), 0);
                                   const totalCost = branchData.data.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);
                                   const totalPaid = branchData.data.reduce((sum, item) => sum + (parseFloat(item.totalPaid) || 0), 0);
                                   const totalDiscount = branchData.data.reduce((sum, item) => sum + (parseFloat(item.totalDiscount) || 0), 0);
                                   const totalRefunded = branchData.data.reduce((sum, item) => sum + (parseFloat(item.totalRefunded) || 0), 0);
                                   const profit = totalPayable - totalCost;
                                   const collectionRate = totalPayable > 0 ? (totalPaid / totalPayable) * 100 : 0;

                                   return (
                                        <div key={branchData.branchName} className="bg-white rounded-lg border shadow-sm overflow-hidden" style={{ borderColor: COLOR_BORDER }}>
                                             <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                                  <h4 className="font-semibold text-gray-800 m-0 text-base">{branchData.branchName}</h4>
                                             </div>
                                             <div className="p-4">
                                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                                       <div>
                                                            <p className="text-xs text-muted uppercase mb-1">Total Payable</p>
                                                            <p className="font-bold text-lg" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(totalPayable)}</p>
                                                       </div>
                                                       <div>
                                                            <p className="text-xs text-muted uppercase mb-1">Total Paid</p>
                                                            <p className="font-bold text-lg text-blue-600">{currencyFormatter.format(totalPaid)}</p>
                                                       </div>
                                                  </div>

                                                  <div className="border-t pt-3 mb-3" style={{ borderColor: COLOR_BORDER }}>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Total Cost</span>
                                                            <span className="font-medium">{currencyFormatter.format(totalCost)}</span>
                                                       </div>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Gross Profit</span>
                                                            <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currencyFormatter.format(profit)}</span>
                                                       </div>
                                                  </div>

                                                  <div className="border-t pt-3 mb-3" style={{ borderColor: COLOR_BORDER }}>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Discounts</span>
                                                            <span className="text-orange-600">{currencyFormatter.format(totalDiscount)}</span>
                                                       </div>
                                                       <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="text-muted">Refunds</span>
                                                            <span className="text-red-600">{currencyFormatter.format(totalRefunded)}</span>
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
                              <div>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                        Print Table
                                   </button>
                              </div>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Week</th>
                                             <th scope="col" className="py-2">Branch</th>
                                             <th scope="col" className="py-2 text-end">Total Payable</th>
                                             <th scope="col" className="py-2 text-end">Total Paid</th>
                                             <th scope="col" className="py-2 text-end">Total Cost</th>
                                             <th scope="col" className="py-2 text-end">Discount</th>
                                             <th scope="col" className="py-2 text-end">Refunded</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.map((entry, index) => (
                                             <tr key={`${entry.week}-${entry.name}-${index}`}>
                                                  <td className="py-2">{`Week ${entry.week}`}</td>
                                                  <td className="py-2">{entry.name.trim()}</td>
                                                  <td className="py-2 text-end fw-medium">{currencyFormatter.format(parseFloat(entry.totalPayable) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.totalPaid) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.totalCost) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.totalDiscount) || 0)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(parseFloat(entry.totalRefunded) || 0)}</td>
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
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex justify-content-between align-items-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                              <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Sales by Week and Branch (Financial Overview)
                         </h2>
                         <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                              Print
                         </button>
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