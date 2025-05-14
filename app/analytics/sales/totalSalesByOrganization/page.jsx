"use client"
import { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
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

export default function TotalSalesByOrganization() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByOrganization`;
               try {
                    const fetchedData = await customFetch(url);
                    setData(fetchedData);
                    setLoading(false);
               } catch (error) {
                    setData([]);
                    setLoading(false);
                    console.error("Error fetching data:", error);
               }
          };

          fetchData();
     }, []);

     const totalSales = data.reduce((sum, entry) => sum + parseFloat(entry.totalSales), 0);

     return (
          <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa' }}>
               <h2 className="mb-4 fs-4 fw-bold pls-label bg-secondary-subtle p-2 br-5">Total Sales by Organization</h2>

               {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               ) : data.length > 0 ? (
                    <div className="row">
                         <div className="col-12 mb-4">
                              <div style={{ height: "400px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <ResponsiveContainer>
                                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis 
                                                  dataKey="name" 
                                                  angle={-45}
                                                  textAnchor="end"
                                                  interval={0}
                                                  height={60}
                                                  style={{ fontSize: '0.8rem' }}
                                             />
                                             <YAxis 
                                                  tickFormatter={(value) => currencyFormatter.format(value)}
                                                  style={{ fontSize: '0.8rem' }}
                                             />
                                             <Tooltip
                                                  formatter={(value) => {
                                                       const percentage = ((parseFloat(value) / totalSales) * 100).toFixed(2);
                                                       return [`${currencyFormatter.format(value)} (${percentage}%)`];
                                                  }}
                                                  labelStyle={{ color: "#666", fontWeight: "bold" }}
                                                  contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '4px' }}
                                             />
                                             <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                                             <Bar 
                                                  dataKey="totalSales" 
                                                  fill="#36a2eb"
                                                  radius={[5, 5, 0, 0]}
                                                  name="Total Sales"
                                             />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                         <div className="col-12">
                              <div className="table-responsive" style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="py-3">Organization Name</th>
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
