"use client"
import { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
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

const COLORS = ['#0088FE', '#00C49F'];

export default function TotalSalesByServiceCategory() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("bar");
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByBranchAndCategory&startDate=${startDate}&endDate=${endDate}`;
               try {
                    const fetchedData = await customFetch(url);
                    const mappedData = fetchedData.map(item => ({
                         name: item.serviceCategory,
                         totalSales: parseFloat(item.totalSales) || 0
                    }));
                    setData(mappedData);
                    setLoading(false);
               } catch (error) {
                    setData([]);
                    setLoading(false);
                    console.error("Error fetching data:", error);
               }
          };

          fetchData();
     }, [startDate, endDate]);

     const handleToggleView = () => {
          setView((prevView) => (prevView === "pie" ? "bar" : "pie"));
     };

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);

     const totalSales = data.reduce((sum, entry) => sum + parseFloat(entry.totalSales), 0);

     return (
          <div className="container-fluid" style={{ backgroundColor: '#f8f9fa' }}>
               <h2 className="mb-4 fs-4 fw-bold pls-label bg-secondary-subtle p-2 br-5">Total Sales by Service Category</h2>

               <div className="d-flex flex-wrap gap-3 mb-4">
                    <div className="d-flex align-items-center">
                         <label className="me-2">Start Date</label>
                         <input
                              type="date"
                              className="form-control"
                              value={startDate}
                              onChange={handleStartDateChange}
                         />
                    </div>
                    <div className="d-flex align-items-center">
                         <label className="me-2">End Date</label>
                         <input
                              type="date"
                              className="form-control"
                              value={endDate}
                              onChange={handleEndDateChange}
                         />
                    </div>
                    <button
                         onClick={handleToggleView}
                         className="btn btn-primary btn-sm "
                    >
                         Switch to {view === "pie" ? "Bar Chart" : "Pie Chart"}
                    </button>
               </div>

               {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               ) : data.length > 0 ? (
                    <div className="row">
                         <div className="col-12 mb-4">
                              <div style={{ height: 500, backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <ResponsiveContainer width="100%" height="100%">
                                        {view === "pie" ? (
                                             <PieChart>
                                                  <Pie
                                                       data={data}
                                                       dataKey="totalSales"
                                                       nameKey="name"
                                                       cx="50%"
                                                       cy="45%"
                                                       innerRadius={120}
                                                       outerRadius={160}
                                                       paddingAngle={4}
                                                       label={({ name, value }) => {
                                                            const percentage = ((parseFloat(value) / totalSales) * 100).toFixed(1);
                                                            return `${name}: ${percentage}%`;
                                                       }}
                                                       labelLine={false}
                                                  >
                                                       {data.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                       ))}
                                                  </Pie>
                                                  <Tooltip
                                                       formatter={(value) => {
                                                            const percentage = ((parseFloat(value) / totalSales) * 100).toFixed(1);
                                                            return [`${currencyFormatter.format(value)} (${percentage}%)`];
                                                       }}
                                                       labelStyle={{ color: "#666", fontWeight: "bold" }}
                                                       contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', padding: '10px' }}
                                                  />
                                                  <Legend
                                                       verticalAlign="bottom"
                                                       align="center"
                                                       wrapperStyle={{ fontSize: '1rem', marginTop: '30px' }}
                                                  />
                                             </PieChart>
                                        ) : (
                                             <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                  <CartesianGrid strokeDasharray="3 3" />
                                                  <XAxis dataKey="name" />
                                                  <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                                  <Tooltip
                                                       formatter={(value) => {
                                                            const percentage = ((parseFloat(value) / totalSales) * 100).toFixed(1);
                                                            return [`${currencyFormatter.format(value)} (${percentage}%)`];
                                                       }}
                                                       labelStyle={{ color: "#666", fontWeight: "bold" }}
                                                       contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', padding: '10px' }}
                                                  />
                                                  <Legend wrapperStyle={{ fontSize: '1rem' }} />
                                                  <Bar
                                                       dataKey="totalSales"
                                                       fill="#36a2eb"
                                                       radius={[5, 5, 0, 0]}
                                                       name="Total Sales"
                                                  />
                                             </BarChart>
                                        )}
                                   </ResponsiveContainer>
                              </div>
                         </div>
                         <div className="col-12">
                              <div className="table-responsive" style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="py-3">Service Category</th>
                                                  <th className="py-3">Total Sales</th>
                                                  <th className="py-3">Percentage</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {data.map((entry, index) => {
                                                  const percentage = ((parseFloat(entry.totalSales) / totalSales) * 100).toFixed(2);
                                                  return (
                                                       <tr key={index}>
                                                            <td className="py-2">{entry.name}</td>
                                                            <td className="py-2">{currencyFormatter.format(entry.totalSales)}</td>
                                                            <td className="py-2">{percentage}%</td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               ) : (
                    <div className="alert alert-info" role="alert">
                         No sales data available.
                    </div>
               )}
          </div>
     );
}
