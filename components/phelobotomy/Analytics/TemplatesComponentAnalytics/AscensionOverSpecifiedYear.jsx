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
            // If 'All' is checked, deselect others
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

    return (
        <Card className="br-0 heightedBorder" style={{ border: 'none' }}>
            <Card.Header>
                <h5>Test Ascension Line Chart</h5>
                <div className="d-flex justify-content-between mt-3">
                    <div className='col-2'>
                        <Select
                            id="year-select"
                            options={years}
                            defaultValue={years[0]} // Default to the current year
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
                            <Tooltip />
                            <Legend />
                            {selectedDataKey === 'all' || selectedDataKey === 'testCount' ? (
                                <Line type="monotone" dataKey="testCount" stroke="#f70776" />
                            ) : null}
                            {selectedDataKey === 'all' || selectedDataKey === 'approvalCount' ? (
                                <Line type="monotone" dataKey="approvalCount" stroke="#c3195d" />
                            ) : null}
                            {selectedDataKey === 'all' || selectedDataKey === 'rejectionSampleCount' ? (
                                <Line type="monotone" dataKey="rejectionSampleCount" stroke="#680747" />
                            ) : null}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
}
