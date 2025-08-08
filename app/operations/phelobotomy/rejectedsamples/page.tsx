"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import RejectedSamplesComponent from '../../../../components/samples/rejectedListView';
import { Container, Alert } from 'react-bootstrap';


export default function RejectedSamplesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(`rejected/sample/list?count=10&&page=1`);
                const { result } = response;
                setData(Array.isArray(result) ? result : []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load pending cases. Please try again later.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <Container className="mt-4 pls-color">Loading...</Container>;
    }
    if (error) {
        return <Container className="mt-4 pls-color">
            <Alert dismissible variant="danger" className='pls-color'>
                {error}
            </Alert>
        </Container>;
    }

    return <RejectedSamplesComponent data={data} />;
}
