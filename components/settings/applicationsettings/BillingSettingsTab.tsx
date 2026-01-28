"use client"
import React, { useEffect, useState } from 'react';
import { Form, Card } from 'react-bootstrap';
import { RiCheckboxCircleLine, RiShieldCheckLine, RiMoneyDollarCircleLine, RiFileListLine, RiFlowChart, RiRefundLine, RiGroupLine, RiSettings4Line, RiUserSharedLine } from '@remixicon/react';
import { customFetch } from '../../Auth/customFetch';

interface ApplicationSettingsData {
     PaidBillsBeforeTransaction: number;
     approvalbeforeprinting: number;
     AllowCrmToGiveDisocunt: number;
     bulkregistration: number;
     completeFlow: number;
     includeTax: number;
     withnessRefund: number;
     billingidPrefix: string;
     patientIdGenerationMethod?: string;
     regioncode?: string;
     districtcode?: string;
     patientIdAutoIncrementStart?: number;
}

interface BillingSettingsTabProps {
     settings: ApplicationSettingsData;
     handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const BillingSettingsTab: React.FC<BillingSettingsTabProps> = ({ settings, handleChange }) => {
     const [regions, setRegions] = useState<any[]>([]);
     const [districts, setDistricts] = useState<any[]>([]);

     const settingsGroups = [
          {
               title: 'Payment & Billing Controls',
               icon: <RiMoneyDollarCircleLine size={24} />,
               color: "#2563eb",
               description: "Configure payment rules and billing requirements",
               settings: [
                    {
                         name: 'PaidBillsBeforeTransaction',
                         label: 'Paid Bills Before Transaction',
                         description: 'Require bills to be fully paid before processing any transactions',
                         icon: <RiCheckboxCircleLine size={20} />
                    },
                    {
                         name: 'includeTax',
                         label: 'Include Tax',
                         description: 'Automatically include tax calculations in billing',
                         icon: <RiFileListLine size={20} />
                    },
                    {
                         name: 'withnessRefund',
                         label: 'Witness Refund',
                         description: 'Enable refund processing with witness verification',
                         icon: <RiUserSharedLine size={20} />
                    }
               ]
          },
          {
               title: 'Workflow & Operations',
               icon: <RiFlowChart size={24} />,
               color: "#16a34a",
               description: "Manage operational workflows and processes",
               settings: [
                    {
                         name: 'bulkregistration',
                         label: 'Bulk Registration',
                         description: 'Allow multiple patient registrations in a single session',
                         icon: <RiGroupLine size={20} />
                    },
                    {
                         name: 'completeFlow',
                         label: 'Complete Flow',
                         description: 'Enforce complete workflow from registration to result',
                         icon: <RiFlowChart size={20} />
                    },
                    {
                         name: 'approvalbeforeprinting',
                         label: 'Approval Before Printing',
                         description: 'Require management approval before printing documents',
                         icon: <RiShieldCheckLine size={20} />
                    }
               ]
          },
          {
               title: 'Permissions & Access',
               icon: <RiShieldCheckLine size={24} />,
               color: "#ea580c",
               description: "Control user permissions and access levels",
               settings: [
                    {
                         name: 'AllowCrmToGiveDisocunt',
                         label: 'Allow CRM to Give Discount',
                         description: 'Enable CRM staff to apply discounts to customer bills',
                         icon: <RiMoneyDollarCircleLine size={20} />
                    },
                    {
                         name: "allowValidationUpaid",
                         label: 'Allow Validation of Unpaid service or report',
                         description: 'Permit validation processes even if bills are unpaid',
                         icon: <RiRefundLine size={20} />

                    },
                    {
                         name: "allowPrintingUnpaid",
                         label: 'Allow Printing of unpaid result',
                         description: 'Enable printing of bills even if they are unpaid',
                         icon: <RiFileListLine size={20} />

                    },
                    {
                         name: "allowResultEnteringUpaid",
                         label: 'Allow Result Entering of unpaid service results',
                         description: 'Permit entering results for services that are unpaid',
                         icon: <RiCheckboxCircleLine size={20} />
                    }
               ]
          }
     ];


     function getPatientIdPreview(settings: ApplicationSettingsData) {
          const today = new Date();
          const yy = String(today.getFullYear()).slice(-2);
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          if (settings.patientIdGenerationMethod === 'region') {
               const region = settings.regioncode || 'NR';
               const autoinc = String(settings.patientIdAutoIncrementStart || 5).padStart(4, '0');
               const district = settings.districtcode || 'NT';
               return `${region}-${autoinc}-${district}`;
          }
          return `${settings.billingidPrefix || 'PRE'}-${yy}${mm}${dd}-${settings.patientIdAutoIncrementStart || 1}`;
     }

     useEffect(() => {
          async function fetchRegions() {
               const res = await customFetch('locations/regions-districts');
               if (res?.status === 'success' && res?.statusCode === 200 && Array.isArray(res.data)) {
                    setRegions(res.data);
               }
          }
          fetchRegions();
     }, []);

     useEffect(() => {
          // When region changes, update districts
          const selectedRegion = regions.find(r => r.regioncode === settings.regioncode);
          setDistricts(selectedRegion ? selectedRegion.districts : []);
     }, [settings.regioncode, regions]);

     return (
          <div>
               {/* Billing ID Prefix Section */}
               <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                         <div className="d-flex align-items-center">
                              <div
                                   className="rounded d-flex align-items-center justify-content-center me-3"
                                   style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: 'oklch(0.646 0.222 41.116)',
                                        color: 'white'
                                   }}
                              >
                                   <RiSettings4Line size={24} />
                              </div>
                              <div>
                                   <h5 className="mb-1 fw-bold">Billing ID Prefix</h5>
                                   <p className="text-muted mb-0 small">Configure billing identifier format</p>
                              </div>
                         </div>
                         <div style={{ minWidth: '300px' }}>
                              <Form.Group>
                                   <Form.Label className="text-muted small mb-1">Prefix Value</Form.Label>
                                   <Form.Control
                                        type="text"
                                        name="billingidPrefix"
                                        value={settings.billingidPrefix || ''}
                                        onChange={handleChange}
                                        placeholder="Enter billing prefix (e.g., INV, BILL)"
                                        className="shadow-sm"
                                   />
                                   <Form.Text className="text-muted">
                                        This prefix will be added to all billing IDs
                                   </Form.Text>
                              </Form.Group>
                         </div>
                    </div>
               </div>

