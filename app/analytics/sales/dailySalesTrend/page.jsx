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
     LineChart,
     Line,
     AreaChart,
     Area,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

const SHADCN_ACCENT = "#3B82F6"; // blue-500
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900

const BAR_COLORS = [SHADCN_ACCENT]; // Using a single accent color for consistency

export default function DailySalesTrend() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("line");
     const [startDate, setStartDate] = useState("");
     const { branchid } = useApplicationSettings().applicationsettings;
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=dailySalesTrend&startDate=${startDate}&endDate=${endDate}&&branchid=${branchid}`;
               customFetch(url)
                    .then((fetchedData) => {
                         setData(fetchedData);
                         setLoading(false);
                    })
                    .catch(() => {
                         setData([]);
                         setLoading(false);
                    });
          };

          fetchData();
     }, [startDate, endDate]);

     const handleToggleView = () => {
          setView((prevView) => {
               if (prevView === "bar") return "line";
               if (prevView === "line") return "area";
               return "bar";
          });
     };

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);

     const handleResetFilters = () => {
          setStartDate("");
          setEndDate("");
     };

     const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

     const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString();
     };

     return (
          <div>
               <h3 className=" bg-secondary-subtle pls-label p-3 br-5 ">Daily Sales Trend</h3>

               <div className="d-flex mb-3 ">
                    <div className="flex items-center gap-2">
                        <label className="label mx-3">Start</label>
                        <input
                            type="date"
                            className="px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="label mx-3">End</label>
                        <input
                            type="date"
                            className="px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={endDate}
                            onChange={handleEndDateChange}
                        />
                    </div>
                    <button
                        onClick={handleToggleView}
                        className="btn btn-primary btn-sm mx-3"
                    >
                        Switch to {view === "bar" ? "Line Chart" : view === "line" ? "Area Chart" : "Bar Chart"}
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="btn btn-danger"
                    >
                        Reset
                    </button>
               </div>

               {loading ? (
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
               ) : data.length > 0 ? (
                    view === "bar" ? (
                         <div className="bg-white rounded-lg shadow-sm p-4" style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                             stroke={SHADCN_BORDER}
                                             tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                             tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => currencyFormatter.format(value)} 
                                            stroke={SHADCN_BORDER}
                                            tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                            tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = totalSales ? ((value / totalSales) * 100).toFixed(2) : 0;
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                             contentStyle={{ backgroundColor: SHADCN_TOOLTIP_BG, borderRadius: '0.5rem', borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                                             labelStyle={{ color: SHADCN_TOOLTIP_FG, marginBottom: '4px', fontWeight: '500' }}
                                             itemStyle={{ color: SHADCN_MUTED_FOREGROUND }}
                                             cursor={{ fill: `${SHADCN_ACCENT}1A` }} // Light accent color for cursor background
                                        />
                                        <Legend wrapperStyle={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '12px', paddingTop: '10px' }}/>
                                        <Bar dataKey="totalSales" fill={SHADCN_ACCENT} radius={[4, 4, 0, 0]} />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    ) : view === "line" ? (
                         <div className="bg-white rounded-lg shadow-sm p-4" style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <LineChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                             stroke={SHADCN_BORDER}
                                             tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                             tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => currencyFormatter.format(value)} 
                                            stroke={SHADCN_BORDER}
                                            tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                            tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = totalSales ? ((value / totalSales) * 100).toFixed(2) : 0;
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                             contentStyle={{ backgroundColor: SHADCN_TOOLTIP_BG, borderRadius: '0.5rem', borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                                             labelStyle={{ color: SHADCN_TOOLTIP_FG, marginBottom: '4px', fontWeight: '500' }}
                                             itemStyle={{ color: SHADCN_MUTED_FOREGROUND }}
                                             cursor={{ stroke: SHADCN_BORDER, strokeDasharray: '3 3' }}
                                        />
                                        <Legend wrapperStyle={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '12px', paddingTop: '10px' }}/>
                                        <Line type="monotone" dataKey="totalSales" stroke={SHADCN_ACCENT} strokeWidth={2} dot={{ r: 3, fill: SHADCN_ACCENT }} activeDot={{ r: 5, stroke: SHADCN_ACCENT, fill: SHADCN_TOOLTIP_BG, strokeWidth: 2 }} />
                                   </LineChart>
                              </ResponsiveContainer>
                         </div>
                    ) : (
                         <div className="bg-white rounded-lg shadow-sm p-4" style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <defs>
                                            <linearGradient id="colorTotalSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={SHADCN_ACCENT} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={SHADCN_ACCENT} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                             stroke={SHADCN_BORDER}
                                             tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                             tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => currencyFormatter.format(value)} 
                                            stroke={SHADCN_BORDER}
                                            tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                            tickLine={{ stroke: SHADCN_BORDER }}
                                        />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = totalSales ? ((value / totalSales) * 100).toFixed(2) : 0;
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                             contentStyle={{ backgroundColor: SHADCN_TOOLTIP_BG, borderRadius: '0.5rem', borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                                             labelStyle={{ color: SHADCN_TOOLTIP_FG, marginBottom: '4px', fontWeight: '500' }}
                                             itemStyle={{ color: SHADCN_MUTED_FOREGROUND }}
                                             cursor={{ stroke: SHADCN_BORDER, strokeDasharray: '3 3' }}
                                        />
                                        <Legend wrapperStyle={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '12px', paddingTop: '10px' }}/>
                                        <Area type="monotone" dataKey="totalSales" stroke={SHADCN_ACCENT} fillOpacity={1} fill="url(#colorTotalSales)" strokeWidth={2} dot={{ r: 3, fill: SHADCN_ACCENT }} activeDot={{ r: 5, stroke: SHADCN_ACCENT, fill: SHADCN_TOOLTIP_BG, strokeWidth: 2 }} />
                                   </AreaChart>
                              </ResponsiveContainer>
                         </div>
                    )
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}

               <div className="mt-4">
                    <table className="w-full text-sm text-left table">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                              <tr>
                                   <th className="px-6 py-3">Date</th>
                                   <th className="px-6 py-3">Total Sales</th>
                                   <th className="px-6 py-3">Change</th>
                              </tr>
                         </thead>
                         <tbody>
                              {data.map((entry, index) => {
                                   const prevSales = index > 0 ? data[index - 1].totalSales : entry.totalSales;
                                   const change = entry.totalSales - prevSales;
                                   const changePercent = ((change / prevSales) * 100).toFixed(2);
                                   return (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                             <td className="px-6 py-4">{formatDate(entry.date)}</td>
                                             <td className="px-6 py-4 font-medium">{currencyFormatter.format(entry.totalSales)}</td>
                                             <td className="px-6 py-4">
                                                  <span className={`inline-flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                       {change >= 0 ? '↑' : '↓'} {Math.abs(changePercent)}%
                                                       <span className="ml-2 text-xs text-gray-500">
                                                            ({currencyFormatter.format(Math.abs(change))})
                                                       </span>
                                                  </span>
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>
          </div>
     );
}
