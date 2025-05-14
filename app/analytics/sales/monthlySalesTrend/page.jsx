"use client"
import { useEffect, useState } from "react";
import {
     ResponsiveContainer,
     Tooltip,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
} from "recharts";
import { customFetch,currencyFormatter } from "../../../../components/Auth/customFetch";

// Shadcn-inspired color palette
const SHADCN_ACCENT = "#3B82F6"; // blue-500
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900

// Add this BAR_COLORS definition
const BAR_COLORS = [SHADCN_ACCENT, '#9D6D7B', '#FF8A5C', '#F2A900']; // Soft colors for Bar chart

export default function MonthlySalesTrend() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("pie"); // Add options for pie, bar, line, area
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=monthlySalesTrend&startDate=${startDate}&endDate=${endDate}`;
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
               if (prevView === "pie") return "bar";
               if (prevView === "bar") return "line";
               if (prevView === "line") return "area";
               return "pie";
          });
     };

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);

     const handleResetFilters = () => {
          setStartDate("");
          setEndDate("");
     };

     const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

     return (
          <div >
               

               {/* Date filters */}
               <div className="d-flex ">
                    <div className="flex items-center gap-2">
                         <label className="text-sm font-medium">Start Date:</label>
                         <input
                              type="date"
                              className="border rounded px-3 py-2"
                              value={startDate}
                              onChange={handleStartDateChange}
                         />
                    </div>
                    <div className="flex items-center gap-2">
                         <label className="text-sm font-medium">End Date:</label>
                         <input
                              type="date"
                              className="border rounded px-3 py-2"
                              value={endDate}
                              onChange={handleEndDateChange}
                         />
                    </div>
                    <button
                         onClick={handleResetFilters}
                         className="btn btn-primary mx-3 btn-sm"
                    >
                         Reset Filters
                    </button>
               </div>

               {/* Chart container */}
               {loading ? (
                    <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded">
                         <p className="text-gray-500">Loading...</p>
                    </div>
               ) : data.length > 0 ? (
                    <div className="bg-white mt-5 p-3 br-5" style={{ height: '400px' }}>
                         <h3 className="text-2xl font-bold mb-4 pls-color pls-label">Monthly Sales Trend</h3>
                         <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                   <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        tick={{ fill: '#666', fontSize: 12 }}
                                   />
                                   <YAxis
                                        tickFormatter={(value) => currencyFormatter.format(value)}
                                        tick={{ fill: '#666', fontSize: 12 }}
                                        width={80}
                                   />
                                   <Tooltip
                                        formatter={(value) => [currencyFormatter.format(value), 'Sales']}
                                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        contentStyle={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' }}
                                   />
                                   <Bar 
                                        dataKey="totalSales" 
                                        fill={BAR_COLORS[0]}
                                        radius={[10, 10, 0, 0]}
                                        barSize={200}
                                   />
                              </BarChart>
                         </ResponsiveContainer>
                    </div>
               ) : (
                    <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded">
                         <p className="text-gray-500">No data available</p>
                    </div>
               )}
          </div>
     );
}
