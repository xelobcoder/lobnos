'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Tab, Tabs, ProgressBar, Alert, Modal, Row, Col } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../components/isLoading';
import dayjs from 'dayjs';

interface Submission {
     id: string;
     regulatoryBody: string;
     submissionType: string;
     title: string;
     description: string;
     status: 'draft' | 'validating' | 'submitted' | 'approved' | 'rejected';
     submittedAt?: string;
     approvedAt?: string;
     data: Record<string, any>;
     attachments?: string[];
     trackingNumber?: string;
     auditTrail?: AuditEntry[];
     apiResponse?: any;
     validationErrors?: string[];
}

interface AuditEntry {
     id: string;
     timestamp: string;
     action: string;
     user: string;
     details: string;
     status?: string;
}

interface RegulatoryBody {
     id: string;
     name: string;
     acronym: string;
     description: string;
     submissionTypes: string[];
     requiredFields: string[];
     apiEndpoint?: string;
}

const regulatoryBodies: RegulatoryBody[] = [
     {
          id: 'fda',
          name: 'Food and Drug Administration',
          acronym: 'FDA',
          description: 'Adverse event reporting, device malfunction reports',
          submissionTypes: ['Adverse Event Report', 'Device Malfunction Report', 'Safety Report'],
          requiredFields: ['event_description', 'affected_devices', 'patient_info', 'facility_info']
     },
     {
          id: 'clia',
          name: 'Clinical Laboratory Improvement Amendments',
          acronym: 'CLIA',
          description: 'Proficiency testing results, quality metrics',
          submissionTypes: ['Proficiency Testing Results', 'Quality Metrics Report', 'Certification Renewal'],
          requiredFields: ['test_results', 'quality_metrics', 'certification_info']
     },
     {
          id: 'cap',
          name: 'College of American Pathologists',
          acronym: 'CAP',
          description: 'Accreditation compliance reports, inspection preparation',
          submissionTypes: ['Accreditation Report', 'Inspection Preparation', 'Proficiency Testing'],
          requiredFields: ['inspection_results', 'proficiency_scores', 'compliance_status']
     },
     {
          id: 'cms',
          name: 'Centers for Medicare & Medicaid Services',
          acronym: 'CMS',
          description: 'Medicare/Medicaid compliance reporting',
          submissionTypes: ['Compliance Report', 'Billing Audit', 'Quality Measures'],
          requiredFields: ['billing_data', 'quality_measures', 'compliance_status']
     },
     {
          id: 'state-lab',
          name: 'State Laboratory Licensing',
          acronym: 'State',
          description: 'Laboratory licensing renewals',
          submissionTypes: ['License Renewal', 'Compliance Report', 'Inspection Report'],
          requiredFields: ['license_info', 'inspection_results', 'compliance_status']
     }
];

