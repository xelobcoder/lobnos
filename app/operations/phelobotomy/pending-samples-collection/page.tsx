"use client";
import React, { useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import PhelobotomyMainPageClientModule from '../../../../components/phelobotomy/ReceiveLabSampleModal/PhelobotomyMainPageClientModule';
import { Container, Alert, Button, Spinner } from 'react-bootstrap';

export default function PagePhelobotomy() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState({ 
        start_date: new Date().toISOString().split('T')[0], 
        end_date: new Date().toISOString().split('T')[0] 
    });

    const handleLoad = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `test/ascension/pendingCases?count=10&&page=1&&start_date=${selectedDate.start_date}&end_date=${selectedDate.end_date}`;
            const { result } = await customFetch(url);
            setData(Array.isArray(result) && result.length > 0 ? result : []);
        } catch (err) {
            setError("Failed to load pending cases. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-3 d-flex align-items-end gap-3">
                <div>
                    <label htmlFor="start-date" className="form-label">Start Date:</label>
                    <input
                        type="date"
                        id="start-date"
                        className="form-control"
                        value={selectedDate.start_date}
                        onChange={e => setSelectedDate({...selectedDate, start_date: e.target.value})}
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="form-label">End Date:</label>
                    <input
                        type="date"
                        id="end-date"
                        className="form-control"
                        value={selectedDate.end_date}
                        onChange={e => setSelectedDate({...selectedDate, end_date: e.target.value})}
                    />
                </div>
                <Button onClick={handleLoad} disabled={loading} variant="primary">
                    {loading ? <Spinner size="sm" animation="border" /> : "Load Samples"}
                </Button>
            </div>
            {error && (
                <Container className="mt-4 pls-color">
                    <Alert dismissible variant="danger" className='pls-color'>
                        {error}
                    </Alert>
                </Container>
            )}
            <PhelobotomyMainPageClientModule data={data} />
        </div>
    );
}