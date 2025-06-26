"use client";
import React, { useState } from 'react';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const CaseCountAreaChart = ({ data }) => {
    const [chart, setChart] = useState(1);

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return (
        <Container className="my-4">
            <Row className="">
                <Col md={4} xs={12}>
                    <Form.Group controlId="chartTypeSelect">
                        <Form.Control
                            as="select"
                            className='custom-input'
                            value={chart}
                            onChange={(e) => setChart(Number(e.target.value))}
                        >
                            <option value={1}>Bar Chart</option>
                            <option value={2}>Line Chart</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>

            {chart === 1 && (
                <div>
                    <h5 className="text-center mb-4">Month Case Count - Bar Chart Daily Cases For current month</h5>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis tick={{ fontSize: 12 }} dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="caseCount" fill="#4285F4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {chart === 2 && (
                <div>
                    <h5 className="text-center mb-4">Month Case Count - Line Chart</h5>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis tick={{ fontSize: 12 }} dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="caseCount" stroke="#4285F4" fill="#4285F4" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <h6 className="text-center font-weight-bold mb-3">Data Table: Monthly Case Count</h6>
            <Table bordered responsive>
                <thead>
                    <tr className="table-light">
                        <th className='text-center'>Month</th>
                        <th className='text-center'>Case Count</th>
                        <th className='text-center'>Percentage Change</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(data) && data.length>  0 && data.map((entry, index) => {
                        const previousEntry = index > 0 ? data[index - 1] : null;
                        const percentageChange = previousEntry ? calculatePercentageChange(entry.caseCount, previousEntry.caseCount) : 0;

                        const changeColor = percentageChange > 0 ? "text-success" :
                            percentageChange < 0 ? "text-danger" : "text-muted";

                        return (
                            <tr key={entry.day}>
                                <td className='text-center'>{entry.day}</td>
                                <td className='text-center'>{entry.caseCount}</td>
                                <td className={`text-center ${changeColor}`}>
                                    {percentageChange !== 0 ? `${percentageChange.toFixed(2)}%` : "-"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Container>
    );
};

export default CaseCountAreaChart;
