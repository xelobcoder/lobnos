import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Card } from 'react-bootstrap';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { customFetch } from '../../../Auth/customFetch';

export default function TestAscensionLineChart() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDataKey, setSelectedDataKey] = useState('all');

    const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i)
        .map(year => ({ value: year, label: year.toString() }));

    const handleYearChange = (selectedOption) => {
        setYear(selectedOption?.value || new Date().getFullYear());
    };

    const handleCheckboxChange = (key) => {
        if (key === 'all') {
            setSelectedDataKey(selectedDataKey === 'all' ? '' : 'all');
        } else {
            setSelectedDataKey(selectedDataKey === key ? '' : key);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await customFetch(`ascension/analytics/getCollectionToDisputeToApprovedToRedrawnLastOverParticularYearHandler?year=${year}`);
                const formattedData = result.map(item => ({
                    day: item.day,
                    testCount: item.test_count,
                    approvalCount: item.approval_count,
                    rejectionSampleCount: item.rejections_sample_count,
                    date: item.ascension_date,
                }));
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    return (
        <Card className="br-5 bg-body-secondary my-3" style={{ border: 'none' }}>
            <Card.Header>
                <h5>Test Ascension Line Chart</h5>
                <div className="d-flex justify-content-between mt-3">
                    <div className='col-2'>
                        <Select
                            id="year-select"
                            options={years}
                            defaultValue={years[0]}
                            onChange={handleYearChange}
                            placeholder="Select Year"
                        />
                    </div>
                    <div className='col-10 mx-2 mt-2 text-primary'>
                        <div className='d-flex'>
                            <input
                                type="checkbox"
                                className='mx-1'
                                checked={selectedDataKey === 'all'}
                                onChange={() => handleCheckboxChange('all')}
                            /> Show All
                            <input
                                type="checkbox"
                                className='mx-1'
                                checked={selectedDataKey === 'testCount'}
                                onChange={() => handleCheckboxChange('testCount')}
                            /> Test Count
                            <input
                                type="checkbox"
                                className='mx-1'
                                checked={selectedDataKey === 'approvalCount'}
                                onChange={() => handleCheckboxChange('approvalCount')}
                            /> Approval Count
                            <input
                                type="checkbox"
                                className='mx-1'
                                checked={selectedDataKey === 'rejectionSampleCount'}
                                onChange={() => handleCheckboxChange('rejectionSampleCount')}
                            /> Rejection Sample Count
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip
                                content={({ payload }) => {
                                    if (!payload || payload.length === 0) return null;
                                    const { day, testCount, approvalCount, rejectionSampleCount, date } = payload[0].payload;
                                    return (
                                        <div className="list-group br-5  p-2">
                                            <div className='list-group-item bg-secondary-subtle'>
                                                <strong>Date:</strong> {formatDate(date)}
                                            </div>
                                            <div className='list-group-item'>
                                                <div>
                                                    <strong>Day:</strong> {day}
                                                </div>
                                                <div>
                                                    <strong>Test Count:</strong> {testCount}
                                                </div>
                                                <div>
                                                    <strong>Approval Count:</strong> {approvalCount}
                                                </div>
                                                <div>
                                                    <strong>Rejection Sample Count:</strong> {rejectionSampleCount}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                            <Legend />
                            {selectedDataKey === 'all' || selectedDataKey === 'testCount' ? (
                                <Line type="monotone" dataKey="testCount" stroke="#99BFFF" />
                            ) : null}
                            {selectedDataKey === 'all' || selectedDataKey === 'approvalCount' ? (
                                <Line type="monotone" dataKey="approvalCount" stroke="#0F47FF" />
                            ) : null}
                            {selectedDataKey === 'all' || selectedDataKey === 'rejectionSampleCount' ? (
                                <Line type="monotone" dataKey="rejectionSampleCount" stroke="#83FF9A" />
                            ) : null}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
}
