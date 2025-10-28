"use client"
import React, { useState } from 'react';
import { Button, ProgressBar, Form, Tab, Tabs } from 'react-bootstrap';
import {
     RiUserLine,
     RiBuildingLine,
     RiPhoneLine,
     RiMailLine,
     RiMapPinLine,
     RiFileTextLine,
     RiSettingsLine,
     RiMoneyDollarCircleLine,
     RiHospitalLine,
     RiTestTubeLine,
     RiPulseLine,
     RiSyringeLine,
     RiMicroscopeLine
} from '@remixicon/react';

interface OnboardingData {
     // Step 1: Basic Information
     companyName: string;
     contactPerson: string;
     contactTitle: string;
     email: string;
     phone: string;
     address: string;
     city: string;
     state: string;
     zipCode: string;
     country: string;
     website: string;

     // Step 2: Organization Details
     organizationType: string;
     industry: string;
     facilitySize: string;
     employeeCount: string;
     licenseNumber: string;
     accreditation: string;

     // Step 3: Service Requirements
     services: string[];
     testTypes: string[];
     sampleVolume: string;
     reportingFrequency: string;
     specialRequirements: string;

     // Step 4: Technical Setup
     integrationNeeds: string[];
     dataFormat: string;
     securityRequirements: string;
     apiAccess: boolean;
     trainingRequired: boolean;

     // Step 5: Billing & Contracts
     billingCycle: string;
     paymentTerms: string;
     contractLength: string;
     specialPricing: string;
     notes: string;
}

const initialData: OnboardingData = {
     companyName: '',
     contactPerson: '',
     contactTitle: '',
     email: '',
     phone: '',
     address: '',
     city: '',
     state: '',
     zipCode: '',
     country: 'USA',
     website: '',

     organizationType: '',
     industry: '',
     facilitySize: '',
     employeeCount: '',
     licenseNumber: '',
     accreditation: '',

     services: [],
     testTypes: [],
     sampleVolume: '',
     reportingFrequency: '',
     specialRequirements: '',

     integrationNeeds: [],
     dataFormat: '',
     securityRequirements: '',
     apiAccess: false,
     trainingRequired: false,

     billingCycle: '',
     paymentTerms: '',
     contractLength: '',
     specialPricing: '',
     notes: ''
};

