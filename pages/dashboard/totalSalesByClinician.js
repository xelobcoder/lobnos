import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../components/Auth/customFetch";
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

export default function TotalSalesByClinician() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByClinician`;
               try {
                    const fetchedData = await customFetch(url);
                    const filteredData = fetchedData.filter((item) => item.name !== "Unknown");
                    setData(filteredData);
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
               <h3>Total Sales by Clinician</h3>

               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    <>
                         <div style={{ width: "100%", height: 400, marginBottom: "20px" }}>
                              <ResponsiveContainer>
                                   <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value) => `${currencyFormatter.format(value)}`}
                                             labelFormatter={(label) => `Clinician: ${label}`}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalSales" fill="#8884d8" />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                         <table className="table table-bordered">
                              <thead>
                                   <tr>
                                        <th>Clinician Name</th>
                                        <th>Total Sales</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {data.map((entry, index) => (
                                        <tr key={index}>
                                             <td>{entry.name}</td>
                                             <td>{currencyFormatter.format(entry.totalSales)}</td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </>
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}
          </DashBoardLayoutSales>
     );
}
