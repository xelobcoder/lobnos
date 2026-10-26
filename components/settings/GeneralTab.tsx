"use client"
import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';
import { layoutFontFamilies, fontFamilyLabel } from './layoutFontFamilies';


interface GeneralTabProps {
     settings: ResultSettings;
     handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

const fontFamilies = [
     'Arial, Helvetica, sans-serif',
     'Verdana, Geneva, sans-serif',
     'Tahoma, Geneva, sans-serif',
     'Trebuchet MS, Helvetica, sans-serif',
     'Rajdhani, sans-serif',
     'Times New Roman, Times, serif',
     'Georgia, serif',
     'Garamond, serif',
     'Courier New, Courier, monospace',
     'Brush Script MT, cursive',
     'Lexend, sans-serif',
     'Lexend Deca, Helvetica, Arial, sans-serif',
     'Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif',
     'Cambria, Georgia, serif',
     'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
     ...layoutFontFamilies,
];

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, handleChange }) => {
     return (
          <>
               {/* Typography & Colors Section */}
               <h5 className="mb-3">Typography & Colors</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-fontfamily" className="pls-label">Font Family</label>
                              <Form.Select id="settings-setting-fontfamily"
                                   name="fontfamily"
                                   value={settings.fontfamily}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   {fontFamilies.map((f) => (
                                        <option key={f} value={f}>{fontFamilyLabel(f)}</option>
                                   ))}
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-patientInfo.fontFamily" className="pls-label">Patient Information Font Family</label>
                              <Form.Select id="settings-setting-patientInfo.fontFamily"
                                   name="patientInfo.fontFamily"
                                   value={settings.patientInfo?.fontFamily || settings.fontfamily}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   {fontFamilies.map((f) => (
                                                                           <option key={f} value={f}>{fontFamilyLabel(f)}</option>
                                   ))}
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testnameFontSize" className="pls-label">Test Name Font Size (px)</label>
                              <Form.Control id="settings-setting-testnameFontSize"
                                   type="number"
                                   name="testnameFontSize"
                                   value={settings.testnameFontSize}
                                   onChange={handleChange}
                                   min={8}
                                   max={72}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testTableHeaderFontSize" className="pls-label">Table Header Font Size (px)</label>
                              <Form.Control id="settings-setting-testTableHeaderFontSize"
                                   type="number"
                                   name="testTableHeaderFontSize"
                                   value={settings.testTableHeaderFontSize}
                                   onChange={handleChange}
                                   min={8}
                                   max={72}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testnameColor" className="pls-label">Test Name Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-testnameColor"
                                        type="color"
                                        name="testnameColor"
                                        value={settings.testnameColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             // This would need to be handled by parent component
                                             const syntheticEvent = {
                                                  target: { name: 'testnameColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="testnameColor"
                                        value={settings.testnameColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testnameColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               {/* Header & Table Styling Section */}
               <hr />
               <h5 className="mb-3">Header & Table Styling</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-mainReportHeaderBgColor" className="pls-label">Main Report Header Background</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-mainReportHeaderBgColor"
                                        type="color"
                                        name="mainReportHeaderBgColor"
                                        value={settings.mainReportHeaderBgColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'mainReportHeaderBgColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="mainReportHeaderBgColor"
                                        value={settings.mainReportHeaderBgColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'mainReportHeaderBgColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-mainReportHeaderColor" className="pls-label">Main Report Header Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-mainReportHeaderColor"
                                        type="color"
                                        name="mainReportHeaderColor"
                                        value={settings.mainReportHeaderColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'mainReportHeaderColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="mainReportHeaderColor"
                                        value={settings.mainReportHeaderColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'mainReportHeaderColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testTableHeaderBackgroundColor" className="pls-label">Test Table Header Background</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-testTableHeaderBackgroundColor"
                                        type="color"
                                        name="testTableHeaderBackgroundColor"
                                        value={settings.testTableHeaderBackgroundColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testTableHeaderBackgroundColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="testTableHeaderBackgroundColor"
                                        value={settings.testTableHeaderBackgroundColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testTableHeaderBackgroundColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testTableHeaderTextColor" className="pls-label">Test Table Header Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-testTableHeaderTextColor"
                                        type="color"
                                        name="testTableHeaderTextColor"
                                        value={settings.testTableHeaderTextColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testTableHeaderTextColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="testTableHeaderTextColor"
                                        value={settings.testTableHeaderTextColor}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testTableHeaderTextColor', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               {/* Test Body Settings Section */}
               <h5 className="mb-3 mt-4">Test Body Settings</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.fontSize" className="pls-label">Font Size</label>
                              <Form.Control id="settings-setting-testBody.fontSize"
                                   type="number"
                                   name="testBody.fontSize"
                                   value={settings.testBody.fontSize}
                                   onChange={handleChange}
                                   min={8}
                                   max={24}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.fontFamily" className="pls-label">Font Family</label>
                              <Form.Select id="settings-setting-testBody.fontFamily"
                                   name="testBody.fontFamily"
                                   value={settings.testBody.fontFamily}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   {fontFamilies.map((f) => (
                                                                           <option key={f} value={f}>{fontFamilyLabel(f)}</option>
                                   ))}
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.color" className="pls-label">Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control id="settings-setting-testBody.color"
                                        type="color"
                                        name="testBody.color"
                                        value={settings.testBody.color}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testBody.color', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="testBody.color"
                                        value={settings.testBody.color}
                                        onChange={e => {
                                             const value = e.target.value;
                                             const syntheticEvent = {
                                                  target: { name: 'testBody.color', value, type: 'text' }
                                             } as React.ChangeEvent<HTMLInputElement>;
                                             handleChange(syntheticEvent);
                                        }}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label htmlFor="testBody.highlightFlags" className="pls-label mb-0 me-3">Highlight Flags</label>
                              <Form.Check
                                   type="switch"
                                   id="testBody.highlightFlags"
                                   name="testBody.highlightFlags"
                                   checked={settings.testBody.highlightFlags}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               {settings.testBody.highlightFlags && (
                    <>
                         <div className="row mt-3">
                              <div className="col-12">
                                   <div className="form-row grid-reg">
                                        <label htmlFor="settings-setting-testBody.hightFlagColor" className="pls-label">High Flag Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                             <Form.Control id="settings-setting-testBody.hightFlagColor"
                                                  type="color"
                                                  name="testBody.hightFlagColor"
                                                  value={settings.testBody.hightFlagColor}
                                                  onChange={e => {
                                                       const value = e.target.value;
                                                       const syntheticEvent = {
                                                            target: { name: 'testBody.hightFlagColor', value, type: 'text' }
                                                       } as React.ChangeEvent<HTMLInputElement>;
                                                       handleChange(syntheticEvent);
                                                  }}
                                                  style={{ width: 50, minWidth: 50, padding: 0 }}
                                             />
                                             <Form.Control
                                                  type="text"
                                                  name="testBody.hightFlagColor"
                                                  value={settings.testBody.hightFlagColor}
                                                  onChange={e => {
                                                       const value = e.target.value;
                                                       const syntheticEvent = {
                                                            target: { name: 'testBody.hightFlagColor', value, type: 'text' }
                                                       } as React.ChangeEvent<HTMLInputElement>;
                                                       handleChange(syntheticEvent);
                                                  }}
                                                  className="custom-input flex-grow-1"
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="row mt-3">
                              <div className="col-12">
                                   <div className="form-row grid-reg">
                                        <label htmlFor="settings-setting-testBody.lowFlagColor" className="pls-label">Low Flag Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                             <Form.Control id="settings-setting-testBody.lowFlagColor"
                                                  type="color"
                                                  name="testBody.lowFlagColor"
                                                  value={settings.testBody.lowFlagColor}
                                                  onChange={e => {
                                                       const value = e.target.value;
                                                       const syntheticEvent = {
                                                            target: { name: 'testBody.lowFlagColor', value, type: 'text' }
                                                       } as React.ChangeEvent<HTMLInputElement>;
                                                       handleChange(syntheticEvent);
                                                  }}
                                                  style={{ width: 50, minWidth: 50, padding: 0 }}
                                             />
                                             <Form.Control
                                                  type="text"
                                                  name="testBody.lowFlagColor"
                                                  value={settings.testBody.lowFlagColor}
                                                  onChange={e => {
                                                       const value = e.target.value;
                                                       const syntheticEvent = {
                                                            target: { name: 'testBody.lowFlagColor', value, type: 'text' }
                                                       } as React.ChangeEvent<HTMLInputElement>;
                                                       handleChange(syntheticEvent);
                                                  }}
                                                  className="custom-input flex-grow-1"
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </>
               )}

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label htmlFor="testBody.boldenParameter" className="pls-label mb-0 me-3">Bold Parameters</label>
                              <Form.Check
                                   type="switch"
                                   id="testBody.boldenParameter"
                                   name="testBody.boldenParameter"
                                   checked={settings.testBody.boldenParameter}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label htmlFor="testBody.boldenValue" className="pls-label mb-0 me-3">Bold Values</label>
                              <Form.Check
                                   type="switch"
                                   id="testBody.boldenValue"
                                   name="testBody.boldenValue"
                                   checked={settings.testBody.boldenValue}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label htmlFor="testBody.boldenUnits" className="pls-label mb-0 me-3">Bold Units</label>
                              <Form.Check
                                   type="switch"
                                   id="testBody.boldenUnits"
                                   name="testBody.boldenUnits"
                                   checked={settings.testBody.boldenUnits}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               {/* Column Names Section */}
               <h6 className="mb-3 mt-4">Column Names</h6>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.trFirstColumnName" className="pls-label">Investigation Column</label>
                              <Form.Control id="settings-setting-testBody.trFirstColumnName"
                                   type="text"
                                   name="testBody.trFirstColumnName"
                                   value={settings.testBody.trFirstColumnName}
                                   onChange={handleChange}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.trSecondColumnName" className="pls-label">Value Column</label>
                              <Form.Control id="settings-setting-testBody.trSecondColumnName"
                                   type="text"
                                   name="testBody.trSecondColumnName"
                                   value={settings.testBody.trSecondColumnName}
                                   onChange={handleChange}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.trThirdColumnName" className="pls-label">Units Column</label>
                              <Form.Control id="settings-setting-testBody.trThirdColumnName"
                                   type="text"
                                   name="testBody.trThirdColumnName"
                                   value={settings.testBody.trThirdColumnName || ''}
                                   onChange={handleChange}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.trFourthColumnName" className="pls-label">Range Column</label>
                              <Form.Control id="settings-setting-testBody.trFourthColumnName"
                                   type="text"
                                   name="testBody.trFourthColumnName"
                                   value={settings.testBody.trFourthColumnName || ''}
                                   onChange={handleChange}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label htmlFor="settings-setting-testBody.trFifthColumnName" className="pls-label">Flag Column</label>
                              <Form.Control id="settings-setting-testBody.trFifthColumnName"
                                   type="text"
                                   name="testBody.trFifthColumnName"
                                   value={settings.testBody.trFifthColumnName || ''}
                                   onChange={handleChange}
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>
          </>
     );
};