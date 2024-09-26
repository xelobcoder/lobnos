import React, { useEffect, useState } from 'react';
import { Table, Spinner, Card } from 'react-bootstrap';
import { customFetch } from '../../../Auth/customFetch'; // Assuming you have a custom fetch method

export default function PhelobotomistSummaryTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await customFetch('ascension/analytics/phelobotomist/summary');
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
        <Card className="my-2" style={{ border: 'none' }}>
            <Card.Header className='card-header bg-secondary-subtle br-0 bg-light fw-bold'>
                <h5 className="mb-0">Phlebotomist Summary</h5>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Scientist</th>
                                <th>Total Tests</th>
                                <th>Approved Tests</th>
                                <th>Unapproved Tests</th>
                                <th>Rejected Tests</th>
                                <th>Approval Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.Scientist}</td>
                                    <td>{item.total_tests}</td>
                                    <td>{item.approved_tests}</td>
                                    <td>{item.unapproved_tests}</td>
                                    <td>{item.rejected_tests}</td>
                                    <td>{item.approval_rate.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}