export default function ClientOnboardingPage() {
     const [activeTab, setActiveTab] = useState('basic');
     const [formData, setFormData] = useState<OnboardingData>(initialData);
     const [errors, setErrors] = useState<Record<string, string>>({});
     const [isSubmitting, setIsSubmitting] = useState(false);

     const tabs = [
          { key: 'basic', title: 'Basic Info', icon: RiUserLine },
          { key: 'organization', title: 'Organization', icon: RiBuildingLine },
          { key: 'services', title: 'Services', icon: RiTestTubeLine },
          { key: 'technical', title: 'Technical', icon: RiSettingsLine },
          { key: 'billing', title: 'Billing', icon: RiMoneyDollarCircleLine }
     ];

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          if (type === 'checkbox') {
               if (name === 'apiAccess' || name === 'trainingRequired') {
                    setFormData(prev => ({ ...prev, [name]: checked }));
               } else if (name.startsWith('service-')) {
                    const serviceValue = name.replace('service-', '');
                    setFormData(prev => ({
                         ...prev,
                         services: checked
                              ? [...prev.services, serviceValue]
                              : prev.services.filter(s => s !== serviceValue)
                    }));
               } else if (name.startsWith('test-')) {
                    const testValue = name.replace('test-', '');
                    setFormData(prev => ({
                         ...prev,
                         testTypes: checked
                              ? [...prev.testTypes, testValue]
                              : prev.testTypes.filter(t => t !== testValue)
                    }));
               } else if (name.startsWith('integration-')) {
                    const integrationValue = name.replace('integration-', '');
                    setFormData(prev => ({
                         ...prev,
                         integrationNeeds: checked
                              ? [...prev.integrationNeeds, integrationValue]
                              : prev.integrationNeeds.filter(i => i !== integrationValue)
                    }));
               }
          } else {
               setFormData(prev => ({ ...prev, [name]: value }));
          }

          // Clear error when user starts typing
          if (errors[name]) {
               setErrors(prev => ({ ...prev, [name]: '' }));
          }
     };

     const validateTab = (tabKey: string): boolean => {
          const newErrors: Record<string, string> = {};

          switch (tabKey) {
               case 'basic':
                    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
                    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
                    if (!formData.email.trim()) newErrors.email = 'Email is required';
                    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
                    if (!formData.address.trim()) newErrors.address = 'Address is required';
                    if (!formData.city.trim()) newErrors.city = 'City is required';
                    if (!formData.state.trim()) newErrors.state = 'State is required';
                    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
                    break;

               case 'organization':
                    if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
                    if (!formData.industry) newErrors.industry = 'Industry is required';
                    if (!formData.facilitySize) newErrors.facilitySize = 'Facility size is required';
                    break;

               case 'services':
                    if (formData.services.length === 0) newErrors.services = 'At least one service must be selected';
                    if (formData.testTypes.length === 0) newErrors.testTypes = 'At least one test type must be selected';
                    if (!formData.sampleVolume) newErrors.sampleVolume = 'Sample volume is required';
                    break;

               case 'technical':
                    if (!formData.dataFormat) newErrors.dataFormat = 'Data format preference is required';
                    break;

               case 'billing':
                    if (!formData.billingCycle) newErrors.billingCycle = 'Billing cycle is required';
                    if (!formData.paymentTerms) newErrors.paymentTerms = newErrors.paymentTerms = 'Payment terms are required';
                    break;
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleTabChange = (key: string | null) => {
          if (key && validateTab(activeTab)) {
               setActiveTab(key);
          }
     };

     const handleSubmit = async () => {
          if (!validateTab(activeTab)) return;

          setIsSubmitting(true);
          try {
               // Here you would typically send the data to your API
               console.log('Submitting onboarding data:', formData);

               // Simulate API call
               await new Promise(resolve => setTimeout(resolve, 2000));

               alert('Client onboarding completed successfully!');
               // Reset form or redirect
               setFormData(initialData);
               setActiveTab('basic');
          } catch (error) {
               console.error('Error submitting onboarding:', error);
               alert('Error submitting onboarding. Please try again.');
          } finally {
               setIsSubmitting(false);
          }
     };

     const renderTabContent = () => {
          switch (activeTab) {
               case 'basic':
                    return (
                         <div>
                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiBuildingLine size={16} className="me-2" />
                                        Company Name *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="companyName"
                                             value={formData.companyName}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.companyName}
                                             placeholder="Enter company name"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.companyName}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiUserLine size={16} className="me-2" />
                                        Contact Person *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="contactPerson"
                                             value={formData.contactPerson}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.contactPerson}
                                             placeholder="Full name"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.contactPerson}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiUserLine size={16} className="me-2" />
                                        Contact Title
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="contactTitle"
                                             value={formData.contactTitle}
                                             onChange={handleInputChange}
                                             placeholder="Job title"
                                        />
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMailLine size={16} className="me-2" />
                                        Email Address *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="email"
                                             name="email"
                                             value={formData.email}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.email}
                                             placeholder="email@company.com"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiPhoneLine size={16} className="me-2" />
                                        Phone Number *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="tel"
                                             name="phone"
                                             value={formData.phone}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.phone}
                                             placeholder="(555) 123-4567"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        Website
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="url"
                                             name="website"
                                             value={formData.website}
                                             onChange={handleInputChange}
                                             placeholder="https://www.company.com"
                                        />
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMapPinLine size={16} className="me-2" />
                                        Street Address *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="address"
                                             value={formData.address}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.address}
                                             placeholder="123 Main Street"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMapPinLine size={16} className="me-2" />
                                        City *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="city"
                                             value={formData.city}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.city}
                                             placeholder="City"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMapPinLine size={16} className="me-2" />
                                        State *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="state"
                                             value={formData.state}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.state}
                                             placeholder="State"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMapPinLine size={16} className="me-2" />
                                        ZIP Code *
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="zipCode"
                                             value={formData.zipCode}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.zipCode}
                                             placeholder="12345"
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.zipCode}</Form.Control.Feedback>
                                   </div>
                              </div>
                         </div>
                    );

               case 'organization':
                    return (
                         <div>
                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiBuildingLine size={16} className="me-2" />
                                        Organization Type *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="organizationType"
                                             value={formData.organizationType}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.organizationType}
                                        >
                                             <option value="">Select type...</option>
                                             <option value="hospital">Hospital</option>
                                             <option value="clinic">Clinic</option>
                                             <option value="laboratory">Independent Laboratory</option>
                                             <option value="research">Research Facility</option>
                                             <option value="pharmacy">Pharmacy</option>
                                             <option value="other">Other</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.organizationType}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiHospitalLine size={16} className="me-2" />
                                        Industry *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="industry"
                                             value={formData.industry}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.industry}
                                        >
                                             <option value="">Select industry...</option>
                                             <option value="healthcare">Healthcare</option>
                                             <option value="pharmaceutical">Pharmaceutical</option>
                                             <option value="biotechnology">Biotechnology</option>
                                             <option value="research">Research & Development</option>
                                             <option value="veterinary">Veterinary</option>
                                             <option value="environmental">Environmental Testing</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.industry}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiBuildingLine size={16} className="me-2" />
                                        Facility Size *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="facilitySize"
                                             value={formData.facilitySize}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.facilitySize}
                                        >
                                             <option value="">Select size...</option>
                                             <option value="small">Small (1-50 beds/patients)</option>
                                             <option value="medium">Medium (51-200 beds/patients)</option>
                                             <option value="large">Large (201-500 beds/patients)</option>
                                             <option value="enterprise">Enterprise (500+ beds/patients)</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.facilitySize}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiUserLine size={16} className="me-2" />
                                        Employee Count
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="employeeCount"
                                             value={formData.employeeCount}
                                             onChange={handleInputChange}
                                        >
                                             <option value="">Select range...</option>
                                             <option value="1-10">1-10 employees</option>
                                             <option value="11-50">11-50 employees</option>
                                             <option value="51-200">51-200 employees</option>
                                             <option value="201-500">201-500 employees</option>
                                             <option value="500+">500+ employees</option>
                                        </Form.Select>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        License Number
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="licenseNumber"
                                             value={formData.licenseNumber}
                                             onChange={handleInputChange}
                                             placeholder="CLIA, CAP, or other license number"
                                        />
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Accreditation
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="accreditation"
                                             value={formData.accreditation}
                                             onChange={handleInputChange}
                                             placeholder="CAP, Joint Commission, etc."
                                        />
                                   </div>
                              </div>
                         </div>
                    );

               case 'services':
                    return (
                         <div>
                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiTestTubeLine size={16} className="me-2" />
                                        Services Required *
                                   </label>
                                   <div>
                                        {errors.services && <div className="text-danger small mb-2">{errors.services}</div>}
                                        <div className="row">
                                             {[
                                                  { value: 'chemistry', label: 'Clinical Chemistry' },
                                                  { value: 'hematology', label: 'Hematology', icon: RiTestTubeLine },
                                                  { value: 'microbiology', label: 'Microbiology', icon: RiMicroscopeLine },
                                                  { value: 'immunology', label: 'Immunology', icon: RiSyringeLine },
                                                  { value: 'pathology', label: 'Pathology', icon: RiFileTextLine },
                                                  { value: 'imaging', label: 'Medical Imaging', icon: RiPulseLine }
                                             ].map(({ value, label, icon: Icon }) => (
                                                  <div key={value} className="col-md-6 mb-2">
                                                       <Form.Check
                                                            type="checkbox"
                                                            id={`service-${value}`}
                                                            name={`service-${value}`}
                                                            label={label}
                                                            checked={formData.services.includes(value)}
                                                            onChange={handleInputChange}
                                                       />
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiTestTubeLine size={16} className="me-2" />
                                        Test Types *
                                   </label>
                                   <div>
                                        {errors.testTypes && <div className="text-danger small mb-2">{errors.testTypes}</div>}
                                        <div className="row">
                                             {[
                                                  'Blood Tests', 'Urine Analysis', 'Tissue Biopsy', 'Molecular Diagnostics',
                                                  'Drug Screening', 'Allergy Testing', 'Hormone Panels', 'Infectious Disease'
                                             ].map(test => (
                                                  <div key={test} className="col-md-6 mb-2">
                                                       <Form.Check
                                                            type="checkbox"
                                                            id={`test-${test}`}
                                                            name={`test-${test}`}
                                                            label={test}
                                                            checked={formData.testTypes.includes(test)}
                                                            onChange={handleInputChange}
                                                       />
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiTestTubeLine size={16} className="me-2" />
                                        Expected Sample Volume *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="sampleVolume"
                                             value={formData.sampleVolume}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.sampleVolume}
                                        >
                                             <option value="">Select volume...</option>
                                             <option value="low">Low (1-50 samples/day)</option>
                                             <option value="medium">Medium (51-200 samples/day)</option>
                                             <option value="high">High (201-500 samples/day)</option>
                                             <option value="enterprise">Enterprise (500+ samples/day)</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.sampleVolume}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Reporting Frequency
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="reportingFrequency"
                                             value={formData.reportingFrequency}
                                             onChange={handleInputChange}
                                        >
                                             <option value="">Select frequency...</option>
                                             <option value="real-time">Real-time</option>
                                             <option value="daily">Daily</option>
                                             <option value="weekly">Weekly</option>
                                             <option value="monthly">Monthly</option>
                                        </Form.Select>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Special Requirements
                                   </label>
                                   <div>
                                        <Form.Control
                                             as="textarea"
                                             rows={3}
                                             name="specialRequirements"
                                             value={formData.specialRequirements}
                                             onChange={handleInputChange}
                                             placeholder="Any special equipment, certifications, or requirements..."
                                        />
                                   </div>
                              </div>
                         </div>
                    );

               case 'technical':
                    return (
                         <div>
                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiSettingsLine size={16} className="me-2" />
                                        Integration Needs
                                   </label>
                                   <div>
                                        <div className="row">
                                             {[
                                                  'EHR/EMR Integration', 'LIS Integration', 'API Integration',
                                                  'HL7 Interface', 'Web Portal Access', 'Mobile App Access'
                                             ].map(integration => (
                                                  <div key={integration} className="col-md-6 mb-2">
                                                       <Form.Check
                                                            type="checkbox"
                                                            id={`integration-${integration}`}
                                                            name={`integration-${integration}`}
                                                            label={integration}
                                                            checked={formData.integrationNeeds.includes(integration)}
                                                            onChange={handleInputChange}
                                                       />
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Preferred Data Format *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="dataFormat"
                                             value={formData.dataFormat}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.dataFormat}
                                        >
                                             <option value="">Select format...</option>
                                             <option value="pdf">PDF Reports</option>
                                             <option value="hl7">HL7</option>
                                             <option value="json">JSON API</option>
                                             <option value="xml">XML</option>
                                             <option value="csv">CSV Export</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.dataFormat}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiSettingsLine size={16} className="me-2" />
                                        Security Requirements
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="securityRequirements"
                                             value={formData.securityRequirements}
                                             onChange={handleInputChange}
                                        >
                                             <option value="">Select requirements...</option>
                                             <option value="standard">Standard HIPAA Compliance</option>
                                             <option value="enhanced">Enhanced Security (SOC 2)</option>
                                             <option value="maximum">Maximum Security (FedRAMP)</option>
                                        </Form.Select>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiSettingsLine size={16} className="me-2" />
                                        Additional Options
                                   </label>
                                   <div>
                                        <div className="mb-2">
                                             <Form.Check
                                                  type="checkbox"
                                                  id="apiAccess"
                                                  name="apiAccess"
                                                  label="API Access Required"
                                                  checked={formData.apiAccess}
                                                  onChange={handleInputChange}
                                             />
                                        </div>
                                        <div>
                                             <Form.Check
                                                  type="checkbox"
                                                  id="trainingRequired"
                                                  name="trainingRequired"
                                                  label="Staff Training Required"
                                                  checked={formData.trainingRequired}
                                                  onChange={handleInputChange}
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    );

               case 'billing':
                    return (
                         <div>
                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMoneyDollarCircleLine size={16} className="me-2" />
                                        Billing Cycle *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="billingCycle"
                                             value={formData.billingCycle}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.billingCycle}
                                        >
                                             <option value="">Select cycle...</option>
                                             <option value="monthly">Monthly</option>
                                             <option value="quarterly">Quarterly</option>
                                             <option value="annually">Annually</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.billingCycle}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMoneyDollarCircleLine size={16} className="me-2" />
                                        Payment Terms *
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="paymentTerms"
                                             value={formData.paymentTerms}
                                             onChange={handleInputChange}
                                             isInvalid={!!errors.paymentTerms}
                                        >
                                             <option value="">Select terms...</option>
                                             <option value="net15">Net 15 days</option>
                                             <option value="net30">Net 30 days</option>
                                             <option value="net45">Net 45 days</option>
                                             <option value="net60">Net 60 days</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.paymentTerms}</Form.Control.Feedback>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Contract Length
                                   </label>
                                   <div>
                                        <Form.Select
                                             name="contractLength"
                                             value={formData.contractLength}
                                             onChange={handleInputChange}
                                        >
                                             <option value="">Select length...</option>
                                             <option value="month-to-month">Month-to-Month</option>
                                             <option value="6months">6 Months</option>
                                             <option value="1year">1 Year</option>
                                             <option value="2years">2 Years</option>
                                             <option value="3years">3 Years</option>
                                        </Form.Select>
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiMoneyDollarCircleLine size={16} className="me-2" />
                                        Special Pricing Requests
                                   </label>
                                   <div>
                                        <Form.Control
                                             type="text"
                                             name="specialPricing"
                                             value={formData.specialPricing}
                                             onChange={handleInputChange}
                                             placeholder="Volume discounts, etc."
                                        />
                                   </div>
                              </div>

                              <div className="form-row grid-reg mb-3">
                                   <label className="pls-label">
                                        <RiFileTextLine size={16} className="me-2" />
                                        Additional Notes
                                   </label>
                                   <div>
                                        <Form.Control
                                             as="textarea"
                                             rows={3}
                                             name="notes"
                                             value={formData.notes}
                                             onChange={handleInputChange}
                                             placeholder="Any additional information or special considerations..."
                                        />
                                   </div>
                              </div>

                              <div className="mt-4 p-3 bg-light rounded">
                                   <div className="d-flex align-items-start">
                                        <RiFileTextLine className="text-primary me-2 mt-1" size={16} />
                                        <div>
                                             <h6 className="fw-bold mb-2">Review Your Information</h6>
                                             <p className="mb-0 small text-muted">
                                                  Please review all entered information before submitting.
                                                  Our team will contact you within 24 hours to discuss next steps and pricing.
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    );

               default:
                    return null;
          }
     };

     return (
          <div className="container-fluid">
               <div className="border border-1 br-5 bg-white p-4">
                    <div className="d-flex align-items-center mb-4">
                         <h4 className="mb-0 fw-bold">Client Onboarding</h4>
                    </div>

                    <Tabs
                         activeKey={activeTab}
                         onSelect={handleTabChange}
                         className="mb-4"
                    >
                         {tabs.map(({ key, title, icon: Icon }) => (
                              <Tab
                                   key={key}
                                   eventKey={key}
                                   title={
                                        <span className="d-flex align-items-center">
                                             <Icon size={16} className="me-2" />
                                             {title}
                                        </span>
                                   }
                              />
                         ))}
                    </Tabs>

                    {/* Form Content */}
                    <div className="mb-4">
                         {renderTabContent()}
                    </div>

                    {/* Submit Button */}
                    <div className="d-flex justify-content-end pt-4 border-top">
                         <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="d-flex align-items-center"
                         >
                              {isSubmitting ? (
                                   <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                        Submitting...
                                   </>
                              ) : (
                                   <>
                                        Complete Onboarding
                                   </>
                              )}
                         </Button>
                    </div>
               </div>
          </div>
     );
}