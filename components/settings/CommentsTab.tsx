"use client"
import React from 'react';
import { Form } from 'react-bootstrap';
import { ResultSettings } from '../ResultView/result-settings';

interface CommentsTabProps {
     settings: ResultSettings;
     handleChange: (e: any) => void;
}

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
     'Lexend, sans-serif',
     'Lexend Deca, Helvetica, Arial, sans-serif',
     'Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif',
     'Cambria, Georgia, serif',
     'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
];

export const CommentsTab: React.FC<CommentsTabProps> = ({ settings, handleChange }) => {
     const comments = settings.comments || ({} as ResultSettings['comments']);

     return (
          <>
               <h5 className="mb-3">Comments Styling</h5>
               <hr />

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Show &quot;Comments&quot; Heading</label>
                              <Form.Check
                                   type="switch"
                                   id="comments.showHeading"
                                   name="comments.showHeading"
                                   checked={comments.showHeading ?? true}
                                   onChange={handleChange}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Heading Color</label>
                              <div className="d-flex gap-2 align-items-center">
                                   <Form.Control
                                        type="color"
                                        name="comments.headingColor"
                                        value={comments.headingColor || '#000000'}
                                        onChange={handleChange}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="comments.headingColor"
                                        value={comments.headingColor || ''}
                                        onChange={handleChange}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Font Family</label>
                              <Form.Select
                                   name="comments.fontFamily"
                                   value={comments.fontFamily}
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
                              <label className="pls-label">Font Size</label>
                              <Form.Control
                                   type="number"
                                   name="comments.fontSize"
                                   value={comments.fontSize ?? 13}
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
                              <label className="pls-label">Text Color</label>
                              <div className="d-flex gap-2 align-items-center">
                                   <Form.Control
                                        type="color"
                                        name="comments.color"
                                        value={comments.color || '#000000'}
                                        onChange={handleChange}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="comments.color"
                                        value={comments.color || ''}
                                        onChange={handleChange}
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Background Color</label>
                              <div className="d-flex gap-2 align-items-center">
                                   <Form.Control
                                        type="color"
                                        name="comments.backgroundColor"
                                        value={comments.backgroundColor && comments.backgroundColor !== 'transparent' ? comments.backgroundColor : '#ffffff'}
                                        onChange={handleChange}
                                        style={{ width: 50, minWidth: 50, padding: 0 }}
                                   />
                                   <Form.Control
                                        type="text"
                                        name="comments.backgroundColor"
                                        value={comments.backgroundColor || ''}
                                        onChange={handleChange}
                                        placeholder="transparent"
                                        className="custom-input flex-grow-1"
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg">
                              <label className="pls-label">Text Alignment</label>
                              <Form.Select
                                   name="comments.textAlign"
                                   value={comments.textAlign || 'left'}
                                   onChange={handleChange}
                                   className="custom-select"
                              >
                                   <option value="left">Left</option>
                                   <option value="center">Center</option>
                                   <option value="right">Right</option>
                                   <option value="justify">Justify</option>
                              </Form.Select>
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Italic</label>
                              <Form.Check
                                   type="switch"
                                   id="comments.fontStyle"
                                   name="comments.fontStyle"
                                   checked={comments.fontStyle === 'italic'}
                                   onChange={(e) => handleChange({ target: { name: 'comments.fontStyle', value: e.target.checked ? 'italic' : 'normal', type: 'text' } })}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-3">
                    <div className="col-12">
                         <div className="form-row grid-reg d-flex align-items-center">
                              <label className="pls-label mb-0 me-3">Bold</label>
                              <Form.Check
                                   type="switch"
                                   id="comments.fontWeight"
                                   name="comments.fontWeight"
                                   checked={comments.fontWeight === 'bold'}
                                   onChange={(e) => handleChange({ target: { name: 'comments.fontWeight', value: e.target.checked ? 'bold' : 'normal', type: 'text' } })}
                              />
                         </div>
                    </div>
               </div>

               <div className="row mt-4">
                    <div className="col-12">
                         <div className="border rounded p-3 bg-light">
                              <div className="mb-2 text-muted" style={{ fontSize: '13px' }}>Preview</div>
                              <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, background: 'white' }}>
                                   {(comments.showHeading ?? true) && (
                                        <div className="fw-bold" style={{ color: comments.headingColor || 'black' }}>Comments</div>
                                   )}
                                   <div style={{
                                        fontFamily: comments.fontFamily,
                                        fontSize: comments.fontSize ? `${comments.fontSize}px` : undefined,
                                        color: comments.color || 'black',
                                        backgroundColor: comments.backgroundColor || 'transparent',
                                        fontStyle: comments.fontStyle || 'normal',
                                        fontWeight: comments.fontWeight || 'normal',
                                        textAlign: comments.textAlign || 'left',
                                   }}>
                                        Sample comment text as it will appear on the printed report.
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
};
