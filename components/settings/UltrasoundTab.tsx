"use client"
import React from 'react';
import { Form } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';
import { layoutFontFamilies, fontFamilyLabel } from './layoutFontFamilies';

interface UltrasoundTabProps {
     settings: ResultSettings;
     handleChange: (e: any) => void;
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
     'Lexend, sans-serif',
     'Lexend Deca, Helvetica, Arial, sans-serif',
     'Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif',
     'Mulish, sans-serif',
     'Quicksand, sans-serif',
     'Cambria, Georgia, serif',
     'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
     ...layoutFontFamilies,
];

export const UltrasoundTab: React.FC<UltrasoundTabProps> = ({ settings, handleChange }) => {
     return (
          <>
               {/* Ultrasound Settings Section */}
               <h5 className="mb-3">Ultrasound Settings</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Header Font Size (px)</label>
                              <Form.Control
                                   type="number"
                                   name="ultrasoundSettings.fontSize"
                                   value={settings.ultrasoundSettings?.fontSize || 14}
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
                              <label className="pls-label">Content Font Size (px)</label>
                              <Form.Control
                                   type="number"
                                   name="ultrasoundSettings.contentFontSize"
                                   value={settings.ultrasoundSettings?.contentFontSize || 12}
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
                              <label className="pls-label">Section Title Font Size (px)</label>
                              <Form.Control
                                   type="number"
                                   name="ultrasoundSettings.sectionTitleFontSize"
                                   value={settings.ultrasoundSettings?.sectionTitleFontSize || 16}
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
                              <label className="pls-label">Line Height</label>
                              <Form.Control
                                   type="text"
                                   name="ultrasoundSettings.lineHeight"
                                   value={settings.ultrasoundSettings?.lineHeight || "1.5"}
                                   onChange={handleChange}
                                   placeholder="e.g., 1.5, 24px, 2em"
                                   className="custom-input"
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Header Font Family</label>
                              <Form.Select
                                   name="ultrasoundSettings.fontFamily"
                                   value={settings.ultrasoundSettings?.fontFamily || 'Arial, Helvetica, sans-serif'}
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
                              <label className="pls-label">Content Font Family</label>
                              <Form.Select
                                   name="ultrasoundSettings.contentFontFamily"
                                   value={settings.ultrasoundSettings?.contentFontFamily || 'Arial, Helvetica, sans-serif'}
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
                              <label className="pls-label">Header Background Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
                                        type="color"
                                        name="ultrasoundSettings.headerBackgroundColor"
                                        value={settings.ultrasoundSettings?.headerBackgroundColor || '#ffffff'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.headerBackgroundColor', value: e.target.value, type: 'text' } })}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="ultrasoundSettings.headerBackgroundColor"
                                        value={settings.ultrasoundSettings?.headerBackgroundColor || '#ffffff'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.headerBackgroundColor', value: e.target.value, type: 'text' } })}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Header Text Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
                                        type="color"
                                        name="ultrasoundSettings.headerTextColor"
                                        value={settings.ultrasoundSettings?.headerTextColor || '#000000'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.headerTextColor', value: e.target.value, type: 'text' } })}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="ultrasoundSettings.headerTextColor"
                                        value={settings.ultrasoundSettings?.headerTextColor || '#000000'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.headerTextColor', value: e.target.value, type: 'text' } })}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Content Color</label>
                              <div className="d-flex align-items-center gap-2">
                                   <Form.Control
                                        type="color"
                                        name="ultrasoundSettings.contentColor"
                                        value={settings.ultrasoundSettings?.contentColor || '#333333'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.contentColor', value: e.target.value, type: 'text' } })}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="ultrasoundSettings.contentColor"
                                        value={settings.ultrasoundSettings?.contentColor || '#333333'}
                                        onChange={(e) => handleChange({ target: { name: 'ultrasoundSettings.contentColor', value: e.target.value, type: 'text' } })}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Show Technique Section</label>
                              <Form.Check
                                   type="switch"
                                   id="ultrasoundSettings.showTechnique"
                                   name="ultrasoundSettings.showTechnique"
                                   checked={!!settings.ultrasoundSettings?.showTechnique}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Show Disclaimer Section</label>
                              <Form.Check
                                   type="switch"
                                   id="ultrasoundSettings.showDisclaimer"
                                   name="ultrasoundSettings.showDisclaimer"
                                   checked={!!settings.ultrasoundSettings?.showDisclaimer}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               {settings.ultrasoundSettings?.showDisclaimer && (
                    <div className="form-row mt-3">
                         <label className="pls-label">Disclaimer Text</label>
                         <Form.Control
                              as="textarea"
                              name="ultrasoundSettings.disclaimerText"
                              value={settings.ultrasoundSettings?.disclaimerText || ''}
                              onChange={handleChange}
                              rows={3}
                              className="form-control"
                         />
                    </div>
               )}

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Allow Ultrasound Images</label>
                              <Form.Check
                                   type="switch"
                                   id="ultrasoundSettings.allowUltrasoundImages"
                                   name="ultrasoundSettings.allowUltrasoundImages"
                                   checked={!!settings.ultrasoundSettings?.allowUltrasoundImages}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>
          </>
     );
};