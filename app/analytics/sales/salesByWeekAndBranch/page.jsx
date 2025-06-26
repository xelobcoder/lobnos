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
import { customFetch,currencyFormatter } from "../../../../components/Auth/customFetch";

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
          <div>
         
          </div>
     );
}
