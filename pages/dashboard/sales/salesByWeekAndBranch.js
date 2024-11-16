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
} from "recharts";

export default function SalesByWeekAndBranch() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=salesByWeekAndBranch`;
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
     }, []);

     const processChartData = () => {
          const groupedData = {};
          data.forEach((entry) => {
               if (!groupedData[entry.week]) groupedData[entry.week] = {};
               groupedData[entry.week][entry.name.trim()] = entry.totalSales;
          });

          return Object.keys(groupedData).map((week) => ({
               week: `Week ${week}`,
               ...groupedData[week],
          }));
     };

     const chartData = processChartData();
     const uniqueBranches = [...new Set(data.map((entry) => entry.name.trim()))];

     const branchSpecificData = uniqueBranches.map((branch) => ({
          branchName: branch,
          data: data.filter((entry) => entry.name.trim() === branch),
     }));

     return (
          <DashBoardLayoutSales>
               <h3>Sales By Week and Branch</h3>

               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    <>
                         {/* Grouped Bar Chart */}
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                             dataKey="week"
                                             angle={-45}
                                             textAnchor="end"
                                             interval={0}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value) => currencyFormatter.format(value)}
                                             itemStyle={{ color: "#000" }}
                                        />
                                        <Legend />
                                        {uniqueBranches.map((branch, index) => (
                                             <Bar
                                                  key={branch}
                                                  dataKey={branch}
                                                  fill={`hsl(${(index * 360) / uniqueBranches.length}, 70%, 50%)`}
                                             />
                                        ))}
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>

                         {/* Individual Tables for Each Branch */}
                         {branchSpecificData.map((branchData, index) => (
                              <div key={index} className="mt-4">
                                   <h4>{branchData.branchName}</h4>
                                   <table className="table table-bordered">
                                        <thead>
                                             <tr>
                                                  <th>Week</th>
                                                  <th>Total Sales</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {branchData.data.map((entry, idx) => (
                                                  <tr key={idx}>
                                                       <td>{`Week ${entry.week}`}</td>
                                                       <td>{currencyFormatter.format(entry.totalSales)}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         ))}
                    </>
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}
          </DashBoardLayoutSales>
     );
}
