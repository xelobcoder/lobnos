import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function WeeklyPieChart({ data }) {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];



  return (
    <ResponsiveContainer height={330}  className={"bg-white"} >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#2986cc"
          // innerRadius={40}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
          
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${data[index].name} ${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
