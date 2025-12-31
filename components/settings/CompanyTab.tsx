"use client"
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';

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
     'Lexend Deca, Helvetica, Arial, sans-serif',
     'Cambria, Georgia, serif',
     'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
];

interface CompanyTabProps {
     settings: ResultSettings;
     handleChange: (e: any) => void;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({ settings, handleChange }) => {
     const [headerType, setHeaderType] = useState(settings.companyInfo.headerType || 'default');
     const headerSamples: Record<string, string> = {
          default: '/letters-headers-sample/Screenshot_24-12-2025_113930_localhost.jpeg',
          dondee: '/letters-headers-sample/Screenshot_24-12-2025_113954_.jpeg',
          fullwidth: '/letters-headers-sample/Global-Full-Width.jpeg',
     };

     const handleHeaderTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          setHeaderType(e.target.value);
          handleChange({ target: { name: 'companyInfo.headerType', value: e.target.value, type: 'text' } });
     };

     return (
          <>
               <h5 className="mb-3">Company Information</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Company Name Font Size (px)</label>
                              <Form.Control
                                   type="number"
                                   name="companyInfo.namefontsize"
                                   value={settings.companyInfo.namefontsize}
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
                              <label className="pls-label">Company Subname Font Size (px)</label>
                              <Form.Control
                                   type="number"
                                   name="companyInfo.subnameFontSize"
                                   value={settings.companyInfo.subnameFontSize}
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
                              <label className="pls-label">Company Name Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
                                        type="color"
                                        name="companyInfo.color"
                                        value={settings.companyInfo.color}
                                        onChange={(e) => handleChange({ target: { name: 'companyInfo.color', value: e.target.value, type: 'text' } })}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="companyInfo.color"
                                        value={settings.companyInfo.color}
                                        onChange={(e) => handleChange({ target: { name: 'companyInfo.color', value: e.target.value, type: 'text' } })}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                              <Form.Check
                                   type="switch"
                                   id="companyInfo.breakname"
                                   label="Break Company Name"
                                   name="companyInfo.breakname"
                                   checked={settings.companyInfo.breakname}
                                   onChange={(e) => handleChange({ target: { name: 'companyInfo.breakname', value: e.target.checked, type: 'checkbox', checked: e.target.checked } })}
                                   className="mt-2"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Company Subname Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
                                        type="color"
                                        name="companyInfo.subnameColor"
                                        value={settings.companyInfo.subnameColor}
                                        onChange={(e) => handleChange({ target: { name: 'companyInfo.subnameColor', value: e.target.value, type: 'text' } })}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="companyInfo.subnameColor"
                                        value={settings.companyInfo.subnameColor}
                                        onChange={(e) => handleChange({ target: { name: 'companyInfo.subnameColor', value: e.target.value, type: 'text' } })}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Company Information Font Family</label>
                              <Form.Select
                                   name="companyInfo.fontFamily"
                                   value={settings.companyInfo.fontFamily || ''}
                                   onChange={(e) => handleChange({ target: { name: 'companyInfo.fontFamily', value: e.target.value, type: 'text' } })}
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
                              <label className="pls-label">Letterhead Type</label>
                              <Form.Select
                                   name="companyInfo.headerType"
                                   value={headerType}
                                   onChange={handleHeaderTypeChange}
                                   className="custom-input"
                              >
                                   <option value="default">Original Header</option>
                                   <option value="dondee">Dondee Header</option>
                                   <option value="fullwidth">Full Width Header</option>
                              </Form.Select>
                         </div>
                    </div>
               </div>
               <div className="row mt-4">
                    <div className="col-12">
                         <div className="border rounded p-3 bg-light">
                              <div className="mb-2 text-muted" style={{ fontSize: '13px' }}>Letterhead Preview</div>
                              <img
                                   src={headerSamples[headerType]}
                                   alt={headerType + ' letterhead sample'}
                                   style={{ maxWidth: '100%', maxHeight: 300, border: '1px solid #ccc', borderRadius: 8 }}
                              />
                         </div>
                    </div>
               </div>
          </>
     );
};