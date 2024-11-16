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
     LineChart,
     Line,
     AreaChart,
     Area,
} from "recharts";

const BAR_COLORS = ['#5D8FB1', '#9D6D7B', '#FF8A5C', '#F2A900'];

export default function SalesByHourOfDay() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("bar");
     const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to current date in YYYY-MM-DD format

     useEffect(() => {
          const fetchData = async () => {
               if (!selectedDate) return;

               const url = `financials/billing/summary?key=salesByHourOfDay&startDate=${selectedDate}&endDate=${selectedDate}`;
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
     }, [selectedDate]);

     const handleToggleView = () => {
          setView((prevView) => {
               if (prevView === "bar") return "line";
               if (prevView === "line") return "area";
               return "bar";
          });
     };

     const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

     const formatHourRange = (hour) => {
          const start = hour;
          const end = hour + 1;
          const startAMPM = start < 12 ? `${start} AM` : `${start - 12} PM`;
          const endAMPM = end < 12 ? `${end} AM` : `${end - 12} PM`;
          return `${startAMPM} to ${endAMPM}`;
     };

     const allHours = Array.from({ length: 24 }, (_, index) => index);

     const filledData = allHours.map((hour) => {
          const hourData = data.find((entry) => entry.hour === hour);
          return hourData ? hourData : { hour, totalSales: 0 };
     });

     // Function to conditionally apply styles for table rows
     const getPercentageColor = (percentage) => {
          return percentage > 0 ? "green" : "red";
     };

     return (
          <DashBoardLayoutSales>
               <h3>Sales by Hour of Day</h3>

               <div className="d-flex flex-column flex-md-row justify-content-between col-12">
                    <div className="d-flex align-items-center mb-3 col-12 col-md-4">
                         <label htmlFor="selectedDate" className="me-2"> Date:</label>
                         <input
                              type="date"
                              id="selectedDate"
                              className="custom-input"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                         />
                    </div>

                    {/* Chart Toggle Button */}
                    <div className="d-flex col-12 col-md-4 col-lg-2 col-xl-2 mb-3">
                         <button
                              onClick={handleToggleView}
                              className="btn btn-primary   w-100 w-md-auto"
                         >
                              Switch to {view === "bar" ? "Line Chart" : view === "line" ? "Area Chart" : "Bar Chart"}
                         </button>
                    </div>
               </div>


               {/* Chart and Data */}
               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : filledData.length > 0 ? (
                    view === "bar" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <BarChart data={filledData} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                             dataKey="hour"
                                             tickFormatter={(value) => formatHourRange(value)}
                                             angle={-45}
                                             textAnchor="end"
                                             interval={0}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalSales" fill={BAR_COLORS[0]} />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    ) : view === "line" ? (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <LineChart data={filledData} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                                        <XAxis
                                             dataKey="hour"
                                             tickFormatter={(value) => formatHourRange(value)}
                                             angle={-45}
                                             textAnchor="end"
                                             interval={0}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
                                   </LineChart>
                              </ResponsiveContainer>
                         </div>
                    ) : (
                         <div style={{ width: "100%", height: 400 }}>
                              <ResponsiveContainer>
                                   <AreaChart data={filledData} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                                        <XAxis
                                             dataKey="hour"
                                             tickFormatter={(value) => formatHourRange(value)}
                                             angle={-45}
                                             textAnchor="end"
                                             interval={0}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                        <Tooltip
                                             formatter={(value, name) => {
                                                  const percentage = ((value / totalSales) * 100).toFixed(2);
                                                  return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                             }}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="totalSales" stroke="#8884d8" fill="#8884d8" />
                                   </AreaChart>
                              </ResponsiveContainer>
                         </div>
                    )
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available for the selected date.
                    </p>
               )}

               {/* Styled Data Table */}
               <table className="table table-bordered mt-4 ttable">
                    <thead>
                         <tr>
                              <th>Hour Range</th>
                              <th>Total Sales</th>
                              <th>Percentage of Total</th>
                         </tr>
                    </thead>
                    <tbody>
                         {filledData.map((entry, index) => {
                              const percentage = ((entry.totalSales / totalSales) * 100).toFixed(2);
                              return (
                                   <tr key={index}>
                                        <td>{formatHourRange(entry.hour)}</td>
                                        <td>{currencyFormatter.format(entry.totalSales)}</td>
                                        <td
                                             style={{
                                                  color: getPercentageColor(percentage),
                                                  fontWeight: 'bold',
                                                  fontSize: '1rem',
                                             }}
                                        >
                                             {percentage}%
                                        </td>
                                   </tr>
                              );
                         })}
                    </tbody>
               </table>

               <style jsx>{`
        .ttable thead {
          background-color: #f8f9fa;
          color: #495057;
        }
        .ttable tbody tr:hover {
          background-color: #f1f1f1;
        }
        .ttable td {
          text-align: center;
          font-size: 1rem;
        }
        .ttable th {
          text-align: center;
        }
      `}</style>
          </DashBoardLayoutSales>
     );
}