export default function RegulatorySubmissionsPage() {
     const [submissions, setSubmissions] = useState<Submission[]>([]);
     const [loading, setLoading] = useState(true);
     const [selectedBody, setSelectedBody] = useState<RegulatoryBody | null>(null);
     const [formData, setFormData] = useState<Record<string, any>>({});
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [validationProgress, setValidationProgress] = useState(0);

     // Fetch submissions from API
     useEffect(() => {
          const fetchSubmissions = async () => {
               try {
                    setLoading(true);
                    const response = await customFetch('compliance/submissions?page=1&count=10');
                    if (Array.isArray(response)) {
                         setSubmissions(response);
                    } else {
                         setSubmissions([]);
                    }
               } catch (error) {
                    setSubmissions([]);
                    toast.error('Failed to load submissions');
               } finally {
                    setLoading(false);
               }
          };
          fetchSubmissions();
     }, []);

     const handleBodySelect = (bodyId: string) => {
          const body = regulatoryBodies.find(b => b.id === bodyId);
          setSelectedBody(body || null);
          setFormData({});
     };

     const handleFieldChange = (field: string, value: any) => {
          setFormData(prev => ({ ...prev, [field]: value }));
     };

     const validateSubmission = async () => {
          if (!selectedBody) return false;

          setValidationProgress(0);
          const totalFields = selectedBody.requiredFields.length;
          let completedFields = 0;

          for (const field of selectedBody.requiredFields) {
               if (formData[field]) {
                    completedFields++;
               }
               setValidationProgress((completedFields / totalFields) * 100);
               await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation time
          }

          return completedFields === totalFields;
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedBody) return;

          setIsSubmitting(true);
          setValidationProgress(0);

          try {
               // Validate required fields
               const isValid = await validateSubmission();
               if (!isValid) {
                    toast.warning('Please complete all required fields before submitting.');
                    return;
               }

               // Create initial submission record
               const newSubmission: Submission = {
                    id: `SUB-${Date.now()}`,
                    regulatoryBody: selectedBody.acronym,
                    submissionType: formData.submissionType || selectedBody.submissionTypes[0],
                    title: formData.title || `${selectedBody.acronym} ${formData.submissionType}`,
                    description: formData.description || '',
                    status: 'validating',
                    submittedAt: new Date().toISOString(),
                    data: formData,
                    auditTrail: []
               };

               // Add audit entry for submission start
               addAuditEntry(newSubmission.id, 'Submission Started', `Initiated submission to ${selectedBody.name}`, 'validating');

               // Submit to regulatory API
               const apiResult = await submitToRegulatoryAPI(selectedBody, formData);

               if (apiResult.success) {
                    // Update submission with API response
                    newSubmission.status = 'submitted';
                    newSubmission.trackingNumber = apiResult.trackingNumber;
                    newSubmission.apiResponse = apiResult.apiResponse;

                    // Add audit entry for successful submission
                    addAuditEntry(newSubmission.id, 'API Submission Successful', `Successfully submitted to ${selectedBody.name}. Tracking: ${apiResult.trackingNumber}`, 'submitted');

                    setSubmissions(prev => [newSubmission, ...prev]);
                    toast.success(`Submission to ${selectedBody.name} completed successfully! Tracking: ${newSubmission.trackingNumber}`);
               } else {
                    // Handle API submission failure
                    newSubmission.status = 'draft';
                    newSubmission.validationErrors = [apiResult.error || 'API submission failed'];

                    // Add audit entry for failed submission
                    addAuditEntry(newSubmission.id, 'API Submission Failed', `Failed to submit to ${selectedBody.name}: ${apiResult.error}`, 'draft');

                    setSubmissions(prev => [newSubmission, ...prev]);
                    toast.error(`Failed to submit to ${selectedBody.name}: ${apiResult.error}`);
               }

               // Reset form
               setFormData({});
               setSelectedBody(null);
               setValidationProgress(0);

          } catch (error) {
               toast.error('Error submitting regulatory report. Please try again.');
          } finally {
               setIsSubmitting(false);
          }
     };

     const getStatusBadge = (status: string) => {
          const statusConfig = {
               draft: 'secondary',
               validating: 'info',
               submitted: 'warning',
               approved: 'success',
               rejected: 'danger'
          };

          const variant = statusConfig[status as keyof typeof statusConfig] || 'secondary';
          return <Badge bg={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
     };

     const submissionColumns = [
          { Header: 'ID', accessor: 'id' },
          { Header: 'Title', accessor: 'title' },
          { Header: 'Regulatory Body', accessor: 'regulatoryBody' },
          { Header: 'Submission Type', accessor: 'submissionType' },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => getStatusBadge(value)
          },
          {
               Header: 'Submitted Date',
               accessor: 'submittedAt',
               Cell: ({ value }: { value: string }) => value ? dayjs(value).format('DD MMM YYYY') : '-'
          },
          {
               Header: 'Tracking Number',
               accessor: 'trackingNumber',
               Cell: ({ value }: { value: string }) => value || '-'
          }
     ];

     const handleSeverSideProcessing = async ({ page, count, sortby = 'DESC' }: { page: number, count: number, sortby: 'ASC' | 'DESC' }): Promise<{ result?: any[], error: boolean }> => {
          try {
               const response = await customFetch(`compliance/submissions?page=${page}&count=${count}&sortby=${sortby}`);
               if (response && Array.isArray(response)) {
                    return { result: response, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               return { result: [], error: true };
          }
     };

     const submitToRegulatoryAPI = async (body: RegulatoryBody, submissionData: any) => {
          // Simulate API calls to different regulatory bodies
          const apiEndpoints = {
               fda: 'https://api.fda.gov/submissions',
               clia: 'https://api.cms.gov/clia/submissions',
               cap: 'https://api.cap.org/submissions',
               cms: 'https://api.cms.gov/medicare/submissions',
               'state-lab': 'https://api.state.lab.gov/submissions'
          };

          const endpoint = apiEndpoints[body.id as keyof typeof apiEndpoints];

          try {
               // In a real implementation, this would make actual API calls
               const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${process.env.NEXT_PUBLIC_REGULATORY_API_KEY}`
                    },
                    body: JSON.stringify({
                         submissionType: submissionData.submissionType,
                         data: submissionData,
                         facilityId: 'LAB-001', // Would come from user context
                         timestamp: new Date().toISOString()
                    })
               });

               if (!response.ok) {
                    throw new Error(`API submission failed: ${response.statusText}`);
               }

               const result = await response.json();
               return {
                    success: true,
                    trackingNumber: result.trackingNumber || `${body.acronym}-${Date.now()}`,
                    apiResponse: result
               };
          } catch (error) {
               console.error(`Failed to submit to ${body.name}:`, error);
               return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
               };
          }
     };

     const addAuditEntry = (submissionId: string, action: string, details: string, status?: string) => {
          const auditEntry: AuditEntry = {
               id: `AUDIT-${Date.now()}`,
               timestamp: new Date().toISOString(),
               action,
               user: 'Current User', // Would come from auth context
               details,
               status
          };

          setSubmissions(prev => prev.map(sub =>
               sub.id === submissionId
                    ? { ...sub, auditTrail: [...(sub.auditTrail || []), auditEntry] }
                    : sub
          ));

          return auditEntry;
     };

     const collectAutomatedData = (bodyId: string) => {
          // Simulate automated data collection from laboratory systems
          const automatedData = {
               fda: {
                    facility_info: {
                         name: 'Advanced Diagnostic Laboratory',
                         clia_number: '12D1234567',
                         address: '123 Medical Center Dr, City, State 12345'
                    },
                    recent_incidents: submissions.filter(s => s.regulatoryBody === 'FDA').length,
                    quality_metrics: {
                         error_rate: '0.02%',
                         turnaround_time: '24 hours',
                         accuracy_rate: '99.8%'
                    }
               },
               clia: {
                    proficiency_results: {
                         chemistry: '100%',
                         hematology: '98%',
                         microbiology: '99%'
                    },
                    quality_metrics: {
                         internal_qc_pass_rate: '99.5%',
                         external_qc_pass_rate: '100%',
                         staff_competency: '95%'
                    }
               },
               cap: {
                    inspection_readiness: '95%',
                    proficiency_testing: {
                         overall_score: '98%',
                         areas_for_improvement: ['Documentation', 'Training Records']
                    },
                    accreditation_status: 'Fully Accredited'
               }
          };

          return automatedData[bodyId as keyof typeof automatedData] || {};
     };

     if (loading) return <Loader />;

     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="card-title fs-5 fw-bold text-dark">Regulatory Submission Workflows</h2>
                                   </div>
                                   <div className="flex-grow-1">

                                        <Tabs defaultActiveKey="create" className="mb-4">
                                             <Tab eventKey="create" title="Create Submission">
                                                  <div className="row g-3">
                                                       <div className="col-12">
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Select Regulatory Body</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <div className="row g-3">
                                                                           {regulatoryBodies.map(body => (
                                                                                <div key={body.id} className="col-md-6 col-lg-4">
                                                                                     <Card
                                                                                          className={`cursor-pointer ${selectedBody?.id === body.id ? 'border-primary' : ''}`}
                                                                                          onClick={() => handleBodySelect(body.id)}
                                                                                          style={{ cursor: 'pointer' }}
                                                                                     >
                                                                                          <Card.Body className="text-center">
                                                                                               <h5 className="card-title">{body.acronym}</h5>
                                                                                               <p className="card-text small">{body.name}</p>
                                                                                               <p className="card-text text-muted small">{body.description}</p>
                                                                                          </Card.Body>
                                                                                     </Card>
                                                                                </div>
                                                                           ))}
                                                                      </div>
                                                                 </Card.Body>
                                                            </Card>
                                                       </div>

                                                       {selectedBody && (
                                                            <div className="col-12">
                                                                 <Card>
                                                                      <Card.Header>
                                                                           <Card.Title>Submit to {selectedBody.name} ({selectedBody.acronym})</Card.Title>
                                                                      </Card.Header>
                                                                      <Card.Body>
                                                                           <Form onSubmit={handleSubmit}>
                                                                                <div className="form-row grid-reg mt-2">
                                                                                     <label className="pls-label">Submission Type</label>
                                                                                     <Form.Select
                                                                                          value={formData.submissionType || ''}
                                                                                          onChange={(e) => handleFieldChange('submissionType', e.target.value)}
                                                                                          required
                                                                                          className="custom-select"
                                                                                     >
                                                                                          <option value="">Select submission type</option>
                                                                                          {selectedBody.submissionTypes.map(type => (
                                                                                               <option key={type} value={type}>{type}</option>
                                                                                          ))}
                                                                                     </Form.Select>
                                                                                </div>
                                                                                <div className="form-row grid-reg mt-2">
                                                                                     <label className="pls-label">Title</label>
                                                                                     <Form.Control
                                                                                          type="text"
                                                                                          value={formData.title || ''}
                                                                                          onChange={(e) => handleFieldChange('title', e.target.value)}
                                                                                          placeholder="Submission title"
                                                                                          required
                                                                                          className="custom-input"
                                                                                     />
                                                                                </div>
                                                                                <div className="form-row mt-2">
                                                                                     <label className="pls-label">Description</label>
                                                                                     <Form.Control
                                                                                          as="textarea"
                                                                                          rows={3}
                                                                                          value={formData.description || ''}
                                                                                          onChange={(e) => handleFieldChange('description', e.target.value)}
                                                                                          placeholder="Detailed description of the submission"
                                                                                          required
                                                                                     />
                                                                                </div>

                                                                                <div className="mb-3">
                                                                                     <h5 className="fw-semibold">Required Information</h5>
                                                                                     {selectedBody.requiredFields.map(field => (
                                                                                          <div key={field} className="form-row grid-reg mt-2">
                                                                                               <label className="pls-label text-capitalize">{field.replace('_', ' ')} *</label>
                                                                                               {field.includes('description') || field.includes('info') ? (
                                                                                                    <Form.Control
                                                                                                         as="textarea"
                                                                                                         rows={3}
                                                                                                         value={formData[field] || ''}
                                                                                                         onChange={(e) => handleFieldChange(field, e.target.value)}
                                                                                                         placeholder={`Enter ${field.replace('_', ' ')}`}
                                                                                                         required
                                                                                                    />
                                                                                               ) : (
                                                                                                    <Form.Control
                                                                                                         type="text"
                                                                                                         value={formData[field] || ''}
                                                                                                         onChange={(e) => handleFieldChange(field, e.target.value)}
                                                                                                         placeholder={`Enter ${field.replace('_', ' ')}`}
                                                                                                         required
                                                                                                         className="custom-input"
                                                                                                    />
                                                                                               )}
                                                                                          </div>
                                                                                     ))}
                                                                                </div>

                                                                                <Form.Group className="mb-3">
                                                                                     <Form.Check
                                                                                          type="checkbox"
                                                                                          label="Collect automated data from laboratory systems"
                                                                                          onChange={(e) => {
                                                                                               if (e.target.checked) {
                                                                                                    const automatedData = collectAutomatedData(selectedBody.id);
                                                                                                    setFormData(prev => ({ ...prev, ...automatedData }));
                                                                                               }
                                                                                          }}
                                                                                     />
                                                                                </Form.Group>

                                                                                {validationProgress > 0 && (
                                                                                     <div className="mb-3">
                                                                                          <div className="d-flex justify-content-between mb-2">
                                                                                               <span>Validation Progress</span>
                                                                                               <span>{Math.round(validationProgress)}%</span>
                                                                                          </div>
                                                                                          <ProgressBar now={validationProgress} />
                                                                                     </div>
                                                                                )}

                                                                                <div className="d-flex gap-2 mt-4 justify-content-end">
                                                                                     <Button type="submit" disabled={isSubmitting} variant="primary" className="px-4">
                                                                                          {isSubmitting ? 'Submitting...' : `Submit to ${selectedBody.acronym}`}
                                                                                     </Button>
                                                                                </div>
                                                                           </Form>
                                                                      </Card.Body>
                                                                 </Card>
                                                            </div>
                                                       )}
                                                  </div>
                                             </Tab>

                                             <Tab eventKey="manage" title="Manage Submissions">
                                                  <PrimeTable
                                                       column={submissionColumns}
                                                       data={submissions}
                                                       filtering={true}
                                                       serverSideFiltering={true}
                                                       handleSeverSideProcessing={handleSeverSideProcessing}
                                                  />
                                             </Tab>

                                             <Tab eventKey="audit" title="Audit Trails">
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Submission Audit Trails</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            {submissions.length > 0 ? (
                                                                 <div className="space-y-4">
                                                                      {submissions.map(submission => (
                                                                           <Card key={submission.id} className="mb-3">
                                                                                <Card.Header>
                                                                                     <div className="d-flex justify-content-between align-items-center">
                                                                                          <div>
                                                                                               <h6 className="mb-1">{submission.title}</h6>
                                                                                               <small className="text-muted">
                                                                                                    {submission.regulatoryBody} - {submission.trackingNumber || 'No tracking number'}
                                                                                               </small>
                                                                                          </div>
                                                                                          {getStatusBadge(submission.status)}
                                                                                     </div>
                                                                                </Card.Header>
                                                                                <Card.Body>
                                                                                     {submission.auditTrail && submission.auditTrail.length > 0 ? (
                                                                                          <div className="timeline">
                                                                                               {submission.auditTrail.map((entry, index) => (
                                                                                                    <div key={entry.id} className="timeline-item">
                                                                                                         <div className="timeline-marker"></div>
                                                                                                         <div className="timeline-content">
                                                                                                              <div className="d-flex justify-content-between">
                                                                                                                   <strong>{entry.action}</strong>
                                                                                                                   <small className="text-muted">
                                                                                                                        {dayjs(entry.timestamp).format('DD MMM YYYY HH:mm')}
                                                                                                                   </small>
                                                                                                              </div>
                                                                                                              <p className="mb-1">{entry.details}</p>
                                                                                                              <div className="d-flex gap-2">
                                                                                                                   <small className="text-muted">By: {entry.user}</small>
                                                                                                                   {entry.status && (
                                                                                                                        <Badge bg="outline-secondary" className="small">
                                                                                                                             {entry.status}
                                                                                                                        </Badge>
                                                                                                                   )}
                                                                                                              </div>
                                                                                                         </div>
                                                                                                    </div>
                                                                                               ))}
                                                                                          </div>
                                                                                     ) : (
                                                                                          <p className="text-muted">No audit trail available</p>
                                                                                     )}
                                                                                </Card.Body>
                                                                           </Card>
                                                                      ))}
                                                                 </div>
                                                            ) : (
                                                                 <div className="text-center py-4">
                                                                      <p className="text-muted">No submissions found. Create a submission to view audit trails.</p>
                                                                 </div>
                                                            )}
                                                       </Card.Body>
                                                  </Card>
                                             </Tab>
                                        </Tabs>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}