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
    LabelList,
} from 'recharts';
import { customFetch } from '../../../Auth/customFetch';

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
        <Card className="br-0 heightedBorder" style={{ border: 'none' }}>
            <Card.Header className='d-flex p-1'>
                <div className='mt-4 mx-3'>
                    Test Ascension Over Month and Year
                </div>
                <div className="d-flex justify-content-between mt-3 col-7">
                    <div className='col-6 mx-1'>
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
                    <div>
                        <div>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={data}>
                                    <XAxis dataKey={'day'} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="testCount" stackId="a" fill="#f70776">
                                        {/* <LabelList dataKey="testCount" position="top" /> */}
                                    </Bar>
                                    <Bar dataKey="approvalCount" stackId="a" fill="#c3195d">
                                        {/* <LabelList dataKey="approvalCount" position="top" /> */}
                                    </Bar>
                                    <Bar dataKey="rejectionSampleCount" stackId="a" fill="#680747">
                                        {/* <LabelList dataKey="rejectionSampleCount" position="top" /> */}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>

                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
