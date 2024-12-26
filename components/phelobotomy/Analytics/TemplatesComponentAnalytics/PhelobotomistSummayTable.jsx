import React, { useEffect, useState } from 'react';
import { Table, Spinner, Card } from 'react-bootstrap';
import { customFetch } from '../../../Auth/customFetch';
import style from '../../../../styles/SmsTemplateList.module.css'

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

    if (loading) {
        return <div className="text-center">
            <Spinner animation="border" />
        </div>
    }

    return (
        <Card className="my-2" style={{ border: 'none' }}>
            <Card.Header className='card-header bg-secondary-subtle br-0 bg-light fw-bold'>
                <h5 className="mb-0">Phlebotomist Summary</h5>
            </Card.Header>
            <Card.Body>
                <table className={style.table}>
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
                </table>
            </Card.Body>
        </Card>
    );
}
