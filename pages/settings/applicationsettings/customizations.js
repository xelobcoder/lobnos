import React, { useState } from 'react';
import { Form, Row, Col, Button, Container } from 'react-bootstrap';
import Select from 'react-select';
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { currencies } from '../../../components/accessories/customizations/currencies';
import countryCurrencies from '../../../components/accessories/customizations/countriesCurrency';


const fontFamilyOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: '"Georgia", serif', label: 'Georgia' },
    { value: '"Verdana", sans-serif', label: 'Verdana' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: '"Impact", sans-serif', label: 'Impact' },
];

export default function ApplicationCustomizationClientLevel() {
    const [customization, setCustomization] = useState({
        currency: 'GHS',
        decimalPlaces: 3,
        fontFamily: '"Lexend Deca", Helvetica, Arial, sans-serif',
        headerColor: '',
        sidebarColor: '',
        backgroundColor: '',
        textColor: '',
        theme: "light",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomization({
            ...customization,
            [name]: value,
        });
    };

    const handleFontChange = (selectedOption) => {
        setCustomization({
            ...customization,
            fontFamily: selectedOption.value,
        });
    };

    const handleCurrencyChange = (selectedOption) => {
        setCustomization({
            ...customization,
            currency: selectedOption.isoCode,
        });
    };

    const handleThemeChange = (e) => {
        setCustomization({
            ...customization,
            theme: e.target.value,
        });
    };

    return (
        <MainSettingsLayoutView>
            <Container>
                <h5>Customization Settings</h5>
                <Form>
                    <Row className='bg-white p-2 br-5' >
                        <Form.Group className='grid-reg mt-2' controlId="decimalPlaces">
                            <Form.Label className='pls-label'>Decimal Places:</Form.Label>
                            <Form.Control
                                className='custom-input'
                                type="number"
                                name="decimalPlaces"
                                value={customization.decimalPlaces}
                                onChange={(ev) => { handleInputChange(ev) }}
                                placeholder="Enter number of decimal places"
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="currency">
                            <Form.Label className='pls-label'>
                                Currency:
                            </Form.Label>
                            <Select
                                options={countryCurrencies}
                                value={currencies.find(option => option.value === customization.currency)}
                                onChange={(newValue) => { console.log(newValue) }}
                                placeholder="Select Currency"
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.value}
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="fontFamily">
                            <Form.Label className='pls-label'>
                                Font Family:
                            </Form.Label>
                            <Select
                                options={fontFamilyOptions}
                                value={fontFamilyOptions.find(option => option.value === customization.fontFamily)}
                                onChange={handleFontChange}
                                placeholder="Select Font Family"
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="headerColor">
                            <Form.Label className='pls-label'>
                                Header Color:
                            </Form.Label>
                            <Form.Control
                                className='custom-input'
                                type="color"
                                name="headerColor"
                                value={customization.headerColor}
                                onChange={(ev) => { handleInputChange(ev) }}
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="sidebarColor">
                            <Form.Label className='pls-label'>
                                Sidebar Color:
                            </Form.Label>
                            <Form.Control
                                className='custom-input'
                                type="color"
                                name="sidebarColor"
                                value={customization.sidebarColor}
                                onChange={(ev) => { handleInputChange(ev) }}
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="backgroundColor">
                            <Form.Label className='pls-label'>
                                Background Color:
                            </Form.Label>
                            <Form.Control
                                className='custom-input'
                                type="color"
                                name="backgroundColor"
                                value={customization.backgroundColor}
                                onChange={(ev) => { handleInputChange(ev) }}
                            />
                        </Form.Group>
                        <Form.Group className='grid-reg mt-2' controlId="theme">
                            <Form.Label className='pls-label'>Theme:</Form.Label>
                            <Form.Control
                                className='custom-input' as="select" name="theme" value={customization.theme} onChange={handleThemeChange}>
                                <option value="light">
                                    Light
                                </option>
                                <option value="dark">
                                    Dark
                                </option>
                            </Form.Control>
                        </Form.Group>
                    </Row>
                    <Button variant="primary" className="mt-3">Save Settings</Button>
                </Form>

                <pre className="mt-4">{JSON.stringify(customization, null, 2)}</pre>
            </Container>
        </MainSettingsLayoutView>
    );
}
