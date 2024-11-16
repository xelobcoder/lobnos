import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
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

const BAR_COLORS = ['#5D8FB1', '#9D6D7B', '#FF8A5C', '#F2A900'];

export default function DailySalesTrend() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("bar");
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=dailySalesTrend&startDate=${startDate}&endDate=${endDate}`;
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
          return date.toLocaleDateString(); // Format as "MM/DD/YYYY"
     };

     return (
          <DashBoardLayoutSales>
               <h3>Daily Sales Trend</h3>

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
                         Switch to {view === "bar" ? "Line Chart" : view === "line" ? "Area Chart" : "Bar Chart"}
                    </button>
                    <button
                         onClick={handleResetFilters}
                         className="btn btn-outline-danger border-2 text-sm mx-3"
                    >
                         Reset
                    </button>
               </div>

               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    view === "bar" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalSales" fill={BAR_COLORS[0]} />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    ) : view === "line" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <LineChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                        />
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
                                   <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <XAxis
                                             dataKey="date"
                                             tickFormatter={(value) => formatDate(value)}
                                             angle={-60}
                                             textAnchor="end"
                                             interval={0}
                                        />
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

               <table className="table table-bordered">
                    <thead>
                         <tr>
                              <th>Date</th>
                              <th>Total Sales</th>
                         </tr>
                    </thead>
                    <tbody>
                         {data.map((entry, index) => (
                              <tr key={index}>
                                   <td>{formatDate(entry.date)}</td>
                                   <td>{currencyFormatter.format(entry.totalSales)}</td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </DashBoardLayoutSales>
     );
}
