"use client"
import { useEffect, useState } from "react";
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
import { currencyFormatter, customFetch} from "../../../../components/Auth/customFetch";


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
          <div className="p-6 bg-white rounded-lg shadow-lg">
               <h2 className="text-2xl font-bold mb-6 text-gray-800">Sales by Week and Branch</h2>

               {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="text-lg text-gray-600">Loading sales data...</div>
                    </div>
               ) : (
                    <div className="space-y-8">
                         {/* Main Combined Chart */}
                         <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold mb-4 text-gray-700">Weekly Sales Comparison</h3>
                              <ResponsiveContainer width="100%" height={400}>
                                   <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => [currencyFormatter.format(value), name]}
                                             labelStyle={{ color: '#374151' }}
                                        />
                                        <Legend />
                                        {Array.isArray(uniqueBranches) && uniqueBranches.map((branch, index) => (
                                             <Bar
                                                  key={branch}
                                                  dataKey={branch}
                                                  fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                                                  name={branch}
                                             />
                                        ))}
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>

                         {/* Individual Branch Charts */}
                         {Array.isArray(branchSpecificData) && branchSpecificData.length >
                         0 && branchSpecificData.map((branchData, index) => (
                              <div key={branchData.branchName} className="bg-gray-50 p-4 rounded-lg">
                                   <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                        {branchData.branchName} - Weekly Sales Trend
                                   </h3>
                                   <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                             data={branchData.data.map(item => ({
                                                  week: `Week ${item.week}`,
                                                  totalSales: parseFloat(item.totalSales)
                                             }))}
                                             margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis dataKey="week" />
                                             <YAxis tickFormatter={(value) => currencyFormatter(value)} />
                                             <Tooltip
                                                  formatter={(value) => [currencyFormatter(value), "Sales"]}
                                                  labelStyle={{ color: '#374151' }}
                                             />
                                             <Bar
                                                  dataKey="totalSales"
                                                  fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                                                  name="Sales"
                                             />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         ))}

                         {/* Summary Statistics */}
                         <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold mb-4 text-gray-700">Summary</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {branchSpecificData.map((branchData) => {
                                        const totalSales = branchData.data.reduce((sum, item) => sum + parseFloat(item.totalSales), 0);
                                        const avgSales = totalSales / branchData.data.length;
                                        const maxSales = Math.max(...branchData.data.map(item => parseFloat(item.totalSales)));

                                        return (
                                             <div key={branchData.branchName} className="bg-white p-4 rounded shadow">
                                                  <h4 className="font-semibold text-gray-800 mb-2">{branchData.branchName}</h4>
                                                  <div className="space-y-1 text-sm">
                                                       <p><span className="font-medium">Total Sales:</span> {currencyFormatter(totalSales)}</p>
                                                       <p><span className="font-medium">Average Sales:</span> {currencyFormatter(avgSales)}</p>
                                                       <p><span className="font-medium">Peak Sales:</span> {currencyFormatter(maxSales)}</p>
                                                       <p><span className="font-medium">Weeks Active:</span> {branchData.data.length}</p>
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
