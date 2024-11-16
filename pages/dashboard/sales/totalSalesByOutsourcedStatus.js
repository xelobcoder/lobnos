import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import {
     ResponsiveContainer,
     PieChart,
     Pie,
     Cell,
     Tooltip,
     Legend,
} from "recharts";

const COLORS = ['#0088FE', '#FF8042']; // Blue for not outsourced, Orange for outsourced

export default function TotalSalesByOutsourcedStatus() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByOutsourcedStatus`;
               try {
                    const fetchedData = await customFetch(url);

                    // Mapping the data to 'Outsourced' and 'Not Outsourced'
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

     return (
          <DashBoardLayoutSales>
               <h3 className=" d-flex justify-content-center">Outsourced vs Not Outsourced</h3>

               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    <>
                         {/* Pie Chart */}
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <PieChart>
                                        <Pie
                                             data={data}
                                             dataKey="totalSales"
                                             nameKey="name"
                                             cx="50%"
                                             cy="50%"
                                             outerRadius={150}
                                             label={({ name, value }) => `${name}: ${currencyFormatter.format(value)}`}
                                        >
                                             {data.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                             ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                                        <Legend />
                                   </PieChart>
                              </ResponsiveContainer>
                         </div>
                              <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mt-3">
                                   <div
                                        className="bg-light p-3 m-2 rounded text-center"
                                        style={{
                                             width: "100%",
                                             maxWidth: "300px",
                                        }}
                                   >
                                        <h3><strong>Outsourced:</strong></h3>
                                        <h2>{currencyFormatter.format(data[1]?.totalSales)}</h2>
                                   </div>

                                   <div
                                        className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle mb-3 mb-md-0"
                                        style={{
                                             width: "80px",
                                             height: "80px",
                                             fontSize: "20px",
                                        }}
                                   >
                                        <strong>VS</strong>
                                   </div>

                                   <div
                                        className="bg-light p-3 m-2 rounded text-center"
                                        style={{
                                             width: "100%",
                                             maxWidth: "300px",
                                        }}
                                   >
                                        <h3><strong>Not Outsourced:</strong></h3>
                                        <h2>{currencyFormatter.format(data[0]?.totalSales)}</h2>
                                   </div>
                              </div>

                    </>
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}
          </DashBoardLayoutSales>
     );
}
