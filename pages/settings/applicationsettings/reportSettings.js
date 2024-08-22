// components/SettingsForm.js
import React from 'react';
import { Form, Button, Col, Row, Container } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

const SettingsForm = () => {
    // Define the data object directly in the component for demonstration
    const data = {
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
        "template_text": "",
        "labForId": 9569
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic
        console.log("Form submitted!");
    };

    return (
        <MainSettingsLayoutView>
            <Container>
                <Form onSubmit={handleSubmit} className='grid-30-30-30'>
                    <Form.Group className='d-flex justify-content-between'  controlId="formId">
                        <div> <Form.Label className='pls-label' >ID</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" value={data.id} readOnly />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPaperSize">
                        <div> <Form.Label className='pls-label' >Paper Size</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.paperSize} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formHeaderFlag">
                        <div> <Form.Label className='pls-label' >Header Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.headerFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formHeaderHeight">
                        <div> <Form.Label className='pls-label' >Header Height</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.headerHeight} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formFooterFlag">
                        <div> <Form.Label className='pls-label' >Footer Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.footerFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formFooterHeight">
                        <div> <Form.Label className='pls-label' >Footer Height</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.footerHeight} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPrimarySignPosition">
                        <div> <Form.Label className='pls-label' >Primary Sign Position</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.primarySignPosition} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formSignHeight">
                        <div> <Form.Label className='pls-label' >Sign Height</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.signHeight} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formFontSize">
                        <div> <Form.Label className='pls-label' >Font Size</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.fontSize} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formFontFamily">
                        <div> <Form.Label className='pls-label' >Font Family</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.fontFamily} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formNameFlag">
                        <div> <Form.Label className='pls-label' >Name Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.nameFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formAgeFlag">
                        <div> <Form.Label className='pls-label' >Age Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.ageFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formRegistrationFlag">
                        <div> <Form.Label className='pls-label' >Registration Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.registrationFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formReferringDocFlag">
                        <div> <Form.Label className='pls-label' >Referring Doc Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.referringDocFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formSampleIdFlag">
                        <div> <Form.Label className='pls-label' >Sample ID Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.sampleIdFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formReportIdFlag">
                        <div> <Form.Label className='pls-label' >Report ID Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.reportIdFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formSampleDateFlag">
                        <div> <Form.Label className='pls-label' >Sample Date Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.sampleDateFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formReportDateFlag">
                        <div> <Form.Label className='pls-label' >Report Date Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.reportDateFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formFloatingSignature">
                        <div> <Form.Label className='pls-label' >Floating Signature</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.floatingSignature} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formIsDefault">
                        <div> <Form.Label className='pls-label' >Is Default</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.isDefault} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formRegisteredBy">
                        <div> <Form.Label className='pls-label' >Registered By</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.registeredBy} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formReportedBy">
                        <div> <Form.Label className='pls-label' >Reported By</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.reportedBy} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formEndOfReportFlag">
                        <div> <Form.Label className='pls-label' >End Of Report Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.endOfReportFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formEndOfReportText">
                        <div> <Form.Label className='pls-label' >End Of Report Text</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.endOfReportText} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formHideReportName">
                        <div> <Form.Label className='pls-label' >Hide Report Name</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.hideReportName} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formTemplateName">
                        <div> <Form.Label className='pls-label' >Template Name</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.templateName} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formSpacing">
                        <div> <Form.Label className='pls-label' >Spacing</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.spacing} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formShowhr">
                        <div> <Form.Label className='pls-label' >Show HR</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.showhr} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formTemplateBar">
                        <div> <Form.Label className='pls-label' >Template Bar</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.templateBar} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formSourceFlag">
                        <div> <Form.Label className='pls-label' >Source Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.sourceFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPrintDateFlag">
                        <div> <Form.Label className='pls-label' >Print Date Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.printDateFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formLabCodeFlag">
                        <div> <Form.Label className='pls-label' >Lab Code Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.labCodeFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formHPEFlag">
                        <div> <Form.Label className='pls-label' >HPE Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.HPEFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formDateFormat">
                        <div> <Form.Label className='pls-label' >Date Format</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.dateFormat} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPaperMargin">
                        <div> <Form.Label className='pls-label' >Paper Margin</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.paperMargin} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formCategoryPDFs">
                        <div> <Form.Label className='pls-label' >Category PDFs</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.categoryPDFs} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formMinApprovals">
                        <div> <Form.Label className='pls-label' >Min Approvals</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.minApprovals} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formMaxApprovals">
                        <div> <Form.Label className='pls-label' >Max Approvals</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.maxApprovals} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPatientFrame">
                        <div> <Form.Label className='pls-label' >Patient Frame</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.patientFrame} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formCalculatedAgeFlag">
                        <div> <Form.Label className='pls-label' >Calculated Age Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.calculatedAgeFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPageNumberFlag">
                        <div> <Form.Label className='pls-label' >Page Number Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.pageNumberFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPageNumberX">
                        <div> <Form.Label className='pls-label' >Page Number X</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.pageNumberX} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formPageNumberY">
                        <div> <Form.Label className='pls-label' >Page Number Y</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.pageNumberY} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formName">
                        <div> <Form.Label className='pls-label' >Name</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.name} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formIsDisable">
                        <div> <Form.Label className='pls-label' >Is Disable</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.isDisable} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formWatermarkImg">
                        <div> <Form.Label className='pls-label' >Watermark Image</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.watermarkImg} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formWatermarkImgWidth">
                        <div> <Form.Label className='pls-label' >Watermark Image Width</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.watermarkImgWidth} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formWatermarkImgHeight">
                        <div> <Form.Label className='pls-label' >Watermark Image Height</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.watermarkImgHeight} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formWatermarkImgFlag">
                        <div> <Form.Label className='pls-label' >Watermark Image Flag</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.watermarkImgFlag} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formAccreditationLogo">
                        <div> <Form.Label className='pls-label' >Accreditation Logo</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.accreditation_logo} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formHideDemographicsLastPage">
                        <div> <Form.Label className='pls-label' >Hide Demographics Last Page</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="checkbox" defaultChecked={data.hide_demographics_lastpage} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formContentTemplate">
                        <div> <Form.Label className='pls-label' >Content Template</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.content_template} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formQrEnable">
                        <div> <Form.Label className='pls-label' >QR Enable</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="checkbox" defaultChecked={data.qr_enable} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formAccreditationHeight">
                        <div> <Form.Label className='pls-label' >Accreditation Height</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.accreditation_height} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formIsDbTemplate">
                        <div> <Form.Label className='pls-label' >Is DB Template</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.is_db_template} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formTemplateText">
                        <div> <Form.Label className='pls-label' >Template Text</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="text" defaultValue={data.template_text} />
                        </div>
                    </Form.Group>

                    <Form.Group className='d-flex justify-content-between'  controlId="formLabForId">
                        <div> <Form.Label className='pls-label' >Lab For ID</Form.Label></div>
                        <div>
                            <Form.Control className='custom-input' type="number" defaultValue={data.labForId} />
                        </div>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                </Form>
            </Container>
        </MainSettingsLayoutView>
    );
};

export default SettingsForm;
