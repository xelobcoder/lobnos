import React, { useState, useEffect } from 'react';
import { Form, Button, Col, InputGroup, Container, Table } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

const store = {
    result: {
        resultLockAfter24Hours: 0,
        isPinOnResultEntry: 0,
        isPinOnResultViewAfter24Hours: 0,
        maximumResultValidation: 0,
        minimumResultValidation: 0,
        staffQualifiedToValidationResult: [],
        showPastTestResult: 0,
        allowScientistViewAudit: 0,
        showTaTAnalysis: 0,
        encryptResultAfter24Hours: 0,
        sendLoginEmailNotificationAfterResultEdit: 0,
        monitorForCriticalValues: 0,
        notifyClientOnResultReady: 0,
        notificationType: 'Email'
    }
};

const ResultSettingsForm = () => {
    const [formData, setFormData] = useState({
        resultLockAfter24Hours: store?.result?.resultLockAfter24Hours || 0,
        isPinOnResultEntry: store?.result?.isPinOnResultEntry || 0,
        isPinOnResultViewAfter24Hours: store?.result?.isPinOnResultViewAfter24Hours || 0,
        maximumResultValidation: store?.result?.maximumResultValidation || 0,
        minimumResultValidation: store?.result?.minimumResultValidation || 0,
        staffQualifiedToValidationResult: store?.result?.staffQualifiedToValidationResult || [],
        showPastTestResult: store?.result?.showPastTestResult || 0,
        allowScientistViewAudit: store?.result?.allowScientistViewAudit || 0,
        showTaTAnalysis: store?.result?.showTaTAnalysis || 0,
        encryptResultAfter24Hours: store?.result?.encryptResultAfter24Hours || 0,
        sendLoginEmailNotificationAfterResultEdit: store?.result?.sendLoginEmailNotificationAfterResultEdit || 0,
        monitorForCriticalValues: store?.result?.monitorForCriticalValues || 0,
        notifyClientOnResultReady: store?.result?.notifyClientOnResultReady || 0,
        notificationType: store?.result?.notificationType || 'Email'
    });

    useEffect(() => {
     
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const handleArrayChange = (index, value) => {
        const newArray = [...formData.staffQualifiedToValidationResult];
        newArray[index] = parseInt(value, 10);
        setFormData(prevData => ({
            ...prevData,
            staffQualifiedToValidationResult: newArray,
        }));
    };

    const addStaffIDField = () => {
        setFormData(prevData => ({
            ...prevData,
            staffQualifiedToValidationResult: [...prevData.staffQualifiedToValidationResult, prevData.staffQualifiedToValidationResult.length + 1],
        }));
    };

    const removeStaffIDField = (index) => {
        setFormData(prevData => {
            const newArray = prevData.staffQualifiedToValidationResult.filter((_, i) => i !== index);
            return { ...prevData, staffQualifiedToValidationResult: newArray };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(JSON.stringify(formData))
    };

    return (
        <MainSettingsLayoutView>
            <Container>
                <Form onSubmit={handleSubmit}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Setting</th>
                                <th>Action Enabled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: 'resultLockAfter24Hours', label: 'Lock Result After 24 Hours' },
                                { id: 'isPinOnResultEntry', label: 'PIN Required on Result Entry' },
                                { id: 'isPinOnResultViewAfter24Hours', label: 'PIN Required on Result View After 24 Hours' },
                                { id: 'showPastTestResult', label: 'Show Past Test Results' },
                                { id: 'allowScientistViewAudit', label: 'Allow Scientist View Audit' },
                                { id: 'showTaTAnalysis', label: 'Show TaT Analysis' },
                                { id: 'encryptResultAfter24Hours', label: 'Encrypt Result After 24 Hours' },
                                { id: 'sendLoginEmailNotificationAfterResultEdit', label: 'Send Login Email Notification After Result Edit' },
                                { id: 'monitorForCriticalValues', label: 'Monitor for Critical Values' },
                                { id: 'notifyClientOnResultReady', label: 'Notify Client on Result Ready' }
                            ].map(({ id, label }) => (
                                <tr key={id}>
                                    <td className='p-3 pls-label'>{label}</td>
                                    <td className='p-3'>
                                        <Form.Check
                                            type="switch"
                                            style={{fontSize:'24px'}}
                                            id={`${id}Switch`}
                                            name={id}
                                            checked={formData[id] === 1}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Form.Group controlId="maximumResultValidation">
                        <Form.Label className='pls-label' column sm={4}>Maximum Result Validation</Form.Label>
                        <Col sm={8}>
                            <Form.Control
                                className='custom-input'
                                type="number"
                                name="maximumResultValidation"
                                value={formData.maximumResultValidation}
                                onChange={handleChange} />
                        </Col>
                    </Form.Group>

                    <Form.Group controlId="minimumResultValidation">
                        <Form.Label className='pls-label' column sm={4}>Minimum Result Validation</Form.Label>
                        <Col sm={8}>
                            <Form.Control
                                className='custom-input'
                                type="number"
                                name="minimumResultValidation"
                                value={formData.minimumResultValidation}
                                onChange={handleChange} />
                        </Col>
                    </Form.Group>

                    <Form.Group controlId="staffQualifiedToValidationResult">
                        <Form.Label className='pls-label' column sm={4}>Staff Qualified for Validation Result</Form.Label>
                        <Col sm={8}>
                            {formData.staffQualifiedToValidationResult.map((id, index) => (
                                <InputGroup className="mb-2" key={index}>
                                    <Form.Control
                                        className='custom-input'
                                        type="number"
                                        value={id}
                                        onChange={(e) => handleArrayChange(index, e.target.value)}
                                        placeholder={`Staff ID ${index + 1}`} />
                                    <Button variant="outline-danger" className='btn-sm border-2' onClick={() => removeStaffIDField(index)}>Remove</Button>
                                </InputGroup>
                            ))}
                            <Button variant="link" className='btn-sm' onClick={addStaffIDField}>
                                Add Staff ID
                            </Button>
                        </Col>
                    </Form.Group>

                    <Form.Group controlId="notificationType">
                        <Form.Label className='pls-label' column sm={4}>Notification Type</Form.Label>
                        <Col sm={8}>
                            <Form.Control
                                as="select"
                                name="notificationType"
                                value={formData.notificationType}
                                onChange={handleChange}
                            >
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Button variant="primary" className='mt-2 btn-sm' type="submit">
                        Save Settings
                    </Button>
                </Form>
            </Container>
        </MainSettingsLayoutView>
    );
};

export default ResultSettingsForm;
