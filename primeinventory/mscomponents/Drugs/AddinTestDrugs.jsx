import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';

export default function PLSMASTERDRUGSUPLOAD() {
    const [drugName, setDrugName] = useState('');
    const [sensitivity, setSensitivity] = useState('');
    const [concentration, setConcentration] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ drugName, sensitivity, concentration });
        setDrugName('');
        setSensitivity('');
        setConcentration('');
    };

    return (
        <MainSettingsLayoutView>
            <h5>Drugs for Culture and Sensitivity Test</h5>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3 d-flex justify-content-between">
                    <Form.Group as={Col} controlId="formDrugName">
                        <Form.Label>Drug Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter drug name"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formSensitivity">
                        <Form.Label>Sensitivity</Form.Label>
                        <Form.Select
                            value={sensitivity}
                            onChange={(e) => setSensitivity(e.target.value)}
                            required
                        >
                            <option value="">Select sensitivity</option>
                            <option value="Sensitive">Sensitive</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Resistant">Resistant</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} className="mb-3" controlId="formConcentration">
                        <Form.Label>Concentration</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter concentration"
                            value={concentration}
                            onChange={(e) => setConcentration(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label></Form.Label>
                        <br />
                        <Button variant="primary" type="submit">
                            Add Drug
                        </Button>
                    </Form.Group>
                </Row>
            </Form>
        </MainSettingsLayoutView>
    );
}
