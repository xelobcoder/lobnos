'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Tab, Tabs, Modal, Row, Col, Alert } from 'react-bootstrap';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../components/isLoading';
import dayjs from 'dayjs';

interface TrendAnalysis {
     title: string;
     description: string;
     frequency: number;
     impact: string;
}

interface MonthlyTrend {
     month: string;
     total: number;
     byType: Record<string, number>;
     trend: string;
}

interface Incident {
     id: string;
     type: 'patient-safety' | 'quality' | 'security' | 'compliance';
     title: string;
     description: string;
     severity: 'low' | 'medium' | 'high' | 'critical';
     status: 'reported' | 'investigating' | 'root-cause-analysis' | 'corrective-actions' | 'resolved' | 'closed';
     reportedBy: string;
     reportedAt: string;
     affectedParties?: string;
     location?: string;
     immediateActions?: string;
     rootCause?: string;
     rootCauseAnalysis?: {
          what: string;
          why: string;
          when: string;
          where: string;
          who: string;
          how: string;
     };
     correctiveActions?: string;
     correctiveActionPlan?: {
          actions: string[];
          responsible: string[];
          deadlines: string[];
          status: string[];
     };
     regulatoryReporting?: boolean;
     regulatoryBodies?: string[];
     escalatedTo?: string[];
     followUpDate?: string;
     resolutionDate?: string;
     attachments?: string[];
     investigationNotes?: string[];
}

const incidentTypes = [
     { value: 'patient-safety', label: 'Patient Safety', description: 'Wrong results, delayed reporting, misidentified samples' },
     { value: 'quality', label: 'Quality', description: 'Equipment failures, reagent issues, procedural errors' },
     { value: 'security', label: 'Security', description: 'Data breaches, unauthorized access, system failures' },
     { value: 'compliance', label: 'Compliance', description: 'Regulatory violations, documentation errors' }
];

