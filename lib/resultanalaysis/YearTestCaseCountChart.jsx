import {
     BarChart,
     Bar,
     AreaChart,
     Area,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     ResponsiveContainer,
} from "recharts";

const YearMonthlyTestCaseChart = ({ data, chartType }) => {
     const months = data.map((item) => item.month);
     const caseCounts = data.map((item) => item.casesCount);

     const calculatePercentageChange = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0; 
          return ((current - previous) / previous) * 100;
     };

     return (
          <div>
               <div>
                    <div>
                         <h6 className="mb-3 text-center font-weight-bold">
                              {chartType === "bar" ? "Bar Chart" : "Area Chart"}: Monthly Case Count For {new Date().getFullYear()}
                         </h6>
                         <ResponsiveContainer width="100%" height={400}>
                              {chartType === "bar" ? (
                                   <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis
                                             dataKey="month"
                                             angle={-45}
                                             textAnchor="end"
                                             stroke="#616161"
                                             tick={{ fontSize: 12 }}
                                        />
                                        <YAxis stroke="#616161" />
                                        <Tooltip />
                                        <Bar dataKey="casesCount" fill="#4285F4" radius={[4, 4, 0, 0]} />
                                   </BarChart>
                              ) : (
                                   <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis
                                             dataKey="month"
                                             angle={-45}
                                             textAnchor="end"
                                             stroke="#616161"
                                             tick={{ fontSize: 12 }}
                                        />
                                        <YAxis stroke="#616161" />
                                        <Tooltip />
                                        <Area
                                             type="monotone"
                                             dataKey="casesCount"
                                             stroke="#4285F4"
                                             fillOpacity={0.3}
                                             fill="#4285F4"
                                        />
                                   </AreaChart>
                              )}
                         </ResponsiveContainer>
                    </div>
               </div>

               <div>
                    <h6 className="mb-3 text-center font-weight-bold">Data Table: Monthly Case Count</h6>
                    <table className="table table-bordered">
                         <thead>
                              <tr className="table-light">
                                   <th className="text-center">Month</th>
                                   <th className="text-center">Case Count</th>
                                   <th className="text-center">Percentage Change</th> 
                                   </tr>
                         </thead>
                         <tbody>
                              {months.map((month, index) => {
                                   const matched = data.find((item) => item.month === month);
                                   const previousMatched = index > 0 ? data.find((item) => item.month === months[index - 1]) : null;
                                   const percentageChange = matched && previousMatched ? calculatePercentageChange(matched.casesCount, previousMatched.casesCount) : 0;

                             
                                   const changeColor =
                                        percentageChange > 0 ? "text-success" :
                                             percentageChange < 0 ? "text-danger" : "text-muted";

                                   return (
                                        <tr key={index}>
                                             <td className="text-center">{month}</td>
                                             <td className="text-center">{matched ? matched.casesCount : "-"}</td>
                                             <td className={`text-center ${changeColor}`}>
                                                  {percentageChange !== 0
                                                       ? `${percentageChange.toFixed(2)}%`
                                                       : "-"}
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>
          </div>
     );
};

export default YearMonthlyTestCaseChart;
