"use client"
import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import { ResultSettings } from '../../../../components/ResultView/result-settings';

interface GeneralTabProps {
     settings: ResultSettings;
     handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

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
          </>
     );
};