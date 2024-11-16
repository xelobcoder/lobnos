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
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TotalSalesByServiceCategory() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("pie");
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByBranchAndCategory&startDate=${startDate}&endDate=${endDate}`;
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
          setView((prevView) => (prevView === "pie" ? "bar" : "pie"));
     };

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);

     const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

     return (
          <DashBoardLayoutSales>
               <h3>Total Sales by Service Category</h3>

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
                    <button onClick={handleToggleView} className="btn btn-light mx-3 border-primary border-2">
                         Switch to {view === "pie" ? "Bar Chart" : "Pie Chart"}
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
                                             nameKey="serviceCategory"
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
                    ) : (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="serviceCategory" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalSales" fill="#8884d8" />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    )
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}
          </DashBoardLayoutSales>
     );
}
