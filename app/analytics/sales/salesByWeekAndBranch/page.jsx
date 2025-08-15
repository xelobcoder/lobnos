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
import { currencyFormatter, customFetch} from "../../../../components/Auth/customFetch";
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

export default function SalesByWeekAndBranch() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=salesByWeekAndBranch`;
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
     }, []);

     const processChartData = () => {
          const groupedData = {};
          data.forEach((entry) => {
               if (!groupedData[entry.week]) groupedData[entry.week] = {};
               groupedData[entry.week][entry.name.trim()] = entry.totalSales;
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
                              <span className="fw-bold d-block" style={{color: COLOR_TOOLTIP_FG}}>{label}</span>
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
                              Weekly Sales Comparison
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
                                   {branchData.branchName} - Weekly Sales Trend
                              </h3>
                              <div style={{ width: "100%", height: 300 }}>
                                   <ResponsiveContainer>
                                        <BarChart
                                             data={branchData.data.map(item => ({
                                                  week: `Week ${item.week}`,
                                                  totalSales: parseFloat(item.totalSales)
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
                                                  formatter={(value) => [currencyFormatter.format(value), "Sales"]}
                                                  contentStyle={{
                                                       backgroundColor: COLOR_TOOLTIP_BG,
                                                       borderColor: COLOR_BORDER,
                                                  }}
                                                  labelStyle={{ color: COLOR_TOOLTIP_FG }}
                                                  cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                                             />
                                             <Bar
                                                  dataKey="totalSales"
                                                  fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                                                  name="Sales"
                                                  radius={[4, 4, 0, 0]}
                                                  maxBarSize={40}
                                             />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    ))}

                    {/* Summary Statistics */}
                    <div className="bg-blue-50 p-4 rounded-lg border" style={{ borderColor: COLOR_BORDER }}>
                         <h3 className="text-lg font-semibold mb-4 text-gray-700 d-flex align-items-center">
                              <RiBubbleChartLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                              Summary
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {branchSpecificData.map((branchData) => {
                                   const totalSales = branchData.data.reduce((sum, item) => sum + parseFloat(item.totalSales), 0);
                                   const avgSales = totalSales / branchData.data.length;
                                   const maxSales = Math.max(...branchData.data.map(item => parseFloat(item.totalSales)));

                                   return (
                                        <div key={branchData.branchName} className="bg-white p-4 rounded border shadow-sm" style={{ borderColor: COLOR_BORDER }}>
                                             <h4 className="font-semibold text-gray-800 mb-2">{branchData.branchName}</h4>
                                             <div className="space-y-1 text-sm">
                                                  <p><span className="font-medium">Total Sales:</span> {currencyFormatter.format(totalSales)}</p>
                                                  <p><span className="font-medium">Average Sales:</span> {currencyFormatter.format(avgSales)}</p>
                                                  <p><span className="font-medium">Peak Sales:</span> {currencyFormatter.format(maxSales)}</p>
                                                  <p><span className="font-medium">Weeks Active:</span> {branchData.data.length}</p>
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </div>
               </div>
          );
     };

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                         <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                         Sales by Week and Branch
                    </h2>
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
               `}</style>
          </div>
     );
}