"use client";
import { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { customFetch, reactSelectCustomStyles } from '../../../Auth/customFetch';

const COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { day, testCount, approvalCount, rejectionSampleCount } = payload[0].payload;
        return (
            <div className="bg-white p-3 border-0 rounded-3 shadow-sm">
                <p className="mb-2 fw-bold">Day: {day}</p>
                <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                        <span>Tests:</span>
                        <span className="fw-bold" style={{ color: COLORS[0] }}>{testCount}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Approved:</span>
                        <span className="fw-bold" style={{ color: COLORS[1] }}>{approvalCount}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Rejected:</span>
                        <span className="fw-bold" style={{ color: COLORS[2] }}>{rejectionSampleCount}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function TestAscensionOverMonthOverYear() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const years = Array.from({ length: 10 }, (_, i) => currentYear - i)
        .map(yearVal => ({ value: yearVal, label: yearVal.toString() }));

    const handleYearChange = (selectedOption) => {
        setYear(selectedOption?.value || currentYear);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await customFetch(`ascension/analytics/month/year/cadr?month=${month}&&year=${year}`);
                const formattedData = result.map(item => ({
                    day: item.day,
                    testCount: item.test_count,
                    approvalCount: item.approval_count,
                    rejectionSampleCount: item.rejections_sample_count,
                }));
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [month, year]);

    const pieData = [
        { name: 'Test Count', value: data.reduce((acc, cur) => acc + cur.testCount, 0) },
        { name: 'Approval Count', value: data.reduce((acc, cur) => acc + cur.approvalCount, 0) },
        { name: 'Rejection Count', value: data.reduce((acc, cur) => acc + cur.rejectionSampleCount, 0) },
    ];

    return (
        <div className="text-capitalize my-3 pls-color">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-bold pls-label">Test Ascension Over Month and Year</h2>
                <div className="d-flex gap-3">
                    <div style={{ width: '150px' }}>
                        <Select
                            id="month-select"
                            options={monthOptions}
                            defaultValue={monthOptions.find(opt => opt.value === currentMonth)}
                            onChange={(selectedOption) => setMonth(selectedOption?.value || currentMonth)}
                            styles={reactSelectCustomStyles}
                            placeholder="Select Month"
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <Select
                            id="year-select"
                            options={years}
                            defaultValue={years.find(opt => opt.value === currentYear)}
                            onChange={handleYearChange}
                            styles={reactSelectCustomStyles}
                            placeholder="Select Year"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                    <div className="spinner">
                        <style jsx>{`
                            .spinner {
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                background: radial-gradient(farthest-side, ${COLORS[0]} 94%, transparent) top/9px 9px no-repeat,
                                            conic-gradient(transparent 30%, ${COLORS[0]});
                                -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 9px), #000 0);
                                animation: spinner 1s infinite linear;
                            }
                            @keyframes spinner {
                                100% {
                                    transform: rotate(1turn);
                                }
                            }
                        `}</style>
                    </div>
                </div>
            ) : error ? (
                <div className="p-3 bg-danger-subtle text-danger rounded">
                    Error: {error}
                </div>
            ) : (
                <div className='d-flex'>
                    <div className='col-6'>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="testCount" name="Tests" stackId="stack" fill={COLORS[0]} barSize={30} radius={[10, 10, 0, 0]} />
                                <Bar dataKey="approvalCount" name="Approved" stackId="stack" fill={COLORS[1]} barSize={30} radius={[10, 10, 0, 0]} />
                                <Bar dataKey="rejectionSampleCount" name="Rejected" stackId="stack" fill={COLORS[2]} barSize={30} radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="my-4 col-6">
                        <h3 className="fs-5 fw-bold text-center">Overall Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={50}
                                    label
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}