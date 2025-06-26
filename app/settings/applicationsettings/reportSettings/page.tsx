"use client"
import React, { useState } from 'react';
import { Form, Button, Col, Row, Card, Container } from 'react-bootstrap';

const SettingsForm = () => {
    const [data, setData] = useState({
        "id": 102040,
        "paperSize": "A4",
        "headerFlag": 0,
        "headerHeight": 120,
        "footerFlag": 0,
        "footerHeight": 105,
        "primarySignPosition": 1,
        "signHeight": 100,
        "fontSize": 10,
        "template_text":"",
        "fontFamily": "Verdana",
        "nameFlag": 1,
        "ageFlag": 1,
        "registrationFlag": 1,
        "referringDocFlag": 1,
        "sampleIdFlag": 1,
        "reportIdFlag": 0,
        "sampleDateFlag": 1,
        "reportDateFlag": 1,
        "floatingSignature": 0,
        "isDefault": 1,
        "registeredBy": 0,
        "reportedBy": 0,
        "endOfReportFlag": 1,
        "endOfReportText": "**END OF REPORT**",
        "hideReportName": 0,
        "templateName": "testPdf.jinja",
        "spacing": "1pt 0 0 0",
        "showhr": 1,
        "templateBar": "Test Description,Value(s),Reference Range",
        "sourceFlag": 0,
        "printDateFlag": 0,
        "labCodeFlag": 0,
        "HPEFlag": 0,
        "dateFormat": "M d, Y, h:i a",
        "paperMargin": 20,
        "categoryPDFs": 0,
        "minApprovals": 1,
        "maxApprovals": 2,
        "patientFrame": 125,
        "calculatedAgeFlag": 1,
        "pageNumberFlag": 1,
        "pageNumberX": 519,
        "pageNumberY": 13,
        "name": "Default Report Setting",
        "isDisable": 0,
        "watermarkImg": "-",
        "watermarkImgWidth": 500,
        "watermarkImgHeight": 500,
        "watermarkImgFlag": 1,
        "accreditation_logo": "-",
        "hide_demographics_lastpage": false,
        "content_template": "-",
        "qr_enable": false,
        "accreditation_height": 70,
        "is_db_template": 0,
    });

    // Add handler for input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? parseFloat(value) : value;
        setData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleSwitchChange = (key) => {
        setData(prevData => ({
            ...prevData,
            [key]: typeof prevData[key] === 'boolean' 
                ? !prevData[key] 
                : (prevData[key] === 1 ? 0 : 1)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted!", data);
    };

    return (
        <Container fluid className="p-4">
            <h4 className="mb-4">Report Settings</h4>
            <Form onSubmit={handleSubmit}>
                <Row>
                    {/* Left Column */}
                    <Col lg={6}>
                        {/* General Settings Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">General Settings</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formName">
                                            <Form.Label className="pls-label">Name</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                name="name"
                                                value={data.name} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formId">
                                            <Form.Label className="pls-label">ID</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                value={data.id} 
                                                readOnly 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPaperSize">
                                            <Form.Label className="pls-label">Paper Size</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                name="paperSize"
                                                value={data.paperSize} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPaperMargin">
                                            <Form.Label className="pls-label">Paper Margin (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="paperMargin"
                                                value={data.paperMargin} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formFontFamily">
                                            <Form.Label className="pls-label">Font Family</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                name="fontFamily"
                                                value={data.fontFamily} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formFontSize">
                                            <Form.Label className="pls-label">Font Size</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="fontSize"
                                                value={data.fontSize} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Page Layout Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Page Layout</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formHeaderHeight">
                                            <Form.Label className="pls-label">Header Height (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="headerHeight"
                                                value={data.headerHeight} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="headerFlagSwitch"
                                                label="Show Header"
                                                checked={data.headerFlag === 1}
                                                onChange={() => handleSwitchChange('headerFlag')}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formFooterHeight">
                                            <Form.Label className="pls-label">Footer Height (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="footerHeight"
                                                value={data.footerHeight} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="footerFlagSwitch"
                                                label="Show Footer"
                                                checked={data.footerFlag === 1}
                                                onChange={() => handleSwitchChange('footerFlag')}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPatientFrame">
                                            <Form.Label className="pls-label">Patient Frame Height (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="patientFrame"
                                                value={data.patientFrame} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formSpacing">
                                            <Form.Label className="pls-label">Spacing</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                name="spacing"
                                                value={data.spacing} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Signature Settings Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Signature Settings</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPrimarySignPosition">
                                            <Form.Label className="pls-label">Primary Sign Position</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="primarySignPosition"
                                                value={data.primarySignPosition} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formSignHeight">
                                            <Form.Label className="pls-label">Signature Height (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="signHeight"
                                                value={data.signHeight} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3 d-flex align-items-center">
                                    <Form.Check 
                                        type="switch"
                                        id="floatingSignatureSwitch"
                                        label="Floating Signature"
                                        checked={data.floatingSignature === 1}
                                        onChange={() => handleSwitchChange('floatingSignature')}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column */}
                    <Col lg={6}>
                        {/* Display Options Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Display Options</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="nameFlag"
                                                label="Show Patient Name"
                                                checked={data.nameFlag === 1}
                                                onChange={() => handleSwitchChange('nameFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="ageFlag"
                                                label="Show Patient Age"
                                                checked={data.ageFlag === 1}
                                                onChange={() => handleSwitchChange('ageFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="calculatedAgeFlag"
                                                label="Show Calculated Age"
                                                checked={data.calculatedAgeFlag === 1}
                                                onChange={() => handleSwitchChange('calculatedAgeFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="registrationFlag"
                                                label="Show Registration #"
                                                checked={data.registrationFlag === 1}
                                                onChange={() => handleSwitchChange('registrationFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="referringDocFlag"
                                                label="Show Referring Doctor"
                                                checked={data.referringDocFlag === 1}
                                                onChange={() => handleSwitchChange('referringDocFlag')}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="sampleIdFlag"
                                                label="Show Sample ID"
                                                checked={data.sampleIdFlag === 1}
                                                onChange={() => handleSwitchChange('sampleIdFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="reportIdFlag"
                                                label="Show Report ID"
                                                checked={data.reportIdFlag === 1}
                                                onChange={() => handleSwitchChange('reportIdFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="sampleDateFlag"
                                                label="Show Sample Date"
                                                checked={data.sampleDateFlag === 1}
                                                onChange={() => handleSwitchChange('sampleDateFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="reportDateFlag"
                                                label="Show Report Date"
                                                checked={data.reportDateFlag === 1}
                                                onChange={() => handleSwitchChange('reportDateFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="hideReportName"
                                                label="Hide Report Name"
                                                checked={data.hideReportName === 1}
                                                onChange={() => handleSwitchChange('hideReportName')}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Additional Options Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Additional Options</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="endOfReportFlag"
                                                label="Show End Of Report"
                                                checked={data.endOfReportFlag === 1}
                                                onChange={() => handleSwitchChange('endOfReportFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="formEndOfReportText">
                                            <Form.Label className="pls-label">End Of Report Text</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="text" 
                                                name="endOfReportText"
                                                value={data.endOfReportText} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="pageNumberFlag"
                                                label="Show Page Numbers"
                                                checked={data.pageNumberFlag === 1}
                                                onChange={() => handleSwitchChange('pageNumberFlag')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="formPageNumberX">
                                            <Form.Label className="pls-label">Page Number X Position</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="pageNumberX"
                                                value={data.pageNumberX} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="formPageNumberY">
                                            <Form.Label className="pls-label">Page Number Y Position</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="pageNumberY"
                                                value={data.pageNumberY} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Watermark Settings Card */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Watermark Settings</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3 d-flex align-items-center">
                                    <Form.Check 
                                        type="switch"
                                        id="watermarkImgFlag"
                                        label="Enable Watermark"
                                        checked={data.watermarkImgFlag === 1}
                                        onChange={() => handleSwitchChange('watermarkImgFlag')}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formWatermarkImg">
                                    <Form.Label className="pls-label">Watermark Image Path</Form.Label>
                                    <Form.Control 
                                        className="custom-input" 
                                        type="text" 
                                        name="watermarkImg"
                                        value={data.watermarkImg} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formWatermarkImgWidth">
                                            <Form.Label className="pls-label">Width (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="watermarkImgWidth"
                                                value={data.watermarkImgWidth} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formWatermarkImgHeight">
                                            <Form.Label className="pls-label">Height (px)</Form.Label>
                                            <Form.Control 
                                                className="custom-input" 
                                                type="number" 
                                                name="watermarkImgHeight"
                                                value={data.watermarkImgHeight} 
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit" size="lg">
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default SettingsForm;
