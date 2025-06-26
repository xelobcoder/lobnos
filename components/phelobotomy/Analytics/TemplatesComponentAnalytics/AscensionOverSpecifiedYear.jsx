"use client";
import { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import { customFetch, reactSelectCustomStyles } from '../../../Auth/customFetch';

const COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];

export default function TestAscensionLineChart() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDataKeys, setSelectedDataKeys] = useState(['all']);

    const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i)
        .map(yr => ({ value: yr, label: yr.toString() }));

    const handleYearChange = (selectedOption) => {
        setYear(selectedOption?.value || new Date().getFullYear());
    };

    const handleCheckboxChange = (key) => {
        if (key === 'all') {
            setSelectedDataKeys(selectedDataKeys.includes('all') ? [] : ['all']);
        } else {
            setSelectedDataKeys(prevKeys =>
                prevKeys.includes(key) ? prevKeys.filter(k => k !== key) : [...prevKeys, key]
            );
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await customFetch(`ascension/analytics/getCollectionToDisputeToApprovedToRedrawnLastOverParticularYearHandler?year=${year}`);
                const formattedData = result
                    .map(item => ({
                        ...item,
                        day: item.day,
                        testCount: item.test_count,
                        approvalCount: item.approval_count,
                        rejectionSampleCount: item.rejections_sample_count,
                        date: moment(item.ascension_date).format('MMM D, YYYY'),
                    }))
                    .sort((a, b) => moment(a.ascension_date).diff(moment(b.ascension_date)));
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
        <div className="my-3 p-3 text-capitalize pls-color" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h5 className=' pls-label'>Test Ascension Line Chart</h5>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div style={{ width: '150px' }}>
                        <Select
                            id="year-select"
                            options={years}
                            defaultValue={years[0]}
                            onChange={handleYearChange}
                            styles={reactSelectCustomStyles}
                            placeholder="Select Year"
                        />
                    </div>
                    <div className="d-flex align-items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedDataKeys.includes('all')}
                                onChange={() => handleCheckboxChange('all')}
                            /> Show All
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedDataKeys.includes('testCount')}
                                onChange={() => handleCheckboxChange('testCount')}
                            /> Test Count
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedDataKeys.includes('approvalCount')}
                                onChange={() => handleCheckboxChange('approvalCount')}
                            /> Approval Count
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedDataKeys.includes('rejectionSampleCount')}
                                onChange={() => handleCheckboxChange('rejectionSampleCount')}
                            /> Rejection Sample Count
                        </label>
                    </div>
                </div>
            </div>
            <div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                content={({ payload }) => {
                                    if (!payload || payload.length === 0) return null;
                                    const { date, testCount, approvalCount, rejectionSampleCount } = payload[0].payload;
                                    return (
                                        <div style={{
                                            background: 'white',
                                            padding: '8px',
                                            border: `1px solid ${COLORS[4]}`,
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}>
                                            <div style={{
                                                background: '#e9ecef',
                                                padding: '6px',
                                                borderTopLeftRadius: '8px',
                                                borderTopRightRadius: '8px'
                                            }}>
                                                <strong>Date:</strong> {date}
                                            </div>
                                            <div style={{ padding: '6px' }}>
                                                <p style={{ margin: '4px 0' }}><strong>Test Count:</strong> {testCount}</p>
                                                <p style={{ margin: '4px 0' }}><strong>Approval Count:</strong> {approvalCount}</p>
                                                <p style={{ margin: 0 }}><strong>Rejection Sample Count:</strong> {rejectionSampleCount}</p>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                            <Legend />
                            {(selectedDataKeys.includes('all') || selectedDataKeys.includes('testCount')) && (
                                <Line type="monotone" dataKey="testCount" stroke={COLORS[0]} name="Test Count" strokeWidth={2} />
                            )}
                            {(selectedDataKeys.includes('all') || selectedDataKeys.includes('approvalCount')) && (
                                <Line type="monotone" dataKey="approvalCount" stroke={COLORS[1]} name="Approval Count" strokeWidth={2} />
                            )}
                            {(selectedDataKeys.includes('all') || selectedDataKeys.includes('rejectionSampleCount')) && (
                                <Line type="monotone" dataKey="rejectionSampleCount" stroke={COLORS[2]} name="Rejection Sample Count" strokeWidth={2} />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
