import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Card } from 'react-bootstrap';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { customFetch } from '../../../Auth/customFetch';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { day, testCount, approvalCount, rejectionSampleCount } = payload[0].payload;
        return (
            <div className="list-group br-5">
                <div className='bg-secondary-subtle list-group-item text-sm'>Day of the month:{day}</div>
                <div className=' list-group-item pls-color'>
                    <p>Test Count:{testCount}</p>
                    <p>Approval Count:{approvalCount}</p>
                    <p>Rejection Sample Count: {rejectionSampleCount}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function TestAscensionOverMonthOverYear() {
    const [month, setMonth] = useState(9);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
        .map(year => ({ value: year, label: year.toString() }));

    const handleYearChange = (selectedOption) => {
        setYear(selectedOption?.value || new Date().getFullYear());
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month, year]);

    return (
        <Card className="br-5 bg-body-secondary my-3" style={{ border: 'none' }}>
            <Card.Header className='d-flex p-1'>
                <div className='mx-3 col-3'>
                    Test Ascension Over Month and Year
                </div>
                <div className="d-flex justify-content-between mt-3 col-7">
                    <div className='col-5 mx-1'>
                        <Select
                            id="month-select"
                            options={monthOptions}
                            defaultValue={monthOptions[8]}
                            onChange={(selectedOption) => setMonth(selectedOption?.value || 9)}
                            placeholder="Select Month"
                        />
                    </div>
                    <div className='col-6'>
                        <Select
                            id="year-select"
                            options={years}
                            defaultValue={years[0]}
                            onChange={handleYearChange}
                            placeholder="Select Year"
                        />
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data}>
                            <XAxis dataKey={'day'} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="testCount" stackId="a" fill="#99BFFF" />
                            <Bar dataKey="approvalCount" stackId="a" fill="#0F47FF" />
                            <Bar dataKey="rejectionSampleCount" stackId="a" fill="#83FF9A" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
}
