"use client"
import React from 'react';
import { Form } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';

interface CompanyTabProps {
     settings: ResultSettings;
     handleChange: (e: any) => void;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({ settings, handleChange }) => {
     return (
          <>
               {/* Company Information Section */}
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
          </>
     );
};