const severityLevels = [
     { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
     { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
     { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
     { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const statusOptions = [
     { value: 'reported', label: 'Reported' },
     { value: 'investigating', label: 'Investigating' },
     { value: 'root-cause-analysis', label: 'Root Cause Analysis' },
     { value: 'corrective-actions', label: 'Corrective Actions' },
     { value: 'resolved', label: 'Resolved' },
     { value: 'closed', label: 'Closed' }
];

export default function IncidentReportingPage() {
     const [incidents, setIncidents] = useState<Incident[]>([]);
     const [loading, setLoading] = useState(true);
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
     const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [showInvestigationModal, setShowInvestigationModal] = useState(false);
     const [investigationData, setInvestigationData] = useState({
          rootCause: '',
          what: '',
          why: '',
          when: '',
          where: '',
          who: '',
          how: '',
          correctiveActions: '',
          actionPlan: [] as { action: string; responsible: string; deadline: string; status: string }[]
     });

     // Fetch incidents from API
     useEffect(() => {
          const fetchIncidents = async () => {
               try {
                    setLoading(true);
                    const response = await customFetch('compliance/incidents?page=1&count=10');
                    if (Array.isArray(response)) {
                         setIncidents(response);
                    } else {
                         setIncidents([]);
                    }
               } catch (error) {
                    setIncidents([]);
                    toast.error('Failed to load incidents');
               } finally {
                    setLoading(false);
               }
          };
          fetchIncidents();
     }, []);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);

          try {
               // In a real implementation, this would call an API
               const newIncident: Incident = {
                    id: `INC-${Date.now()}`,
                    type: formData.type as Incident['type'],
                    title: formData.title,
                    description: formData.description,
                    severity: formData.severity as Incident['severity'],
                    status: 'reported',
                    reportedBy: 'Current User', // Would get from auth context
                    reportedAt: new Date().toISOString(),
                    affectedParties: formData.affectedParties,
                    location: formData.location,
                    immediateActions: formData.immediateActions,
                    regulatoryReporting: formData.severity === 'critical' || formData.severity === 'high'
               };

               setIncidents(prev => [newIncident, ...prev]);
               setFormData({
                    type: '',
                    title: '',
                    description: '',
                    severity: '',
                    affectedParties: '',
                    location: '',
                    immediateActions: ''
               });

               // Trigger automated escalation for critical incidents
               if (newIncident.severity === 'critical' || newIncident.severity === 'high') {
                    const escalationTargets = automatedEscalation(newIncident);
                    newIncident.escalatedTo = escalationTargets;
                    toast.warning(`Critical incident reported! Escalated to: ${escalationTargets.join(', ')}`);
               }

               // Trigger regulatory reporting if required
               if (newIncident.regulatoryReporting) {
                    triggerRegulatoryReporting(newIncident);
               }

               toast.success('Incident reported successfully!');
          } catch (error) {
               toast.error('Error reporting incident. Please try again.');
          } finally {
               setIsSubmitting(false);
          }
     };

     const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
          setIncidents(prev =>
               prev.map(inc =>
                    inc.id === incidentId ? { ...inc, status: newStatus } : inc
               )
          );
     };

     const automatedEscalation = (incident: Incident) => {
          const escalationRules = {
               critical: ['management', 'regulatory-affairs', 'quality-manager'],
               high: ['supervisor', 'quality-manager'],
               medium: ['supervisor'],
               low: []
          };

          const escalationTargets = escalationRules[incident.severity] || [];
          return escalationTargets;
     };

     const triggerRegulatoryReporting = async (incident: Incident) => {
          if (!incident.regulatoryReporting) return;

          const regulatoryBodies: string[] = [];
          if (incident.type === 'patient-safety' && incident.severity === 'critical') {
               regulatoryBodies.push('FDA');
          }
          if (incident.type === 'quality') {
               regulatoryBodies.push('CLIA', 'CAP');
          }
          if (incident.type === 'compliance') {
               regulatoryBodies.push('CMS', 'State');
          }

          // Simulate API call to regulatory bodies
          for (const body of regulatoryBodies) {
               try {
                    await customPost(`compliance/regulatory-report`, 'POST', {
                         body: body,
                         incidentId: incident.id,
                         incidentData: incident
                    });
                    toast.success(`Regulatory report submitted to ${body}`);
               } catch (error) {
                    toast.error(`Failed to submit report to ${body}`);
               }
          }
     };

     const startInvestigation = (incident: Incident) => {
          setSelectedIncident(incident);
          setInvestigationData({
               rootCause: incident.rootCause || '',
               what: incident.rootCauseAnalysis?.what || '',
               why: incident.rootCauseAnalysis?.why || '',
               when: incident.rootCauseAnalysis?.when || '',
               where: incident.rootCauseAnalysis?.where || '',
               who: incident.rootCauseAnalysis?.who || '',
               how: incident.rootCauseAnalysis?.how || '',
               correctiveActions: incident.correctiveActions || '',
               actionPlan: incident.correctiveActionPlan?.actions.map((action, index) => ({
                    action,
                    responsible: incident.correctiveActionPlan?.responsible[index] || '',
                    deadline: incident.correctiveActionPlan?.deadlines[index] || '',
                    status: incident.correctiveActionPlan?.status[index] || 'pending'
               })) || []
          });
          setShowInvestigationModal(true);
     };

     const saveInvestigation = () => {
          if (!selectedIncident) return;

          const updatedIncident: Incident = {
               ...selectedIncident,
               rootCause: investigationData.rootCause,
               rootCauseAnalysis: {
                    what: investigationData.what,
                    why: investigationData.why,
                    when: investigationData.when,
                    where: investigationData.where,
                    who: investigationData.who,
                    how: investigationData.how
               },
               correctiveActions: investigationData.correctiveActions,
               correctiveActionPlan: {
                    actions: investigationData.actionPlan.map(item => item.action),
                    responsible: investigationData.actionPlan.map(item => item.responsible),
                    deadlines: investigationData.actionPlan.map(item => item.deadline),
                    status: investigationData.actionPlan.map(item => item.status)
               },
               status: 'corrective-actions'
          };

          setIncidents(prev =>
               prev.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc)
          );

          setShowInvestigationModal(false);
          toast.success('Investigation completed and corrective actions planned');
     };

     const addCorrectiveAction = () => {
          setInvestigationData(prev => ({
               ...prev,
               actionPlan: [...prev.actionPlan, { action: '', responsible: '', deadline: '', status: 'pending' }]
          }));
     };

     const updateCorrectiveAction = (index: number, field: string, value: string) => {
          setInvestigationData(prev => ({
               ...prev,
               actionPlan: prev.actionPlan.map((item, i) =>
                    i === index ? { ...item, [field]: value } : item
               )
          }));
     };

     const handleSeverSideProcessing = async ({ page, count, sortby = 'DESC' }: { page: number, count: number, sortby: 'ASC' | 'DESC' }): Promise<{ result?: any[], error: boolean }> => {
          try {
               const response = await customFetch(`compliance/incidents?page=${page}&count=${count}&sortby=${sortby}`);
               if (response && Array.isArray(response)) {
                    return { result: response, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               return { result: [], error: true };
          }
     };

     const getSeverityBadge = (severity: string) => {
          const level = severityLevels.find(l => l.value === severity);
          return level ? (
               <Badge bg={level.value === 'low' ? 'primary' : level.value === 'medium' ? 'warning' : level.value === 'high' ? 'danger' : 'dark'}>{level.label}</Badge>
          ) : null;
     };

     const incidentColumns = [
          { Header: 'ID', accessor: 'id' },
          { Header: 'Title', accessor: 'title' },
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ value }: { value: string }) => incidentTypes.find(t => t.value === value)?.label
          },
          {
               Header: 'Severity',
               accessor: 'severity',
               Cell: ({ value }: { value: string }) => getSeverityBadge(value)
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => (
                    <Badge bg={
                         value === 'reported' ? 'secondary' :
                              value === 'investigating' ? 'warning' :
                                   value === 'resolved' ? 'success' : 'dark'
                    }>
                         {statusOptions.find(o => o.value === value)?.label}
                    </Badge>
               )
          },
          {
               Header: 'Reported Date',
               accessor: 'reportedAt',
               Cell: ({ value }: { value: string }) => dayjs(value).format('DD MMM YYYY')
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               disableSortBy: true,
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-2 flex-wrap">
                         <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => {
                                   setSelectedIncident(row.original);
                                   setShowModal(true);
                              }}
                         >
                              View
                         </button>
                         {row.original.status === 'reported' && (
                              <button
                                   className="btn btn-outline-warning btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'investigating')}
                              >
                                   Start Investigation
                              </button>
                         )}
                         {row.original.status === 'investigating' && (
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => startInvestigation(row.original)}
                              >
                                   Root Cause Analysis
                              </button>
                         )}
                         {row.original.status === 'root-cause-analysis' && (
                              <button
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => startInvestigation(row.original)}
                              >
                                   Update Investigation
                              </button>
                         )}
                         {row.original.status === 'corrective-actions' && (
                              <button
                                   className="btn btn-outline-success btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'resolved')}
                              >
                                   Mark Resolved
                              </button>
                         )}
                         {row.original.status === 'resolved' && (
                              <button
                                   className="btn btn-outline-dark btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'closed')}
                              >
                                   Close Incident
                              </button>
                         )}
                    </div>
               )
          }
     ];

     const getTrendAnalysis = (): TrendAnalysis[] => {
          const trends: TrendAnalysis[] = [];
          const totalIncidents = incidents.length;

          // Analyze incident types for patterns
          const typeCounts = incidentTypes.map(type => ({
               type: type.value,
               count: incidents.filter(i => i.type === type.value).length,
               percentage: totalIncidents > 0 ? (incidents.filter(i => i.type === type.value).length / totalIncidents) * 100 : 0
          }));

          // Check for dominant incident types (>30% of total)
          const dominantTypes = typeCounts.filter(t => t.percentage > 30);
          if (dominantTypes.length > 0) {
               dominantTypes.forEach(type => {
                    const typeInfo = incidentTypes.find(t => t.value === type.type);
                    trends.push({
                         title: `High Frequency: ${typeInfo?.label} Incidents`,
                         description: `${type.percentage.toFixed(1)}% of all incidents are ${typeInfo?.label.toLowerCase()}. This may indicate systemic issues in ${typeInfo?.description.toLowerCase()}.`,
                         frequency: type.count,
                         impact: 'High'
                    });
               });
          }

          // Analyze severity patterns
          const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
          const criticalPercentage = totalIncidents > 0 ? (criticalIncidents / totalIncidents) * 100 : 0;

          if (criticalPercentage > 20) {
               trends.push({
                    title: 'High Critical Incident Rate',
                    description: `${criticalPercentage.toFixed(1)}% of incidents are classified as critical. This suggests potential safety or quality control issues requiring immediate attention.`,
                    frequency: criticalIncidents,
                    impact: 'Critical'
               });
          }

          // Analyze locations for patterns
          const locationCounts = incidents.reduce((acc, incident) => {
               if (incident.location) {
                    acc[incident.location] = (acc[incident.location] || 0) + 1;
               }
               return acc;
          }, {} as Record<string, number>);

          const highRiskLocations: [string, number][] = Object.entries(locationCounts)
               .filter(([location, count]: [string, number]) => count >= 3)
               .sort(([, a]: [string, number], [, b]: [string, number]) => b - a);

          if (highRiskLocations.length > 0) {
               highRiskLocations.forEach(([location, count]: [string, number]) => {
                    trends.push({
                         title: `Location Concentration: ${location}`,
                         description: `${count} incidents have occurred in ${location}. This location may require additional training, equipment upgrades, or process improvements.`,
                         frequency: count,
                         impact: 'Medium'
                    });
               });
          }

          // Analyze recurring issues (similar titles/descriptions)
          const titlePatterns = incidents.reduce((acc, incident) => {
               const words = incident.title.toLowerCase().split(' ');
               words.forEach(word => {
                    if (word.length > 3) { // Only consider meaningful words
                         acc[word] = (acc[word] || 0) + 1;
                    }
               });
               return acc;
          }, {} as Record<string, number>);

          const recurringWords: [string, number][] = Object.entries(titlePatterns)
               .filter(([word, count]: [string, number]) => count >= 3 && !['test', 'results', 'patient', 'sample', 'error'].includes(word))
               .sort(([, a]: [string, number], [, b]: [string, number]) => b - a);

          if (recurringWords.length > 0) {
               recurringWords.slice(0, 2).forEach(([word, count]: [string, number]) => {
                    trends.push({
                         title: `Recurring Issue: "${word}"`,
                         description: `The term "${word}" appears in ${count} incident titles. This may indicate a recurring problem requiring systemic solutions.`,
                         frequency: count,
                         impact: 'Medium'
                    });
               });
          }

          return trends;
     };

     const getMonthlyTrends = (): MonthlyTrend[] => {
          const monthlyData: MonthlyTrend[] = [];
          const now = new Date();

          // Generate last 6 months
          for (let i = 5; i >= 0; i--) {
               const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
               const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
               const monthIncidents = incidents.filter(incident => {
                    const incidentDate = new Date(incident.reportedAt);
                    return incidentDate.getMonth() === date.getMonth() && incidentDate.getFullYear() === date.getFullYear();
               });

               const byType = monthIncidents.reduce((acc, incident) => {
                    acc[incident.type] = (acc[incident.type] || 0) + 1;
                    return acc;
               }, {} as Record<string, number>);

               // Simple trend calculation (compare with previous month)
               let trend = 'stable';
               if (i < 5) {
                    const prevMonth = monthlyData[monthlyData.length - 1];
                    if (prevMonth && monthIncidents.length > prevMonth.total * 1.2) {
                         trend = 'increasing';
                    } else if (prevMonth && monthIncidents.length < prevMonth.total * 0.8) {
                         trend = 'decreasing';
                    }
               }

               monthlyData.push({
                    month: monthName,
                    total: monthIncidents.length,
                    byType,
                    trend
               });
          }

          return monthlyData;
     };

     if (loading) return <Loader />;

     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="card-title fs-5 fw-bold text-dark">Incident Reporting System</h2>
                                   </div>
                                   <div className="flex-grow-1">
                                        <Tabs defaultActiveKey="report" id="incident-tabs" className="mb-4">
                                             <Tab eventKey="report" title="Report Incident">
                                                  <div className="row g-3">
                                                       <div className="col-12">
                                                            <div className="card">
                                                                 <div className="card-header">
                                                                      <h5 className="card-title mb-0">Report New Incident</h5>
                                                                 </div>
                                                                 <div className="card-body">
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
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </Tab>

                                             <Tab eventKey="manage" title="Manage Incidents">
                                                  <PrimeTable
                                                       column={incidentColumns}
                                                       data={incidents}
                                                       filtering={true}
                                                       serverSideFiltering={true}
                                                       handleSeverSideProcessing={handleSeverSideProcessing}
                                                  />
                                             </Tab>

                                             <Tab eventKey="analytics" title="Analytics">
                                                  <Row className="mb-4">
                                                       <Col md={4}>
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Total Incidents</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <h2 className="mb-0">{incidents.length}</h2>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                       <Col md={4}>
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Open Investigations</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <h2 className="mb-0">
                                                                           {incidents.filter(i => i.status === 'investigating').length}
                                                                      </h2>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                       <Col md={4}>
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Critical Incidents</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <h2 className="mb-0">
                                                                           {incidents.filter(i => i.severity === 'critical').length}
                                                                      </h2>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                  </Row>

                                                  <Row className="mb-4">
                                                       <Col md={6}>
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Incidents by Type</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <div className="list-group list-group-flush">
                                                                           {incidentTypes.map(type => {
                                                                                const count = incidents.filter(i => i.type === type.value).length;
                                                                                const percentage = incidents.length > 0 ? ((count / incidents.length) * 100).toFixed(1) : '0';
                                                                                return (
                                                                                     <div key={type.value} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                          {type.label}
                                                                                          <div className="d-flex align-items-center gap-2">
                                                                                               <Badge bg="primary">{count}</Badge>
                                                                                               <small className="text-muted">{percentage}%</small>
                                                                                          </div>
                                                                                     </div>
                                                                                );
                                                                           })}
                                                                      </div>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                       <Col md={6}>
                                                            <Card>
                                                                 <Card.Header>
                                                                      <Card.Title>Incidents by Severity</Card.Title>
                                                                 </Card.Header>
                                                                 <Card.Body>
                                                                      <div className="list-group list-group-flush">
                                                                           {severityLevels.map(level => {
                                                                                const count = incidents.filter(i => i.severity === level.value).length;
                                                                                const percentage = incidents.length > 0 ? ((count / incidents.length) * 100).toFixed(1) : '0';
                                                                                return (
                                                                                     <div key={level.value} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                          {level.label}
                                                                                          <div className="d-flex align-items-center gap-2">
                                                                                               <Badge bg={level.value === 'low' ? 'primary' : level.value === 'medium' ? 'warning' : level.value === 'high' ? 'danger' : 'dark'}>{count}</Badge>
                                                                                               <small className="text-muted">{percentage}%</small>
                                                                                          </div>
                                                                                     </div>
                                                                                );
                                                                           })}
                                                                      </div>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                  </Row>

                                                  <Card className="mb-4">
                                                       <Card.Header>
                                                            <Card.Title>Trend Analysis - Systemic Issues</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            {getTrendAnalysis().length > 0 ? (
                                                                 <div className="space-y-3">
                                                                      <Alert variant="warning">
                                                                           <strong>⚠️ Potential Systemic Issues Detected</strong>
                                                                           <p className="mb-0 mt-2">The following patterns may indicate recurring problems requiring attention:</p>
                                                                      </Alert>
                                                                      {getTrendAnalysis().map((trend, index) => (
                                                                           <Card key={index} className="mb-3 border-warning">
                                                                                <Card.Body>
                                                                                     <Row>
                                                                                          <Col md={8}>
                                                                                               <h6 className="text-warning mb-2">{trend.title}</h6>
                                                                                               <p className="mb-2">{trend.description}</p>
                                                                                               <div className="d-flex gap-3 text-sm">
                                                                                                    <span><strong>Frequency:</strong> {trend.frequency} incidents</span>
                                                                                                    <span><strong>Impact:</strong> {trend.impact}</span>
                                                                                               </div>
                                                                                          </Col>
                                                                                          <Col md={4} className="text-end">
                                                                                               <Badge bg="warning" className="mb-2">High Priority</Badge>
                                                                                               <br />
                                                                                               <Button variant="outline-warning" size="sm">
                                                                                                    Create CAPA
                                                                                               </Button>
                                                                                          </Col>
                                                                                     </Row>
                                                                                </Card.Body>
                                                                           </Card>
                                                                      ))}
                                                                 </div>
                                                            ) : (
                                                                 <div className="text-center py-4">
                                                                      <div className="text-success mb-2">✓</div>
                                                                      <p className="text-muted">No systemic issues detected. All incident patterns are within normal ranges.</p>
                                                                 </div>
                                                            )}
                                                       </Card.Body>
                                                  </Card>

                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Monthly Incident Trends</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <div className="table-responsive">
                                                                 <table className="table table-striped">
                                                                      <thead>
                                                                           <tr>
                                                                                <th>Month</th>
                                                                                <th>Total Incidents</th>
                                                                                <th>Patient Safety</th>
                                                                                <th>Quality</th>
                                                                                <th>Security</th>
                                                                                <th>Compliance</th>
                                                                                <th>Trend</th>
                                                                           </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                           {getMonthlyTrends().map((month, index) => (
                                                                                <tr key={index}>
                                                                                     <td>{month.month}</td>
                                                                                     <td>{month.total}</td>
                                                                                     <td>{month.byType['patient-safety'] || 0}</td>
                                                                                     <td>{month.byType.quality || 0}</td>
                                                                                     <td>{month.byType.security || 0}</td>
                                                                                     <td>{month.byType.compliance || 0}</td>
                                                                                     <td>
                                                                                          {month.trend === 'increasing' && <Badge bg="danger">↗️ Increasing</Badge>}
                                                                                          {month.trend === 'decreasing' && <Badge bg="success">↘️ Decreasing</Badge>}
                                                                                          {month.trend === 'stable' && <Badge bg="secondary">→ Stable</Badge>}
                                                                                     </td>
                                                                                </tr>
                                                                           ))}
                                                                      </tbody>
                                                                 </table>
                                                            </div>
                                                       </Card.Body>
                                                  </Card>
                                             </Tab>
                                        </Tabs>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Incident Detail Modal */}
               <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Incident Details - {selectedIncident?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedIncident && (
                              <div className="space-y-4">
                                   <Row>
                                        <Col md={6}>
                                             <strong>Title:</strong> {selectedIncident.title}
                                        </Col>
                                        <Col md={6}>
                                             <strong>Type:</strong> {incidentTypes.find(t => t.value === selectedIncident.type)?.label}
                                        </Col>
                                   </Row>
                                   <div>
                                        <strong>Description:</strong>
                                        <p className="mt-2">{selectedIncident.description}</p>
                                   </div>
                                   <Row>
                                        <Col md={6}>
                                             <strong>Status:</strong> <Badge bg={
                                                  selectedIncident.status === 'reported' ? 'secondary' :
                                                       selectedIncident.status === 'investigating' ? 'warning' :
                                                            selectedIncident.status === 'resolved' ? 'success' : 'dark'
                                             }>{statusOptions.find(o => o.value === selectedIncident.status)?.label}</Badge>
                                        </Col>
                                        <Col md={6}>
                                             <strong>Severity:</strong> {getSeverityBadge(selectedIncident.severity)}
                                        </Col>
                                   </Row>
                                   <Row>
                                        <Col md={6}>
                                             <strong>Reported by:</strong> {selectedIncident.reportedBy}
                                        </Col>
                                        <Col md={6}>
                                             <strong>Date:</strong> {new Date(selectedIncident.reportedAt).toLocaleDateString()}
                                        </Col>
                                   </Row>
                                   {selectedIncident.location && (
                                        <div>
                                             <strong>Location:</strong> {selectedIncident.location}
                                        </div>
                                   )}
                                   {selectedIncident.affectedParties && (
                                        <div>
                                             <strong>Affected Parties:</strong> {selectedIncident.affectedParties}
                                        </div>
                                   )}
                                   {selectedIncident.immediateActions && (
                                        <div>
                                             <strong>Immediate Actions:</strong> {selectedIncident.immediateActions}
                                        </div>
                                   )}
                                   {selectedIncident.rootCause && (
                                        <div>
                                             <strong>Root Cause:</strong> {selectedIncident.rootCause}
                                        </div>
                                   )}
                                   {selectedIncident.correctiveActions && (
                                        <div>
                                             <strong>Corrective Actions:</strong> {selectedIncident.correctiveActions}
                                        </div>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowModal(false)}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Investigation Modal */}
               <Modal show={showInvestigationModal} onHide={() => setShowInvestigationModal(false)} size="xl">
                    <Modal.Header closeButton>
                         <Modal.Title>Root Cause Analysis & Corrective Actions - {selectedIncident?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedIncident && (
                              <div className="container-fluid">
                                   {/* 5-Why Analysis */}
                                   <Card className="mb-4">
                                        <Card.Header>
                                             <Card.Title>5-Why Root Cause Analysis</Card.Title>
                                        </Card.Header>
                                        <Card.Body>
                                             <div className="row g-3">
                                                  <div className="col-12">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">What happened?</Form.Label>
                                                            <Form.Control
                                                                 as="textarea"
                                                                 rows={2}
                                                                 value={investigationData.what}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, what: e.target.value }))}
                                                                 placeholder="Describe what occurred"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">Why did it happen?</Form.Label>
                                                            <Form.Control
                                                                 as="textarea"
                                                                 rows={2}
                                                                 value={investigationData.why}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, why: e.target.value }))}
                                                                 placeholder="Root cause analysis"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">When did it happen?</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={investigationData.when}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, when: e.target.value }))}
                                                                 placeholder="Date/time details"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">Where did it happen?</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={investigationData.where}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, where: e.target.value }))}
                                                                 placeholder="Location details"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">Who was involved?</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={investigationData.who}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, who: e.target.value }))}
                                                                 placeholder="Personnel involved"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                                  <div className="col-12">
                                                       <Form.Group>
                                                            <Form.Label className="fw-semibold">How did it happen?</Form.Label>
                                                            <Form.Control
                                                                 as="textarea"
                                                                 rows={2}
                                                                 value={investigationData.how}
                                                                 onChange={(e) => setInvestigationData(prev => ({ ...prev, how: e.target.value }))}
                                                                 placeholder="Process/sequence of events"
                                                            />
                                                       </Form.Group>
                                                  </div>
                                             </div>
                                        </Card.Body>
                                   </Card>

                                   {/* Corrective Actions */}
                                   <Card className="mb-4">
                                        <Card.Header>
                                             <Card.Title>Corrective Action Plan</Card.Title>
                                        </Card.Header>
                                        <Card.Body>
                                             <div className="mb-3">
                                                  <Form.Group>
                                                       <Form.Label className="fw-semibold">Summary of Corrective Actions</Form.Label>
                                                       <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            value={investigationData.correctiveActions}
                                                            onChange={(e) => setInvestigationData(prev => ({ ...prev, correctiveActions: e.target.value }))}
                                                            placeholder="Overall corrective action plan"
                                                       />
                                                  </Form.Group>
                                             </div>

                                             <div className="mb-3">
                                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                                       <h6>Specific Action Items</h6>
                                                       <Button variant="outline-primary" size="sm" onClick={addCorrectiveAction}>
                                                            Add Action
                                                       </Button>
                                                  </div>
                                                  {investigationData.actionPlan.map((action, index) => (
                                                       <Card key={index} className="mb-2">
                                                            <Card.Body className="py-2">
                                                                 <Row className="g-2">
                                                                      <Col md={4}>
                                                                           <Form.Control
                                                                                placeholder="Action description"
                                                                                value={action.action}
                                                                                onChange={(e) => updateCorrectiveAction(index, 'action', e.target.value)}
                                                                                size="sm"
                                                                           />
                                                                      </Col>
                                                                      <Col md={3}>
                                                                           <Form.Control
                                                                                placeholder="Responsible person"
                                                                                value={action.responsible}
                                                                                onChange={(e) => updateCorrectiveAction(index, 'responsible', e.target.value)}
                                                                                size="sm"
                                                                           />
                                                                      </Col>
                                                                      <Col md={3}>
                                                                           <Form.Control
                                                                                type="date"
                                                                                value={action.deadline}
                                                                                onChange={(e) => updateCorrectiveAction(index, 'deadline', e.target.value)}
                                                                                size="sm"
                                                                           />
                                                                      </Col>
                                                                      <Col md={2}>
                                                                           <Form.Select
                                                                                value={action.status}
                                                                                onChange={(e) => updateCorrectiveAction(index, 'status', e.target.value)}
                                                                                size="sm"
                                                                           >
                                                                                <option value="pending">Pending</option>
                                                                                <option value="in-progress">In Progress</option>
                                                                                <option value="completed">Completed</option>
                                                                           </Form.Select>
                                                                      </Col>
                                                                 </Row>
                                                            </Card.Body>
                                                       </Card>
                                                  ))}
                                             </div>
                                        </Card.Body>
                                   </Card>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowInvestigationModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={saveInvestigation}>
                              Save Investigation
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}