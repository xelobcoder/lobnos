import React from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import PhelobotomyMainPageClientModule from '../../../../components/phelobotomy/ReceiveLabSampleModal/PhelobotomyMainPageClientModule';
import { Container, Alert } from 'react-bootstrap';

export default async function PagePhelobotomy() {
    try {
        const { result } = await customFetch(`test/ascension/pendingCases?count=10&&page=1`);
        const data = Array.isArray(result) && result.length > 0 ? result : [];
        return (
            <div>
                <PhelobotomyMainPageClientModule data={data} />
            </div>
        );
    } catch (err) {
        return (
            <Container className="mt-4 pls-color">
                <Alert dismissible variant="danger" className='pls-color'>
                    Failed to load pending cases. Please try again later.
                </Alert>
            </Container>
        );
    }
}