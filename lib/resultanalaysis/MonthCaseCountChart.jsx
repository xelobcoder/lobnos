"use client";
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CaseCountAreaChart = ({ data }) => {
    const [chart, setChart] = useState(1);

    return (
        <div className="container-fluid my-2">
            <div className="row justify-content-center my-2">
                <div className="col-md-4 col-12">
                    <div className="form-group">
                        <select
                            className="custom-select"
                            onChange={(e) => setChart(Number(e.target.value))}
                            aria-label="Select chart type"
                        >
                            <option value={1}>Bar Chart</option>
                            <option value={2}>Line Chart</option>
                        </select>
                    </div>
                </div>
            </div>

            {chart === 1 && (
                <div className="card shadow-lg border-0 rounded-xl mb-4">
                    <div className="card-header  bg-light p-3 rounded-t-xl">
                        <h5 className="mb-0">Month Case Count - Bar Chart</h5>
                    </div>
                    <div className="card-body p-4">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="day" stroke="#BDBDBD" />
                                <YAxis stroke="#BDBDBD" />
                                <Tooltip />
                                <Bar dataKey="caseCount" fill="#4285F4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {chart === 2 && (
                <div className="card shadow-lg border-0 rounded-xl mb-4">
                    <div className="card-header  bg-light p-3 rounded-t-xl">
                        <h5 className="mb-0">Month Case Count - Line Chart</h5>
                    </div>
                    <div className="card-body p-4">
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="day" stroke="#BDBDBD" />
                                <YAxis stroke="#BDBDBD" />
                                <Tooltip />
                                <Area type="monotone" dataKey="caseCount" stroke="#4285F4" fill="#4285F4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseCountAreaChart;
