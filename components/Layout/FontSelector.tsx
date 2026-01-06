'use client';
import React, { useState, useEffect } from 'react';
import { availableFonts, availableFontSizes, getFontPreference, saveFontPreference, applyFontToDocument, getFontSizePreference, saveFontSizePreference, applyFontSizeToDocument } from '../../lib/themes';
import { RiFontSize, RiCheckLine } from '@remixicon/react';

interface FontSelectorProps {
     isOpen: boolean;
     onClose: () => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ isOpen, onClose }) => {
     const [currentFont, setCurrentFont] = useState<string>('');
     const [currentFontSize, setCurrentFontSize] = useState<string>('');
     const [activeTab, setActiveTab] = useState<'fonts' | 'size'>('fonts');

     useEffect(() => {
          if (isOpen) {
               const savedFont = getFontPreference();
               setCurrentFont(savedFont);
               const savedFontSize = getFontSizePreference();
               setCurrentFontSize(savedFontSize);
          }
     }, [isOpen]);

     if (!isOpen) return null;

     const handleFontSelect = (fontValue: string) => {
          saveFontPreference(fontValue);
          applyFontToDocument(fontValue);
          setCurrentFont(fontValue);
     };

     const handleFontSizeSelect = (fontSizeValue: string) => {
          saveFontSizePreference(fontSizeValue);
          applyFontSizeToDocument(fontSizeValue);
          setCurrentFontSize(fontSizeValue);
     };

     return (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
               style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(2px)', zIndex: 1050 }}>
               <div className="bg-body rounded shadow-lg p-3 border" style={{ maxWidth: '400px', width: '90%' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <h5 className="mb-0 d-flex align-items-center text-body">
                              <RiFontSize size={20} className="me-2" />
                              Typography Settings
                         </h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={onClose}
                              aria-label="Close"
                         ></button>
                    </div>

                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4" role="tablist">
                         <li className="nav-item" role="presentation">
                              <button
                                   className={`nav-link ${activeTab === 'fonts' ? 'active' : ''}`}
                                   onClick={() => setActiveTab('fonts')}
                                   type="button"
                                   role="tab"
                              >
                                   Font Family
                              </button>
                         </li>
                         <li className="nav-item" role="presentation">
                              <button
                                   className={`nav-link ${activeTab === 'size' ? 'active' : ''}`}
                                   onClick={() => setActiveTab('size')}
                                   type="button"
                                   role="tab"
                              >
                                   Font Size
                              </button>
                         </li>
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content">
                         {activeTab === 'fonts' && (
                              <div className="tab-pane active">
                                   <div className="row g-3">
                                        {availableFonts.length > 0 && availableFonts.map((font, index) => (
                                             <div key={index} className="col-6">
                                                  <button
                                                       className={`btn w-100 text-start p-2 border rounded position-relative ${currentFont === font.value ? 'btn-primary' : 'btn-outline-secondary'
                                                            }`}
                                                       onClick={() => handleFontSelect(font.value)}
                                                       style={{ fontFamily: font.value }}
                                                  >
                                                       {currentFont === font.value && (
                                                            <RiCheckLine size={16} className="position-absolute top-50 end-0 translate-middle-y me-2 text-light" />
                                                       )}
                                                       <div className="fw-semibold text-body">{font.name}</div>
                                                  </button>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         )}

                         {activeTab === 'size' && (
                              <div className="tab-pane active">
                                   <label className="form-label fw-semibold mb-3">Font Size</label>
                                   <select
                                        value={currentFontSize}
                                        onChange={(e) => handleFontSizeSelect(e.target.value)}
                                        className="form-select"
                                   >
                                        {availableFontSizes.map((size, index) => (
                                             <option
                                                  key={index}
                                                  value={size.value}
                                                  style={{ fontSize: size.value }}
                                             >
                                                  {size.name} ({size.value})
                                             </option>
                                        ))}
                                   </select>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};