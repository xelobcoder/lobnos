import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { store } from '../../../lib/store';
import { useApplication } from '../../../components/Auth/useApplicationContext';


interface ReportIncidentTabProps {
     onIncidentReported: (newIncident: any) => void;
}

const incidentTypes = [
     { value: 'patient-safety', label: 'Patient Safety', description: 'Wrong results, delayed reporting, misidentified samples' },
     { value: 'quality', label: 'Quality', description: 'Equipment failures, reagent issues, procedural errors' },
     { value: 'security', label: 'Security', description: 'Data breaches, unauthorized access, system failures' },
     { value: 'compliance', label: 'Compliance', description: 'Documentation errors, procedural violations' }
];

const severityLevels = [
     { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
     { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
     { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
     { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export default function ReportIncidentTab({ onIncidentReported }: ReportIncidentTabProps) {
     const employeeId = useApplication()?.user.employeeid;
     const [formData, setFormData] = useState({
          type: '',
          title: '',
          description: '',
          severity: '',
          affectedParties: '',
          location: '',
          immediateActions: ''
     });


     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);

          try {
               const incidentData = {
                    type: formData.type,
                    title: formData.title,
                    description: formData.description,
                    severity: formData.severity,
                    affectedParties: formData.affectedParties,
                    location: formData.location,
                    employeeId: employeeId,
                    immediateActions: formData.immediateActions
               };

               // Import customPost here to avoid circular dependencies
               const { customPost } = await import('../../../components/Auth/customFetch');

               const response = await customPost(`compliance/incidents?employeeId=${employeeId}`, 'POST', incidentData);

               if (response && response.success && response.data) {
                    // Add the new incident to the list
                    onIncidentReported(response.data);

                    // Reset form
                    setFormData({
                         type: '',
                         title: '',
                         description: '',
                         severity: '',
                         affectedParties: '',
                         location: '',
                         immediateActions: ''
                    });

                    toast.success('Incident reported successfully!');
               } else {
                    throw new Error('Invalid response from server');
               }
          } catch (error) {
               console.error('Error creating incident:', error);
               toast.error('Error reporting incident. Please try again.');
          } finally {
               setIsSubmitting(false);
          }
     };

     return (

          <Form onSubmit={handleSubmit}>
               <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Incident Type</label>
                    <Form.Select
                         value={formData.type}
                         onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                         required
                         className="custom-select"
                    >
                         <option value="">Select incident type</option>
                         {incidentTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                   {type.label}
                              </option>
                         ))}
                    </Form.Select>
               </div>
               <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Severity</label>
                    <Form.Select
                         value={formData.severity}
                         onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                         required
                         className="custom-select"
                    >
                         <option value="">Select severity</option>
                         {severityLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                   {level.label}
                              </option>
                         ))}
                    </Form.Select>
               </div>
               <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Title</label>
                    <Form.Control
                         type="text"
                         value={formData.title}
                         onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                         placeholder="Brief description of the incident"
                         required
                         className="custom-input"
                    />
               </div>
               <div className="form-row mt-2">
                    <label className="pls-label">Description</label>
                    <Form.Control
                         as="textarea"
                         rows={4}
                         value={formData.description}
                         onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                         placeholder="Detailed description of what happened"
                         required
                    />
               </div>
               <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Affected Parties</label>
                    <Form.Control
                         type="text"
                         value={formData.affectedParties}
                         onChange={(e) => setFormData(prev => ({ ...prev, affectedParties: e.target.value }))}
                         placeholder="Patients, staff, or systems affected"
                         className="custom-input"
                    />
               </div>
               <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Location</label>
                    <Form.Control
                         type="text"
                         value={formData.location}
                         onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                         placeholder="Lab section or department"
                         className="custom-input"
                    />
               </div>
               <div className="form-row mt-2">
                    <label className="pls-label">Immediate Actions Taken</label>
                    <Form.Control
                         as="textarea"
                         rows={3}
                         value={formData.immediateActions}
                         onChange={(e) => setFormData(prev => ({ ...prev, immediateActions: e.target.value }))}
                         placeholder="What was done immediately to contain the incident"
                    />
               </div>
               <div className="d-flex gap-2 mt-4 justify-content-end">
                    <Button type="submit" disabled={isSubmitting} variant="primary" className="px-4">
                         {isSubmitting ? 'Reporting...' : 'Report Incident'}
                    </Button>
               </div>
          </Form>
     );
}