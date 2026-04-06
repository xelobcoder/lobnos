"use client";
import React from 'react';
import {
     RiCheckboxMultipleLine,
     RiInputMethodLine,
     RiFileTextLine,
     RiRulerLine,
     RiArrowUpDownLine,
     RiTextWrap,
     RiHeartPulseLine
} from '@remixicon/react';

// Add styles for hover effects
if (typeof document !== 'undefined') {
     const styleId = 'visual-selector-styles';
     if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            .cursor-pointer { cursor: pointer; }
            .transition-all { transition: all 0.2s ease; }
            .hover-border-primary:hover { border-color: var(--bs-primary) !important; }
        `;
          document.head.appendChild(style);
     }
}

interface FieldType {
     value: string;
     label: string;
     description: string;
     icon: React.ElementType;
     example?: string;
}

interface VisualFieldTypeSelectorProps {
     selectedType: string | null;
     onSelect: (type: string) => void;
}

const fieldTypes: FieldType[] = [
     {
          value: 'options',
          label: 'Dropdown List',
          description: 'Multiple choice selection from predefined options',
          icon: RiCheckboxMultipleLine,
          example: 'Positive, Negative, Inconclusive'
     },
     {
          value: 'input',
          label: 'Single Line',
          description: 'Short text input for single values',
          icon: RiInputMethodLine,
          example: 'Patient Name, Test Code'
     },
     {
          value: 'textReference',
          label: 'Text Reference',
          description: 'Text field with reference ranges',
          icon: RiFileTextLine,
          example: 'Normal, Abnormal with reference notes'
     },
     {
          value: 'limits',
          label: 'Numeric Range',
          description: 'Numeric values with minimum and maximum limits',
          icon: RiRulerLine,
          example: 'Blood pressure: 80-120 mmHg'
     },
     {
          value: 'fetalBiometry',
          label: 'Fetal Biometry (Hadlock)',
          description: 'Captures BPD, FL, HC, AC and calculates EFW',
          icon: RiHeartPulseLine,
          example: 'BPD, FL, HC, AC with Hadlock EFW'
     },
     {
          value: 'greaterLess',
          label: 'Greater/Less Than',
          description: 'Comparison-based numeric values',
          icon: RiArrowUpDownLine,
          example: '> 100, < 50'
     },
     {
          value: 'plain',
          label: 'Text Area',
          description: 'Multi-line text for detailed notes',
          icon: RiTextWrap,
          example: 'Clinical observations, comments'
     },
     {
          value: 'ultrasoundFields',
          label: 'Ultrasound Fields',
          description: 'Specialized fields for ultrasound reports',
          icon: RiHeartPulseLine,
          example: 'Fetal measurements, biometry'
     }
];

export default function VisualFieldTypeSelector({ selectedType, onSelect }: VisualFieldTypeSelectorProps) {
     return (
          <div>
               <label className="form-label fw-semibold mb-2">
                    Select Input Type <span className="text-danger">*</span>
               </label>
               <div className="row g-2">
                    {fieldTypes.map((type) => {
                         const IconComponent = type.icon;
                         const isSelected = selectedType === type.value;

                         return (
                              <div key={type.value} className="col-md-6">
                                   <div
                                        className={`card h-100 cursor-pointer border-2 transition-all ${isSelected
                                             ? 'border-primary bg-primary bg-opacity-10'
                                             : 'border-light hover-border-primary'
                                             }`}
                                        onClick={() => onSelect(type.value)}
                                        style={{ cursor: 'pointer' }}
                                   >
                                        <div className="card-body p-3">
                                             <div className="d-flex align-items-start gap-3">
                                                  <div className={`p-2 rounded-circle ${isSelected ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                                                       <IconComponent size={20} />
                                                  </div>
                                                  <div className="flex-grow-1">
                                                       <h6 className="card-title mb-1 fw-semibold">{type.label}</h6>
                                                       <p className="card-text small text-muted mb-2">{type.description}</p>
                                                       {type.example && (
                                                            <small className="text-muted">
                                                                 <em>Example: {type.example}</em>
                                                            </small>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         );
                    })}
               </div>
          </div>
     );
}