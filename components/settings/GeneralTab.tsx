"use client"
import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';


interface GeneralTabProps {
     settings: ResultSettings;
     handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

const fontFamilies = [
     'Arial, Helvetica, sans-serif',
     'Verdana, Geneva, sans-serif',
     'Tahoma, Geneva, sans-serif',
     'Trebuchet MS, Helvetica, sans-serif',
     'Times New Roman, Times, serif',
     'Georgia, serif',
     'Garamond, serif',
     'Courier New, Courier, monospace',
     'Brush Script MT, cursive',
     'Lexend Deca, Helvetica, Arial, sans-serif',
     'Cambria, Georgia, serif',
     'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
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
                              <label className="pls-label">Font Family</label>
                              <Form.Select
                                   name="fontfamily"
                                   value={settings.fontfamily}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   {fontFamilies.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                   ))}
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Test Name Font Size (px)</label>
                              <Form.Control
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
                              <label className="pls-label">Table Header Font Size (px)</label>
                              <Form.Control
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
                              <label className="pls-label">Test Name Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label">Main Report Header Background</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label">Main Report Header Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label">Test Table Header Background</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label">Test Table Header Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label">Font Size</label>
                              <Form.Control
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
                              <label className="pls-label">Font Family</label>
                              <Form.Select
                                   name="testBody.fontFamily"
                                   value={settings.testBody.fontFamily}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   {fontFamilies.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                   ))}
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
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
                              <label className="pls-label mb-0 me-3">Highlight Flags</label>
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
                                        <label className="pls-label">High Flag Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                             <Form.Control
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
                                        <label className="pls-label">Low Flag Color</label>
                                        <div className="d-flex align-items-center gap-2">
                                             <Form.Control
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
                              <label className="pls-label mb-0 me-3">Bold Parameters</label>
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
                              <label className="pls-label mb-0 me-3">Bold Values</label>
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
                              <label className="pls-label mb-0 me-3">Bold Units</label>
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
                              <label className="pls-label">Investigation Column</label>
                              <Form.Control
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
                              <label className="pls-label">Value Column</label>
                              <Form.Control
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
                              <label className="pls-label">Units Column</label>
                              <Form.Control
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
                              <label className="pls-label">Range Column</label>
                              <Form.Control
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
                              <label className="pls-label">Flag Column</label>
                              <Form.Control
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