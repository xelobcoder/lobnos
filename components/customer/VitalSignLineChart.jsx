import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VitalSignLineChart = ({ data, title, dataKey, strokeColor }) => {
    return (
        <div className="p-4 rounded-xl border  bg-white text-[hsl(220_70%_20%)] shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold m-0">{title}</h5>
                <small className="text-[hsl(220_20%_50%)]">Last recorded values</small>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                    data={data}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                    <CartesianGrid 
                        stroke="hsl(220 20% 90%)" 
                        vertical={false}
                    />
                    <XAxis 
                        dataKey="time" 
                        stroke="hsl(220 20% 50%)"
                        tick={{ fill: 'hsl(220 20% 50%)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        stroke="hsl(220 20% 50%)"
                        tick={{ fill: 'hsl(220 20% 50%)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            color: 'hsl(220 70% 20%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            padding: '12px'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey={dataKey} 
                        stroke="hsl(220 70% 50%)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(220 70% 50%)' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VitalSignLineChart;