               {/* Patient ID Generation */}
               <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                         <div>
                              <h5 className="mb-1 fw-bold">Patient ID Generation</h5>
                              <p className="text-muted small mb-0">Choose how patient IDs are generated</p>
                         </div>
                    </div>

                    <div className="row g-3">
                         <div className="col-md-6">
                              <Form.Check
                                   type="radio"
                                   id="pid-method-region"
                                   name="patientIdGenerationMethod"
                                   value="region"
                                   label="Region + Auto-increment"
                                   checked={settings.patientIdGenerationMethod === 'region'}
                                   onChange={handleChange}
                              />
                              <div className="mt-2 ms-3">
                                   <Form.Label className="small text-muted">Region</Form.Label>
                                   <Form.Select
                                        name="regioncode"
                                        value={settings.regioncode || ''}
                                        onChange={handleChange}
                                   >
                                        <option value="">Select region</option>
                                        {regions.map(region => (
                                             <option key={region.regioncode} value={region.regioncode}>{region.name}</option>
                                        ))}
                                   </Form.Select>
                                   <Form.Label className="small text-muted mt-2">Start Value</Form.Label>
                                   <Form.Control
                                        type="number"
                                        name="patientIdAutoIncrementStart"
                                        value={settings.patientIdAutoIncrementStart || 1}
                                        onChange={handleChange}
                                        min={1}
                                   />
                                   <Form.Label className="small text-muted mt-2">District</Form.Label>
                                   <Form.Select
                                        name="districtcode"
                                        value={settings.districtcode || ''}
                                        onChange={handleChange}
                                        disabled={!settings.regioncode}
                                   >
                                        <option value="">Select district</option>
                                        {districts.map(d => (
                                             <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                   </Form.Select>
                              </div>
                         </div>

                         <div className="col-md-6">
                              <Form.Check
                                   type="radio"
                                   id="pid-method-billing"
                                   name="patientIdGenerationMethod"
                                   value="billingPrefix"
                                   label="Billing ID Prefix + Date (YY-MM-DD)"
                                   checked={settings.patientIdGenerationMethod === 'billingPrefix'}
                                   onChange={handleChange}
                              />
                              <div className="mt-2 ms-3">
                                   <Form.Text className="text-muted small">
                                        Uses the Billing ID prefix followed by the date (YY-MM-DD) as the patient ID.
                                   </Form.Text>
                              </div>
                         </div>
                    </div>

                    {/* Patient ID Preview */}
                    <div className="mt-4">
                         <Form.Label className="text-muted small">Patient ID Preview</Form.Label>
                         <div
                              className="border rounded p-3"
                              style={{
                                   backgroundColor: 'var(--bs-body-bg)',
                                   minHeight: '56px',
                                   display: 'flex',
                                   alignItems: 'center',
                                   fontSize: '1.25rem',
                                   fontFamily: 'monospace'
                              }}
                         >
                              {getPatientIdPreview(settings)}
                         </div>
                    </div>
               </div>

               {/* Settings Groups */}
               <div className="row g-4">
                    {settingsGroups.map((group, groupIndex) => (
                         <div key={groupIndex} className="col-12">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-4">
                                        <div style={{ color: group.color }}>
                                             {group.icon}
                                        </div>
                                        <div className="ms-3">
                                             <h5 className="mb-1 fw-bold">{group.title}</h5>
                                             <p className="text-muted small mb-0">{group.description}</p>
                                        </div>
                                   </div>

                                   <div className="row g-3">
                                        {group.settings.map((setting, index) => {
                                             const isEnabled = settings[setting.name as keyof ApplicationSettingsData] === 1;
                                             return (
                                                  <div key={index} className="col-md-4">
                                                       <div
                                                            className="border rounded p-3 h-100"
                                                            style={{
                                                                 backgroundColor: isEnabled ? 'oklch(0.95 0.02 142.5)' : 'var(--bs-body-bg)',
                                                                 borderColor: isEnabled ? 'oklch(0.8 0.15 142.5)' : 'var(--bs-border-color)',
                                                                 transition: 'all 0.2s'
                                                            }}
                                                       >
                                                            <div className="d-flex align-items-start justify-content-between mb-2">
                                                                 <div style={{ color: group.color }}>
                                                                      {setting.icon}
                                                                 </div>
                                                                 <Form.Check
                                                                      type="switch"
                                                                      id={`switch-${setting.name}`}
                                                                      name={setting.name}
                                                                      checked={isEnabled}
                                                                      onChange={handleChange}
                                                                      style={{
                                                                           transform: 'scale(1.2)'
                                                                      }}
                                                                 />
                                                            </div>
                                                            <h6 className="fw-semibold mb-2" style={{ fontSize: '0.95rem' }}>
                                                                 {setting.label}
                                                            </h6>
                                                            <p className="text-muted small mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                                 {setting.description}
                                                            </p>
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     );
};
