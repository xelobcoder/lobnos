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
} from "recharts";

const COLORS = ['#0088FE', '#FF8042']; 
export default function TotalSalesByOutsourcedStatus() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByOutsourcedStatus`;
               try {
                    const fetchedData = await customFetch(url);
                    const mappedData = [
                         {
                              name: "Not Outsourced",
                              totalSales: fetchedData.find(item => item.isoutsourced === 0)?.totalSales || 0,
                         },
                         {
                              name: "Outsourced",
                              totalSales: fetchedData.find(item => item.isoutsourced === 1)?.totalSales || 0,
                         },
                    ];
                    setData(mappedData);
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
          <div className="container-fluid " style={{ backgroundColor: '#f8f9fa' }}>
               <h2 className="mb-4 fs-4 fw-bold pls-label bg-secondary-subtle p-2 br-5">Total Sales by Outsourced Status</h2>

               {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               ) : data.length > 0 ? (
                    <div className="row">
                         <div className="col-12 mb-4">
                              <div style={{ height: "300", backgroundColor: "white", padding: "20px 40px", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <ResponsiveContainer width="100%" height="100%">
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
                                                  formatter={(value, entry) => {
                                                       const { payload } = entry;
                                                       const percentage = ((parseFloat(payload.totalSales) / totalSales) * 100).toFixed(1);
                                                       return `${value} (${percentage}%)`;
                                                  }}
                                             />
                                        </PieChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                         <div className="col-12">
                              <div className="table-responsive" style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)" }}>
                                   <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="py-3">Status</th>
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
