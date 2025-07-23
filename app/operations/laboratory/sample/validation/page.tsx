import React from 'react'
import { customFetch } from '../../../../../components/Auth/customFetch'
import { Container, Alert } from 'react-bootstrap';
import SampleValidationComponent from '../../../../../components/samples/SampleValidationComponent'

export default async function Page() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const fetchInitialData = await customFetch(
            `sample/client/list/unvalidated?count=10&page=1&startDate=${today}&endDate=${today}&&sortby=DESC`
        );

        const { result } = fetchInitialData;
        if (result && Array.isArray(result)) {
            return (
                <SampleValidationComponent 
                    data={result}
                    initialStartDate={today}
                    initialEndDate={today}
                />
            );
        } else {
            return (
                <SampleValidationComponent 
                    data={[]}
                    initialStartDate={today}
                    initialEndDate={today}
                />
            )
        }

    } catch (err) {
        return (
            <Container>
                <Alert dismissible variant="danger" className='pls-color'>
                    Failed to load pending cases. Please try again later.
                </Alert>
            </Container >
        );
    }
}
