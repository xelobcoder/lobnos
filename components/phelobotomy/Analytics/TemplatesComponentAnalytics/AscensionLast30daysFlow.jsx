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
import { Card } from 'react-bootstrap';
import { customFetch } from '../../../Auth/customFetch';

export default function TestAscensionOverLast30DaysCard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await customFetch('ascension/analytics/getCollectionToDisputeToApprovedToRedrawnLast30days');
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="br-0 heightedBorder " style={{ border: 'none' }}>
            <Card.Header className="p-3">
                <h5>Test Ascension Over Last 30 Days</h5>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div>Loading...</div>
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
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="approval_count" fill="#8884d8" stroke="#8884d8" name="Approval Count" />
                            <Bar dataKey="test_count" barSize={20} fill="#413ea0" name="Test Count" />
                            <Line type="monotone" dataKey="resolved_disputed_cases_count" stroke="#ff7300" name="Resolved Disputed Cases" />
                            <Scatter dataKey="rejections_sample_count" fill="red" name="Rejection Samples" />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
}
