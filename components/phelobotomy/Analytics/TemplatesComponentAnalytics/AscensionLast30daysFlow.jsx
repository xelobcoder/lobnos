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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { day, approval_count, test_count, resolved_disputed_cases_count, rejections_sample_count } = payload[0].payload;
        return (
            <div className="custom-tooltip pls-color list-group br-5" >
                <div className='list-group-item  bg-secondary-subtle'>Date {day}</div>
                <div className='list-group-item text-sm'>
                    <p>Approval Count {approval_count}</p>
                    <p>Test Count {test_count}</p>
                    <p>Resolved Disputed Cases {resolved_disputed_cases_count}</p>
                    <p>Rejection Samples {rejections_sample_count}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function TestAscensionOverLast30DaysCard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await customFetch('ascension/analytics/getCollectionToDisputeToApprovedToRedrawnLast30days');
                setData(result);
                console.log(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="br-5 bg-body-secondary my-3" style={{ border: 'none' }}>
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
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="approval_count" fill="#99BFFF" stroke="#99BFFF" name="Approval Count" />
                            <Bar dataKey="test_count" barSize={50} fill="#0F47FF" name="Test Count" />
                            <Line type="monotone" dataKey="resolved_disputed_cases_count" stroke="#83FF9A" name="Resolved Disputed Cases" />
                            <Scatter dataKey="rejections_sample_count" fill="#ff0000" name="Rejection Samples" />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
}
