import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { currencyFormatter, customFetch, reactSelectCustomStyles } from '../../Auth/customFetch';
import styles from './AnalyticsSummaryCards.module.css';

interface MonthlyData {
    day: number;
    total_transactions: number;
    total_amount: string;
    total_paid: string;
    total_outstanding: string;
}

interface AnalyticsSummaryCardsProps {
    patientid: number;
}

export default function AnalyticsSummaryCards({ patientid }: AnalyticsSummaryCardsProps) {
    const [selectedYear, setSelectedYear] = useState({ value: new Date().getFullYear(), label: new Date().getFullYear().toString() });
    const [selectedMonth, setSelectedMonth] = useState({ value: new Date().getMonth() + 1, label: new Date().toLocaleString('default', { month: 'long' }) });
    const [data, setData] = useState<MonthlyData[]>([]);

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - 5 + i;
        return { value: year, label: year.toString() };
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2000, i).toLocaleString('default', { month: 'long' })
    }));

    const [isLoading, setIsLoading] = useState(true);

    const fetchMonthlyData = async () => {
        try {
            setIsLoading(true);
            const response = await customFetch(
                `patient/individual/analytics/monthly?patientid=${patientid}&&year=${selectedYear.value}&&month=${selectedMonth.value}`
            );
            if (response.status && response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch monthly data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedYear, selectedMonth]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`${styles.tooltip} pls-label`}>
                    <p className="mb-1">Day {payload[0].payload.day}</p>
                    <p className="mb-1">Transactions: {payload[0].payload.total_transactions}</p>
                    <p className="mb-1">Amount: {currencyFormatter.format(parseFloat(payload[0].payload.total_amount))}</p>
                    <p className="mb-1">Paid: {currencyFormatter.format(parseFloat(payload[0].payload.total_paid))}</p>
                    <p className="mb-0">Outstanding: {currencyFormatter.format(parseFloat(payload[0].payload.total_outstanding))}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <Card.Body>
                <div className="mb-4">
                    <h6 className="mb-1">Monthly Analytics</h6>
                    <small className="text-muted">
                        Daily transactions for {selectedMonth.label} {selectedYear.value}
                    </small>
                </div>

                <Row className="mb-4">
                    <Col xs={12} md="auto" className="ms-auto">
                        <Row className="g-2" style={{ maxWidth: '400px' }}>
                            <Col xs={6}>
                                <Select
                                    styles={reactSelectCustomStyles}
                                    value={selectedMonth}
                                    onChange={(option) => setSelectedMonth(option as any)}
                                    options={months}
                                    className="select-sm"
                                    classNamePrefix="select"
                                />
                            </Col>
                            <Col xs={6}>
                                <Select
                                    styles={reactSelectCustomStyles}
                                    value={selectedYear}
                                    onChange={(option) => setSelectedYear(option as any)}
                                    options={years}
                                    className="select-sm"
                                    classNamePrefix="select"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {isLoading && (<div className={styles.loadingContainer}>
                    <div className={styles.loadingBar}></div>
                    <p className={styles.loadingText}>Loading data...</p>
                </div>)}
                {!isLoading && (
                    <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={styles['chart-grid']}
                                opacity={0.4}
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="total_amount"
                                fill="hsl(217, 91%, 60%)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>)}

                <div className="d-flex justify-content-between mt-4">
                    <div className={styles.summaryStats}>
                        <div className={styles.statItem}>
                            <small className="text-muted d-block">Total Transactions</small>
                            <h5 className="mb-0">{data.reduce((sum, item) => sum + item.total_transactions, 0)}</h5>
                        </div>
                        <div className={styles.statItem}>
                            <small className="text-muted d-block">Total Amount</small>
                            <h5 className="mb-0">{currencyFormatter.format(data.reduce((sum, item) => sum + parseFloat(item.total_amount), 0))}</h5>
                        </div>
                        <div className={styles.statItem}>
                            <small className="text-muted d-block">Total Paid</small>
                            <h5 className="mb-0">{currencyFormatter.format(data.reduce((sum, item) => sum + parseFloat(item.total_paid), 0))}</h5>
                        </div>
                        <div className={styles.statItem}>
                            <small className="text-muted d-block">Outstanding</small>
                            <h5 className="mb-0">{currencyFormatter.format(data.reduce((sum, item) => sum + parseFloat(item.total_outstanding), 0))}</h5>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}