import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowDownward, Menu } from "@mui/icons-material";

export default function TotalSalesByBranch() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     const [view, setView] = useState("pie");
     const [startDate, setStartDate] = useState("");
     const [endDate, setEndDate] = useState("");

     useEffect(() => {
          const fetchData = async () => {
               const url = `financials/billing/summary?key=totalSalesByBranch&startDate=${startDate}&endDate=${endDate}`;
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
          setView((prevView) => {
               if (prevView === "pie") return "bar";
               if (prevView === "bar") return "table";
               return "pie";
          });
     };

     const handleStartDateChange = (e) => setStartDate(e.target.value);
     const handleEndDateChange = (e) => setEndDate(e.target.value);

     const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

     return (
          <DashBoardLayoutSales>
               <h3>Total Sales by Branch</h3>

               <div className="d-flex flex-column flex-md-row col-12 mb-3">
                    <div className="d-flex align-items-center mb-3 col-12 col-md-3">
                         <label className="mt-2 mx-2">Start</label>
                         <input
                              type="date"
                              className="custom-input form-control"
                              value={startDate}
                              onChange={handleStartDateChange}
                         />
                    </div>

                    <div className="d-flex align-items-center mb-3 col-12 col-md-3">
                         <label className="mt-2 mx-2">End</label>
                         <input
                              type="date"
                              className="custom-input form-control"
                              value={endDate}
                              onChange={handleEndDateChange}
                         />
                    </div>

                    <div className="d-flex align-items-center mb-3 col-12 col-md-3">
                         <button
                              onClick={handleToggleView}
                              className="btn btn-light mx-3 border-primary border-2 w-100 w-md-auto"
                         >
                              Switch to {view === "pie" ? "Bar Chart" : view === "bar" ? "Table" : "Pie Chart"}
                         </button>
                    </div>
               </div>


               {loading ? (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         Loading or no data available...
                    </p>
               ) : data.length > 0 ? (
                    view === "pie" ? (
                         <ResponsiveContainer width="95%" height={400}>
                              <PieChart>
                                   <Pie
                                        data={data}
                                        dataKey="totalSales"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        label={({ name, value }) => {
                                             const percentage = ((value / totalSales) * 100).toFixed(2);
                                             return `${name}: ${currencyFormatter.format(value)} ${percentage}%`;
                                        }}
                                   >
                                        {data.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                   </Pie>
                                   <Tooltip formatter={(value, name) => {
                                        const percentage = ((value / totalSales) * 100).toFixed(2);
                                        return [`${currencyFormatter.format(value)} ${percentage}%`, name];
                                   }} />
                                   <Legend />
                              </PieChart>
                         </ResponsiveContainer>
                    ) : view === "bar" ? (
                         <ResponsiveContainer width="95%" height={400}>
                              <BarChart data={data}>
                                   <CartesianGrid strokeDasharray="3 3" />
                                   <XAxis dataKey="name" />
                                   <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                   <Tooltip formatter={(value, name) => {
                                        const percentage = ((value / totalSales) * 100).toFixed(2);
                                        return [`${currencyFormatter.format(value)} ${percentage}%`, name];
                                   }} />
                                   <Legend />
                                   <Bar dataKey="totalSales" fill="#8884d8" />
                              </BarChart>
                         </ResponsiveContainer>
                    ) : (
                         <table className="table table-bordered ttable">
                              <thead>
                                   <tr>
                                        <th className="d-flex justify-content-between">
                                             <div>
                                                  Branch Name
                                             </div>
                                             <div className="d-flex justify-content-around">
                                                  <span className="btn btn-light p-1 text-sm"><Menu fontSize="10px" /></span>
                                                                 <span className="btn btn-light mx-1 p-1 text-sm"><ArrowDownward fontSize="10px" /></span>
                                             </div>
                                        </th>
                                        <th>Total Sales</th>
                                        <th>Branch Name</th>
                                        <th>Total Sales</th> <th>Branch Name</th>
                                        <th>Total Sales</th> <th>Branch Name</th>

                                   </tr>
                              </thead>
                              <thead>
                                   <tr>
                                        <th>
                                             <input className="custom-input" />
                                        </th>
                                        <th>
                                             <input className="custom-input" />
                                        </th>
                                        <th>
                                             <input className="custom-input" />
                                        </th>
                                        <th>
                                             <input className="custom-input" />
                                        </th>  <th>
                                             <input className="custom-input" />
                                        </th>
                                        <th>
                                             <input className="custom-input" />
                                        </th>  <th>
                                             <input className="custom-input" />
                                        </th>
                                        <th>
                                             <input className="custom-input" />
                                        </th>

                                   </tr>
                              </thead>
                              <tbody>
                                   {data.map((entry, index) => (
                                        <tr key={index}>
                                             <td>{entry.name}</td>
                                             <td>{currencyFormatter.format(entry.totalSales)}</td>
                                             <td>{entry.name}</td>
                                             <td>{currencyFormatter.format(entry.totalSales)}</td>  <td>{entry.name}</td>
                                             <td>{currencyFormatter.format(entry.totalSales)}</td>  <td>{entry.name}</td>

                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    )
               ) : (
                    <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                         No data available...
                    </p>
               )}
          </DashBoardLayoutSales>
     );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
