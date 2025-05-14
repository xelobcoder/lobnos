"use client"
import { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
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

// Shadcn-inspired color palette
const SHADCN_ACCENT = "#3B82F6"; // blue-500
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900

export default function TotalSalesByClinician() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const url = `financials/billing/summary?key=totalSalesByClinician`;
      try {
        const fetchedData = await customFetch(url);
        const filteredData = fetchedData.filter(
          (item) => item.name !== "Unknown"
        );
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
    <div className="container-fluid">
      <h4 className="fw-bold mb-4 bg-secondary-subtle rounded p-3 d-flex align-items-center">
        Total Sales by Clinician
      </h4>
      
      {loading ? (
        <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '400px' }}>
          <p className="text-muted">Loading...</p>
        </div>
      ) : data.length > 0 ? (
        <div className="bg-white rounded shadow-sm p-3" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
              <XAxis
                dataKey="name"
                tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                tickLine={{ stroke: SHADCN_BORDER }}
              />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value)}
                tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                tickLine={{ stroke: SHADCN_BORDER }}
                width={80}
              />
              <Tooltip
                formatter={(value) => [currencyFormatter.format(value), 'Sales']}
                contentStyle={{
                  backgroundColor: SHADCN_TOOLTIP_BG,
                  borderRadius: '0.5rem',
                  borderColor: SHADCN_BORDER,
                  color: SHADCN_TOOLTIP_FG,
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar
                dataKey="totalSales"
                fill={SHADCN_ACCENT}
                radius={[4, 4, 0, 0]}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '400px' }}>
          <p className="text-muted">No data available</p>
        </div>
      )}
    </div>
  );
}
