"use client";
import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    Bar,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { customFetch } from '../../../Auth/customFetch';
import moment from 'moment';

const COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const {
            day,
            approval_count,
            test_count,
            resolved_disputed_cases_count,
            rejections_sample_count
        } = payload[0].payload;

        const formattedDate = moment(day).format('MMM D, YYYY');

        return (
            <div style={{
                minWidth: '200px',
                padding: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div className=' bg-secondary-subtle' style={{
                    padding: '6px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                }}>
                    Date: {formattedDate}
                </div>
                <div style={{ padding: '6px', backgroundColor: 'white' }}>
                    <p style={{ margin: '4px 0', fontWeight: '600', color: COLORS[2] }}>
                        Approval Count: {approval_count}
                    </p>
                    <p style={{ margin: '4px 0', fontWeight: '600', color: COLORS[3] }}>
                        Test Count: {test_count}
                    </p>
                    <p style={{ margin: '4px 0', fontWeight: '600', color: COLORS[0] }}>
                        Resolved Disputed Cases: {resolved_disputed_cases_count}
                    </p>
                    <p style={{ margin: 0, fontWeight: '600', color: COLORS[1] }}>
                        Rejection Samples: {rejections_sample_count}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function AscensionLast30daysFlow() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await customFetch('ascension/analytics/getCollectionToDisputeToApprovedToRedrawnLast30days');
                const formattedData = result.map(item => ({
                    ...item,
                    day: moment(item.ascension_date).format('MMM D, YYYY'), 
                })).sort((a, b) => moment(a.ascension_date).diff(moment(b.ascension_date)));
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="my-3 p-3 pls-color text-capitalize" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h5 className="mb-3 pls-label" >Test Ascension Over Last 30 Days</h5>
            {loading ? (
                <div className="text-center py-5">Loading...</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="approval_count"
                            fill={COLORS[2]}
                            stroke={COLORS[2]}
                            name="Approval Count"
                        />
                        <Bar
                            dataKey="test_count"
                            barSize={30}
                            fill={COLORS[0]}
                            name="Test Count"
                            radius={[10, 10, 0, 0]}
                        />
                        <Line
                            type="monotone"
                            dataKey="resolved_disputed_cases_count"
                            stroke={COLORS[3]}
                            name="Resolved Disputed Cases"
                        />
                        <Scatter
                            dataKey="rejections_sample_count"
                            fill={COLORS[1]}
                            name="Rejection Samples"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}