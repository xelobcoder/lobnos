"use client"
import { useEffect, useState } from "react";
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

import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TotalSalesByEmployee() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("bar");
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByEmployee&startDate=${startDate}&endDate=${endDate}`;
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
          <div className="container-fluid">
               <h4 className="fw-bold mb-4 bg-secondary-subtle rounded p-3 d-flex align-items-center">
                    Total Sales by Employee
               </h4>

               <div className="d-flex gap-3 mb-3 align-items-center">
                    <div className="d-flex align-items-center">
                         <label className="me-2">Start Date:</label>
                         <input
                              type="date"
                              className="form-control form-control-sm"
                              value={startDate}
                              onChange={handleStartDateChange}
                         />
                    </div>
                    <div className="d-flex align-items-center">
                         <label className="me-2">End Date:</label>
                         <input
                              type="date"
                              className="form-control form-control-sm"
                              value={endDate}
                              onChange={handleEndDateChange}
                         />
                    </div>
                    <button
                         onClick={handleToggleView}
                         className="btn btn-outline-primary btn-sm"
                    >
                         Switch to {view === "pie" ? "Bar Chart" : "Pie Chart"}
                    </button>
               </div>

               {loading ? (
                    <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '400px' }}>
                         <p className="text-muted">Loading...</p>
                    </div>
               ) : data.length > 0 ? (
                    view === "pie" ? (
                         <div className="bg-white rounded shadow-sm p-3" style={{ height: '500px', minWidth: '300px', width: '100%' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                   <PieChart>
                                        <Pie
                                             data={data}
                                             dataKey="totalSales"
                                             nameKey="username"
                                             cx="50%"
                                             cy="50%"
                                             outerRadius={150}
                                             label={({ name, value }) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(1);
                                                  return `${name}: ${currencyFormatter.format(value)} (${percentage}%)`;
                                             }}
                                        >
                                             {data.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                             ))}
                                        </Pie>
                                        <Tooltip
                                             formatter={(value) => [currencyFormatter.format(value), 'Sales']}
                                             contentStyle={{
                                                  backgroundColor: '#FFFFFF',
                                                  borderRadius: '0.5rem',
                                                  borderColor: '#E2E8F0',
                                                  fontSize: '12px',
                                                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                             }}
                                        />
                                        <Legend />
                                   </PieChart>
                              </ResponsiveContainer>
                         </div>
                    ) : (
                         <div className="bg-white rounded shadow-sm p-3" style={{ height: '500px', minWidth: '300px', width: '100%' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis
                                             dataKey="username"
                                             tick={{ fill: '#64748B', fontSize: 12 }}
                                             tickLine={{ stroke: '#E2E8F0' }}
                                        />
                                        <YAxis
                                             tickFormatter={(value) => currencyFormatter.format(value)}
                                             tick={{ fill: '#64748B', fontSize: 12 }}
                                             tickLine={{ stroke: '#E2E8F0' }}
                                             width={80}
                                        />
                                        <Tooltip
                                             formatter={(value) => [currencyFormatter.format(value), 'Sales']}
                                             contentStyle={{
                                                  backgroundColor: '#FFFFFF',
                                                  borderRadius: '0.5rem',
                                                  borderColor: '#E2E8F0',
                                                  fontSize: '12px',
                                                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                             }}
                                        />
                                        <Bar
                                             dataKey="totalSales"
                                             fill="#3B82F6"
                                             radius={[4, 4, 0, 0]}
                                             barSize={40}
                                             minPointSize={5}
                                             label={{ position: 'top', formatter: (value) => currencyFormatter.format(value) }}
                                        />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    )
               ) : (
                    <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '400px' }}>
                         <p className="text-muted">No data available</p>
                    </div>
               )}

               {data.length > 0 && (
                    <div className="bg-white rounded shadow-sm mt-4">
                         <table className="table table-hover mb-0">
                              <thead className="table-light">
                                   <tr>
                                        <th className="px-3 py-2">Employee Name</th>
                                        <th className="px-3 py-2">Total Sales</th>
                                        <th className="px-3 py-2">Percentage</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {data.map((entry, index) => (
                                        <tr key={index}>
                                             <td className="px-3 py-2">{entry.username}</td>
                                             <td className="px-3 py-2">{currencyFormatter.format(entry.totalSales)}</td>
                                             <td className="px-3 py-2">
                                                  {((entry.totalSales / totalSales) * 100).toFixed(1)}%
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               )}
          </div>
     );
}
