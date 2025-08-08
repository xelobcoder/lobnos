
"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { Container, Alert } from 'react-bootstrap';
import SampleValidationComponent from '../../../../../components/samples/SampleValidationComponent';

export default function Page() {
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function fetchData() {
            try {
                const fetchInitialData = await customFetch(
                    `sample/client/list/unvalidated?count=10&page=1&startDate=${today}&endDate=${today}&&sortby=DESC`
                );
                const { result } = fetchInitialData;
                if (result && Array.isArray(result)) {
                    setData(result);
                } else {
                    setData([]);
                }
            } catch (err) {
                setError(true);
            }
        }
        fetchData();
    }, [today]);

    if (error) {
        return (
            <Container>
                <Alert dismissible variant="danger" className='pls-color'>
                    Failed to load pending cases. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <SampleValidationComponent
            data={data}
            initialStartDate={today}
            initialEndDate={today}
        />
    );
}
