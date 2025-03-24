import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmailLogsBarChart = ({ data }) => {
  const [stack, setStack] = useState(data.length >= 10 || false);
  return (
    <div >
      <ResponsiveContainer width="100%" height={300} style={{ backgroundColor: 'white' }}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" stackId={stack ? 'a' : '1' } fill="#0d6efd" barSize={30} />
          <Bar dataKey="failed" stackId={stack ? 'a' : '2' } fill="#d63384" barSize={30} />
          <Bar dataKey="success" stackId={stack ? 'a' : '3' } fill="#198754" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmailLogsBarChart;
