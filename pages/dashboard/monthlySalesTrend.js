import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../components/Auth/customFetch";
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
     AreaChart,
     Area,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Pie chart colors

// For Bar and Area charts, using a different appealing color palette
const BAR_COLORS = ['#5D8FB1', '#9D6D7B', '#FF8A5C', '#F2A900']; // Soft colors for Bar chart
const AREA_COLORS = ['#67B7D1', '#FDCB82', '#85E5A4', '#F2C9B3']; // Soft colors for Area chart

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
          <DashBoardLayoutSales>
               <h3>Monthly Sales Trend</h3>

               {/* Filters */}
               <div className="d-flex col-12 mb-3">
                    <label className="mt-2 mx-2">Start</label>
                    <input
                         type="date"
                         className="custom-input col-4"
                         value={startDate}
                         onChange={handleStartDateChange}
                    />
                    <label className="mt-2 mx-2">End</label>
                    <input
                         type="date"
                         className="custom-input col-4"
                         value={endDate}
                         onChange={handleEndDateChange}
                    />
                    <button
                         onClick={handleToggleView}
                         className="btn btn-light mx-3 border-primary border-2"
                    >
                         Switch to {view === "pie" ? "Bar Chart" : view === "bar" ? "Line Chart" : view === "line" ? "Area Chart" : "Pie Chart"}
                    </button>
                    <button
                         onClick={handleResetFilters}
                         className="btn btn-outline-danger border-2 text-sm mx-3"
                    >
                         Reset
                    </button>
               </div>

               {/* Charts */}
               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    view === "pie" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <PieChart>
                                        <Pie
                                             data={data}
                                             dataKey="totalSales"
                                             nameKey="month"
                                             cx="50%"
                                             cy="50%"
                                             outerRadius={150}
                                             label={({ name, value }) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return `${name}: ${currencyFormatter.format(value)} (${percentage}%)`;
                                             }}
                                        >
                                             {data.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                             ))}
                                        </Pie>
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                   </PieChart>
                              </ResponsiveContainer>
                         </div>
                    ) : view === "bar" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Bar
                                             dataKey="totalSales"
                                             fill={BAR_COLORS[0]} // Use the same color for all bars
                                        />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    ) : view === "line" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <LineChart data={data}>
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
                                   </LineChart>
                              </ResponsiveContainer>
                         </div>
                    ) : (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <AreaChart data={data}>
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="totalSales" stroke="#8884d8" fill="#8884d8" />
                                   </AreaChart>
                              </ResponsiveContainer>
                         </div>
                    )
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}

               {/* Table */}
               <table className="table table-bordered">
                    <thead>
                         <tr>
                              <th>Month</th>
                              <th>Total Sales</th>
                         </tr>
                    </thead>
                    <tbody>
                         {data.map((entry, index) => (
                              <tr key={index}>
                                   <td>{entry.month}</td>
                                   <td>{currencyFormatter.format(entry.totalSales)}</td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </DashBoardLayoutSales>
     );
}
