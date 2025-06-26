import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function BarChartPerformanceComponent({data}){
  const transformedData = data.map(item => ({
    day: item.day,
    payable: item.payable,
    discountedAmount: item.discountedAmount,
    referedCases: item.referedCases
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={transformedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="payable" fill="#8884d8" name="Payable" />
        <Bar dataKey="discountedAmount" fill="#82ca9d" name="Discounted Amount" />
        <Bar dataKey="referedCases" fill="#ffc658" name="Refered Cases" />
      </BarChart>
    </ResponsiveContainer>
  );
};


