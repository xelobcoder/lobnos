"use client"
import React from 'react';
import { Form } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';

interface ReportOptionsTabProps {
     settings: ResultSettings;
     handleChange: (e: any) => void;
}

export const ReportOptionsTab: React.FC<ReportOptionsTabProps> = ({ settings, handleChange }) => {
     return (
          <>
               {/* Report Options Section */}
               <h5 className="mb-3">Report Options</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Template</label>
                              <Form.Select
                                   name="template"
                                   value={settings.template}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   <option value={1}>Template 1</option>
                                   <option value={2}>Template 2</option>
                                   <option value={3}>Template 3</option>
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Include Signature</label>
                              <Form.Check
                                   type="switch"
                                   id="includeSignature"
                                   name="includeSignature"
                                   checked={settings.includeSignature}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Include Limitations</label>
                              <Form.Check
                                   type="switch"
                                   id="includeLimitations"
                                   name="includeLimitations"
                                   checked={settings.includeLimitations}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               {settings.includeLimitations && (
                    <div className="form-row mt-3">
                         <label className="pls-label">Limitations Text</label>
                         <Form.Control
                              as="textarea"
                              name="limitations"
                              value={settings.limitations}
                              onChange={handleChange}
                              rows={3}
                              className="custom-input"
                         />
                    </div>
               )}

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Include Barcode</label>
                              <Form.Check
                                   type="switch"
                                   id="includeBarcode"
                                   name="includeBarcode"
                                   checked={!!settings.includeBarcode}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Show End Of Result</label>
                              <Form.Check
                                   type="switch"
                                   id="showEndOfResult"
                                   name="showEndOfResult"
                                   checked={settings.showEndOfResult}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Use General Validation</label>
                              <Form.Check
                                   type="switch"
                                   id="useGeneraralValidation"
                                   name="useGeneraralValidation"
                                   checked={!!settings.useGeneraralValidation}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Use Individual Validations</label>
                              <Form.Check
                                   type="switch"
                                   id="useIndividualValidations"
                                   name="useIndividualValidations"
                                   checked={!!settings.useIndividualValidations}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Show Method</label>
                              <Form.Check
                                   type="switch"
                                   id="showMethod"
                                   name="showMethod"
                                   checked={!!settings.showMethod}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Use Instrumentation</label>
                              <Form.Check
                                   type="switch"
                                   id="useInstrumentation"
                                   name="useInstrumentation"
                                   checked={!!settings.useInstrumentation}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Use Report Title</label>
                              <Form.Check
                                   type="switch"
                                   id="useReportTitle"
                                   name="useReportTitle"
                                   checked={!!settings.useReportTitle}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>
          </>
     );
};