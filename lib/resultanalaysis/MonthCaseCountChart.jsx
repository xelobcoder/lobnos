"use client"
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const CaseCountAreaChart = ({ data }) => {
    const [chart, setChart] = useState(1);
    return (
        <div>
            <div className='d-flex'>
                <select className='form-control col-3'>
                    <option value={1}>Bar Chart</option>
                    <option value={2}>Line Chart</option>
                </select>
            </div>
            {chart === 1 && (
                <div className='card my-2' style={{ borderRadius: "0px !important" }}>
                    <div className='card-header bg-body-secondary'>
                        Month Case Count
                    </div>
                    <div className='card-body'>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="caseCount" stroke="#8884d8" fill="#8884d8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )
            }
        </div>
    );
};

export default CaseCountAreaChart;
