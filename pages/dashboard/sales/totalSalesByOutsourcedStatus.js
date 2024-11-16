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

                         {/* Cards with the "vs" in the middle */}
                         <div
                              style={{
                                   display: "flex",
                                   flexDirection: "row",
                                   justifyContent: "center",
                                   marginTop: "20px",
                                   flexWrap: "wrap",
                              }}
                         >
                              <div
                                   style={{
                                        backgroundColor: "#f0f0f0",
                                        padding: "20px",
                                        margin: "10px",
                                        borderRadius: "8px",
                                        textAlign: "center",
                                        width: "35%",
                                   }}
                              >
                                   <h3><strong>Outsourced:</strong></h3>
                                   <h2>{currencyFormatter.format(data[1]?.totalSales)}</h2>
                              </div>

                              <div
                                   style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100px",
                                        height: "100px",
                                        backgroundColor: "#e0e0e0",
                                        borderRadius: "50%",
                                        margin: "10px",
                                        fontSize: "24px",
                                   }}
                              >
                                   <strong>VS</strong>
                              </div>

                              <div
                                   style={{
                                        backgroundColor: "#f0f0f0",
                                        padding: "20px",
                                        margin: "10px",
                                        borderRadius: "8px",
                                        textAlign: "center",
                                        width: "35%",
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
