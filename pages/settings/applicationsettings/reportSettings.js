import React, { useState } from 'react';
import { Form, Button, Col, Row, Table, Container } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

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

    const handleSwitchChange = (key) => {
        setData(prevData => ({
            ...prevData,
            [key]: prevData[key] === 1 ? 0 : 1
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted!", data);
    };

    return (
        <MainSettingsLayoutView>
            <Container>
                <Form onSubmit={handleSubmit}>
                    <Table style={{ width: '50%' }} className='table mx-4 billing-cart-table'>
                        <thead>
                            <tr>
                                <th>Setting</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Header Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.headerFlag === 1}
                                        onChange={() => handleSwitchChange('headerFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Footer Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.footerFlag === 1}
                                        onChange={() => handleSwitchChange('footerFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Floating Signature</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.floatingSignature === 1}
                                        onChange={() => handleSwitchChange('floatingSignature')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Is Default</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '20px' }}
                                        checked={data.isDefault === 1}
                                        onChange={() => handleSwitchChange('isDefault')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Source Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.sourceFlag === 1}
                                        onChange={() => handleSwitchChange('sourceFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Print Date Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.printDateFlag === 1}
                                        onChange={() => handleSwitchChange('printDateFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Lab Code Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.labCodeFlag === 1}
                                        onChange={() => handleSwitchChange('labCodeFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>HPE Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.HPEFlag === 1}
                                        onChange={() => handleSwitchChange('HPEFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Hide Demographics Last Page</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.hide_demographics_lastpage}
                                        onChange={() => handleSwitchChange('hide_demographics_lastpage')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>QR Enable</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.qr_enable}
                                        onChange={() => handleSwitchChange('qr_enable')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Is DB Template</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.is_db_template === 1}
                                        onChange={() => handleSwitchChange('is_db_template')}
                                        label=""
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Watermark Image Flag</td>
                                <td>
                                    <Form.Switch
                                        style={{ fontSize: '24px' }}
                                        checked={data.watermarkImgFlag === 1}
                                        onChange={() => handleSwitchChange('watermarkImgFlag')}
                                        label=""
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <div className='mx-3 grid-100' style={{ width: '50%' }}>
                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formName">
                            <Form.Label className='pls-label '>Name</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.name} />
                            </Col>
                        </Form.Group>

                        <Form.Group className=' mx-1 grid-30-70 my-2' controlId="formId">
                            <Form.Label className='pls-label '>ID</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" value={data.id} readOnly />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formPaperSize">
                            <Form.Label className='pls-label '>Paper Size</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.paperSize} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formHeaderHeight">
                            <Form.Label className='pls-label '>Header Height</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.headerHeight} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formFooterHeight">
                            <Form.Label className='pls-label '>Footer Height</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.footerHeight} />
                            </Col>
                        </Form.Group>


                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formSpacing">
                            <Form.Label className='pls-label '>Spacing</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.spacing} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formTemplateName">
                            <Form.Label className='pls-label '>Template Name</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.templateName} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formDateFormat">
                            <Form.Label className='pls-label '>Date Format</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.dateFormat} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formPaperMargin">
                            <Form.Label className='pls-label '>Paper Margin</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.paperMargin} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formMinApprovals">
                            <Form.Label className='pls-label '>Min Approvals</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.minApprovals} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formMaxApprovals">
                            <Form.Label className='pls-label '>Max Approvals</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.maxApprovals} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formPatientFrame">
                            <Form.Label className='pls-label '>Patient Frame</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.patientFrame} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formPageNumberX">
                            <Form.Label className='pls-label '>Page Number X</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.pageNumberX} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formPageNumberY">
                            <Form.Label className='pls-label '>Page Number Y</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.pageNumberY} />
                            </Col>
                        </Form.Group>


                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formWatermarkImg">
                            <Form.Label className='pls-label '>Watermark Image</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.watermarkImg} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formWatermarkImgWidth">
                            <Form.Label className='pls-label '>Watermark Image Width</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.watermarkImgWidth} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formWatermarkImgHeight">
                            <Form.Label className='pls-label '>Watermark Image Height</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.watermarkImgHeight} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formAccreditationLogo">
                            <Form.Label className='pls-label '>Accreditation Logo</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.accreditation_logo} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formContentTemplate">
                            <Form.Label className='pls-label '>Content Template</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.content_template} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formAccreditationHeight">
                            <Form.Label className='pls-label '>Accreditation Height</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="number" defaultValue={data.accreditation_height} />
                            </Col>
                        </Form.Group>

                        <Form.Group className='  mx-1 grid-30-70 my-2' controlId="formTemplateText">
                            <Form.Label className='pls-label '>Template Text</Form.Label>
                            <Col >
                                <Form.Control className='custom-input' type="text" defaultValue={data.template_text} />
                            </Col>
                        </Form.Group>
                    </div>

                    <div className='mx-4'>
                        <Button variant="primary" type="submit" className='btn btn-sm'>
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Container>
        </MainSettingsLayoutView>
    );
};

export default SettingsForm;
