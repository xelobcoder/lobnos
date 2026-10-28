"use client"

import React, { useEffect, useState } from 'react';
import { Form, Row, Button, Container } from 'react-bootstrap';
import Select from 'react-select';
import { currencies } from '../../../../components/accessories/customizations/currencies';
import { customPost, reactSelectCustomStyles } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { applyApplicationSettingsToDocument, availableFonts, DEFAULT_FONT_FAMILY, normalizeFontFamily } from '../../../../lib/themes';
import { toast } from 'react-toastify';

const fontFamilyOptions = availableFonts.map(({ name, value }) => ({ value, label: name }));

export default function ApplicationCustomizationClientLevel() {
     const { applicationsettings, setApplicationSettings } = useApplicationSettings();
     const [hasLoaded, setHasLoaded] = useState(false);
     const [isSaving, setIsSaving] = useState(false);
     const [customization, setCustomization] = useState({
          currency: 'GHS',
          decimalPlaces: 3,
          fontFamily: DEFAULT_FONT_FAMILY,
          fontsize: '15px',
          headerColor: '#ffffff',
          sidebarColor: '#27ae60',
          backgroundColor: '#f8f9fa',
          headerTextColor: '#2c3e50',
          sidebarTextColor: '#ffffff',
          primaryColor: '#27ae60',
          secondaryColor: '#6c757d',
          textColor: '#212529',
     });

     useEffect(() => setHasLoaded(true), []);

     useEffect(() => {
          const settings = applicationsettings?.settings;
          if (!settings) return;
          setCustomization((current) => ({
               ...current,
               fontFamily: normalizeFontFamily(settings.fontFamily || current.fontFamily),
               fontsize: settings.fontsize || current.fontsize,
               textColor: settings.textcolor || current.textColor,
               headerColor: settings.headerColor || current.headerColor,
               sidebarColor: settings.sidebarColor || current.sidebarColor,
               backgroundColor: settings.pageBackgroundColor || settings.BackgroundColor || current.backgroundColor,
               headerTextColor: settings.headerTextColor || current.headerTextColor,
               sidebarTextColor: settings.sidebarTextColor || current.sidebarTextColor,
               primaryColor: settings.primaryColor || current.primaryColor,
               secondaryColor: settings.secondaryColor || current.secondaryColor,
          }));
     }, [applicationsettings?.settings]);

     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = event.target;
          setCustomization((current) => ({ ...current, [name]: value }));
     };

     const handleSave = async () => {
          const existingSettings = applicationsettings?.settings || {};
          const updatedSettings = {
               ...existingSettings,
               fontFamily: customization.fontFamily,
               fontsize: customization.fontsize,
               textcolor: customization.textColor,
               BackgroundColor: customization.backgroundColor,
               headerColor: customization.headerColor,
               sidebarColor: customization.sidebarColor,
               pageBackgroundColor: customization.backgroundColor,
               headerTextColor: customization.headerTextColor,
               sidebarTextColor: customization.sidebarTextColor,
               primaryColor: customization.primaryColor,
               secondaryColor: customization.secondaryColor,
          };

          try {
               setIsSaving(true);
               const response = await customPost('applicationsettings', 'POST', updatedSettings);
               if (response?.status !== 'success') throw new Error(response?.message || 'Unable to save customization settings');
               setApplicationSettings((current) => ({ ...(current || {}), settings: updatedSettings }));
               applyApplicationSettingsToDocument(updatedSettings);
               toast.success('Customization settings saved.');
          } catch (error: any) {
               toast.error(error?.message || 'Unable to save customization settings.');
          } finally {
               setIsSaving(false);
          }
     };

     return (
          <Container>
               <h5>Customization Settings</h5>
               <Form>
                    <Row className="bg-white p-2 br-5">
                         <Form.Group className="grid-reg mt-2" controlId="decimalPlaces">
                              <Form.Label className="pls-label">Decimal Places:</Form.Label>
                              <Form.Control className="custom-input" type="number" name="decimalPlaces" value={customization.decimalPlaces} onChange={handleInputChange} />
                         </Form.Group>
                         <Form.Group className="grid-reg mt-2" controlId="currency">
                              <Form.Label className="pls-label">Currency:</Form.Label>
                              {hasLoaded && <Select options={currencies} value={currencies.find((option) => option.isoCode === customization.currency)} onChange={(option) => option && setCustomization((current) => ({ ...current, currency: option.isoCode }))} placeholder="Select Currency" getOptionLabel={(option) => option.name} styles={reactSelectCustomStyles} getOptionValue={(option) => option.isoCode} />}
                         </Form.Group>
                         <Form.Group className="grid-reg mt-2" controlId="fontFamily">
                              <Form.Label className="pls-label">Font Family:</Form.Label>
                              {hasLoaded && <Select options={fontFamilyOptions} value={fontFamilyOptions.find((option) => option.value === customization.fontFamily)} onChange={(option) => option && setCustomization((current) => ({ ...current, fontFamily: option.value }))} styles={reactSelectCustomStyles} placeholder="Select Font Family" />}
                              <Form.Text className="d-block">{availableFonts.find((font) => font.value === customization.fontFamily)?.note || "The selected font applies throughout the application."}</Form.Text>
                         </Form.Group>
                         <Form.Group className="grid-reg mt-2" controlId="fontsize">
                              <Form.Label className="pls-label">Font Size:</Form.Label>
                              <Form.Control className="custom-input" type="text" name="fontsize" value={customization.fontsize} onChange={handleInputChange} placeholder="e.g. 15px" />
                         </Form.Group>
                         {[
                              ['headerColor', 'Header Color'],
                              ['headerTextColor', 'Header Text Color'],
                              ['sidebarColor', 'Sidebar Color'],
                              ['sidebarTextColor', 'Sidebar Text Color'],
                              ['backgroundColor', 'Background Color'],
                              ['primaryColor', 'Primary Color'],
                              ['secondaryColor', 'Secondary Color'],
                         ].map(([name, label]) => (
                              <Form.Group className="grid-reg mt-2" controlId={name} key={name}>
                                   <Form.Label className="pls-label">{label}:</Form.Label>
                                   <Form.Control className="custom-input" type="color" name={name} value={customization[name]} onChange={handleInputChange} />
                              </Form.Group>
                         ))}
                    </Row>
                    <Button variant="primary" className="mt-3" onClick={handleSave} disabled={isSaving}>
                         {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
               </Form>
          </Container>
     );
}
