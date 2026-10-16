'use client';

import React, { useState, useEffect, use } from 'react';
import { Button, Form, Modal, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import Loader from '../../../components/isLoading';
import ReportIncidentTab from './ReportIncidentTab';
import ManageIncidentsTab from './ManageIncidentsTab';
import AuditTrailTab from './AuditTrailTab';
import { useApplication, useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../components/Auth/roles';
import { RiAddBoxFill } from '@remixicon/react';

interface Incident {
     id: string;
     type: 'patient-safety' | 'quality' | 'security' | 'compliance';
     title: string;
     description: string;
     severity: 'low' | 'medium' | 'high' | 'critical';
     status: 'reported' | 'investigating' | 'root-cause-analysis' | 'corrective-actions' | 'resolved' | 'closed';
     employeeId: number;
     reportedAt: string;
     reportedByUsername?: string;
     reportedByEmail?: string;
     reportedByRole?: string;
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
     escalatedTo?: string[];
     followUpDate?: string;
     resolutionDate?: string;
     attachments?: string[];
     investigationNotes?: string[];
     createdAt?: string;
     updatedAt?: string;
}

interface AuditTrailEntry {
     id: string;
     incidentId: string;
     timestamp: string;
     action: 'CREATE' | 'UPDATE' | 'DELETE';
     employeeId: number;
     employeeUsername?: string;
     employeeEmail?: string;
     employeeRole?: string;
     oldValue?: string;
     newValue?: string;
     details: string;
     createdAt: string;
}

const incidentTypes = [
     { value: 'patient-safety', label: 'Patient Safety' },
     { value: 'quality', label: 'Quality' },
     { value: 'security', label: 'Security' },
     { value: 'compliance', label: 'Compliance' }
];

const severityLevels = [
     { value: 'low', label: 'Low' },
     { value: 'medium', label: 'Medium' },
     { value: 'high', label: 'High' },
     { value: 'critical', label: 'Critical' }
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
     const user = useApplication()?.user;
     const isAdmin = roleAllowed(user?.role, ['admin', 'manager']);
     const [incidents, setIncidents] = useState<Incident[]>([]);
     const [loading, setLoading] = useState(true);
     const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [showInvestigationModal, setShowInvestigationModal] = useState(false);
     const [showCreateModal, setShowCreateModal] = useState(false);
     const [showReportView, setShowReportView] = useState(false);
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
                    if (!user?.employeeid) return;
                    const response = await customFetch('compliance/incidents?page=1&count=10&&employeeId=' + user?.employeeid);
                    if (response && response.data && Array.isArray(response.data)) {
                         setIncidents(response.data);
                    } else {
                         setIncidents([]);
                    }
               } catch (error) {
                    setIncidents([]);
               } finally {
                    setLoading(false);
               }
          };
          fetchIncidents();
     }, [user?.employeeid]);



     const updateIncidentStatus = async (incidentId: string, newStatus: Incident['status']) => {
          try {
               const updateData = { status: newStatus };
               const response = await customPost(`compliance/incidents/${incidentId}?employeeId=${user?.employeeid}`, 'PUT', updateData);

               if (response && response.success && response.data) {
                    setIncidents(prev =>
                         prev.map(inc =>
                              inc.id === incidentId ? { ...inc, ...response.data } : inc
                         )
                    );
                    toast.success(`Incident status updated to ${newStatus}`);
               } else {
                    throw new Error('Invalid response from server');
               }
          } catch (error) {
               console.error('Error updating incident status:', error);
               toast.error('Error updating incident status. Please try again.');
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

     const saveInvestigation = async () => {
          if (!selectedIncident) return;

          // Validate that all 5-why fields are filled
          const { what, why, when, where, who, how } = investigationData;
          if (!what.trim() || !why.trim() || !when.trim() || !where.trim() || !who.trim() || !how.trim()) {
               toast.error('All 5-Why analysis fields must be completed before saving the investigation.');
               return;
          }

          try {
               const updateData = {
                    status: 'corrective-actions',
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
                    }
               };

               const response = await customPost(`compliance/incidents/${selectedIncident.id}?employeeId=${user?.employeeid}`, 'PUT', updateData);

               if (response && response.success && response.data) {
                    // Update the incident in the local state
                    setIncidents(prev =>
                         prev.map(inc => inc.id === selectedIncident.id ? { ...inc, ...response.data } : inc)
                    );

                    setShowInvestigationModal(false);
                    toast.success('Investigation completed and corrective actions planned');
               } else {
                    throw new Error('Invalid response from server');
               }
          } catch (error) {
               console.error('Error saving investigation:', error);
               toast.error('Error saving investigation. Please try again.');
          }
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

     const getSeverityBadge = (severity: string) => {
          const level = severityLevels.find(l => l.value === severity);
          return level ? (
               <span className={
                    `fw-bold ${level.value === 'low' ? 'text-primary' :
                         level.value === 'medium' ? 'text-warning' :
                              level.value === 'high' ? 'text-danger' : 'text-dark'}`
               }>{level.label}</span>
          ) : null;
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
                                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                             <RiAddBoxFill size={20} className="me-2" />
                                             New Incident
                                        </Button>
                                   </div>
                                   <div className="flex-grow-1">
                                        <Tabs defaultActiveKey="manage" id="incident-tabs" className="mb-4">
                                             <Tab eventKey="manage" title="Manage Incidents">
                                                  <ManageIncidentsTab
                                                       incidents={incidents}
                                                       onIncidentsUpdate={setIncidents}
                                                       onStartInvestigation={startInvestigation}
                                                       onViewIncident={(incident) => {
                                                            setSelectedIncident(incident);
                                                            setShowModal(true);
                                                       }}
                                                       isAdmin={isAdmin}
                                                  />
                                             </Tab>

                                             <Tab eventKey="audit" title="Audit Trail">
                                                  <AuditTrailTab />
                                             </Tab>
                                        </Tabs>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Incident Detail Modal */}
               <Modal show={showModal} onHide={() => { setShowModal(false); setShowReportView(false); }} fullscreen={showReportView ? true : undefined} backdrop="static" className="modal-top text-sm">
                    <Modal.Header closeButton >
                         <div className='d-flex justify-content-between col-8'>
                              <Modal.Title>Incident Details - {selectedIncident?.id}</Modal.Title>
                              {selectedIncident?.status === 'closed' && (
                                   <Button variant="info" size="sm" onClick={() => setShowReportView(true)} className="ms-auto">
                                        View Report
                                   </Button>
                              )}
                         </div>
                    </Modal.Header>
                    <Modal.Body className="text-sm">
                         {selectedIncident && (
                              showReportView ? (
                                   // Two-column report view
                                   <div className="row h-100 p-2">
                                        {/* Left Column - Incident Details */}
                                        <div className="col-md-6 border-end pe-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                             <h4 className="fw-bold mb-4 text-primary">INCIDENT DETAILS</h4>
                                             <div className="space-y-4">
                                                  <Row>
                                                       <Col md={12}>
                                                            <strong>Title:</strong> {selectedIncident.title}
                                                       </Col>
                                                  </Row>
                                                  <Row>
                                                       <Col md={6}>
                                                            <strong>Type:</strong> {incidentTypes.find(t => t.value === selectedIncident.type)?.label}
                                                       </Col>
                                                       <Col md={6}>
                                                            <strong>Severity:</strong> {getSeverityBadge(selectedIncident.severity)}
                                                       </Col>
                                                  </Row>
                                                  <Row>
                                                       <Col md={6}>
                                                            <strong>Employee ID:</strong> {selectedIncident.employeeId}
                                                       </Col>
                                                       <Col md={6}>
                                                            <strong>Reported By:</strong> {selectedIncident.reportedByUsername || 'N/A'} ({selectedIncident.reportedByRole || 'N/A'})
                                                       </Col>
                                                  </Row>
                                                  <Row>
                                                       <Col md={6}>
                                                            <strong>Email:</strong> {selectedIncident.reportedByEmail || 'N/A'}
                                                       </Col>
                                                       <Col md={6}>
                                                            <strong>Date:</strong> {new Date(selectedIncident.reportedAt).toLocaleDateString()}
                                                       </Col>
                                                  </Row>
                                                  {selectedIncident.location && (
                                                       <Row>
                                                            <Col md={12}>
                                                                 <strong>Location:</strong> {selectedIncident.location}
                                                            </Col>
                                                       </Row>
                                                  )}
                                                  {selectedIncident.affectedParties && (
                                                       <Row>
                                                            <Col md={12}>
                                                                 <strong>Affected Parties:</strong> {selectedIncident.affectedParties}
                                                            </Col>
                                                       </Row>
                                                  )}
                                                  <Row>
                                                       <Col md={12}>
                                                            <strong>Description:</strong>
                                                            <div className="mt-2">{selectedIncident.description}</div>
                                                       </Col>
                                                  </Row>
                                                  {selectedIncident.immediateActions && (
                                                       <Row>
                                                            <Col md={12}>
                                                                 <strong>Immediate Actions:</strong>
                                                                 <div className="mt-2">{selectedIncident.immediateActions}</div>
                                                            </Col>
                                                       </Row>
                                                  )}

                                                  {/* Root Cause Analysis Section */}
                                                  {(selectedIncident.rootCause || selectedIncident.rootCauseAnalysis) && (
                                                       <div className="mt-4">
                                                            <h5 className="fw-bold mb-3">Root Cause Analysis</h5>
                                                            {selectedIncident.rootCause && (
                                                                 <div className="mb-3">
                                                                      <strong>Root Cause Summary:</strong>
                                                                      <div className="mt-2">{selectedIncident.rootCause}</div>
                                                                 </div>
                                                            )}

                                                            {selectedIncident.rootCauseAnalysis && (
                                                                 <div>
                                                                      <h6 className="fw-semibold mb-3">5-Why Analysis:</h6>
                                                                      <Row className="g-3">
                                                                           <Col md={6}>
                                                                                <div className="border-start border-primary border-3 ps-2">
                                                                                     <strong>What happened?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.what || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                           <Col md={6}>
                                                                                <div className="border-start border-danger border-3 ps-2">
                                                                                     <strong>Why did it happen?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.why || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                           <Col md={6}>
                                                                                <div className="border-start border-warning border-3 ps-2">
                                                                                     <strong>When did it happen?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.when || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                           <Col md={6}>
                                                                                <div className="border-start border-info border-3 ps-2">
                                                                                     <strong>Where did it happen?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.where || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                           <Col md={6}>
                                                                                <div className="border-start border-success border-3 ps-2">
                                                                                     <strong>Who was involved?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.who || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                           <Col md={6}>
                                                                                <div className="border-start border-secondary border-3 ps-2">
                                                                                     <strong>How did it happen?</strong>
                                                                                     <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.how || 'Not analyzed'}</p>
                                                                                </div>
                                                                           </Col>
                                                                      </Row>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}

                                                  {/* Corrective Actions Section */}
                                                  {(selectedIncident.correctiveActions || selectedIncident.correctiveActionPlan) && (
                                                       <div className="mt-4">
                                                            <h5 className="fw-bold mb-3">Corrective Actions</h5>
                                                            {selectedIncident.correctiveActions && (
                                                                 <div className="mb-3">
                                                                      <strong>Action Summary:</strong>
                                                                      <div className="mt-2">{selectedIncident.correctiveActions}</div>
                                                                 </div>
                                                            )}

                                                            {selectedIncident.correctiveActionPlan && selectedIncident.correctiveActionPlan.actions.length > 0 && (
                                                                 <div>
                                                                      <h6 className="fw-semibold mb-3">Action Plan:</h6>
                                                                      <div className="table-responsive">
                                                                           <table className="table table-sm">
                                                                                <thead>
                                                                                     <tr>
                                                                                          <th>Action</th>
                                                                                          <th>Responsible</th>
                                                                                          <th>Deadline</th>
                                                                                          <th>Status</th>
                                                                                     </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                     {selectedIncident.correctiveActionPlan.actions.map((action, index) => (
                                                                                          <tr key={index}>
                                                                                               <td>{action}</td>
                                                                                               <td>{selectedIncident.correctiveActionPlan?.responsible[index] || ''}</td>
                                                                                               <td>{selectedIncident.correctiveActionPlan?.deadlines[index] ? new Date(selectedIncident.correctiveActionPlan.deadlines[index]).toLocaleDateString() : ''}</td>
                                                                                               <td>
                                                                                                    <span className={
                                                                                                         `fw-bold ${selectedIncident.correctiveActionPlan?.status[index] === 'completed' ? 'text-success' :
                                                                                                              selectedIncident.correctiveActionPlan?.status[index] === 'in-progress' ? 'text-warning' : 'text-secondary'}`
                                                                                                    }>
                                                                                                         {selectedIncident.correctiveActionPlan?.status[index] || 'pending'}
                                                                                                    </span>
                                                                                               </td>
                                                                                          </tr>
                                                                                     ))}
                                                                                </tbody>
                                                                           </table>
                                                                      </div>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}
                                             </div>
                                        </div>

                                        {/* Right Column - Report */}
                                        <div className="col-md-6 ps-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                             <div className="report-container" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
                                                  {/* Report Header */}
                                                  <div className="text-center mb-4">
                                                       <h2 className="fw-bold mb-2" style={{ fontSize: '1.8rem', color: '#333' }}>INCIDENT INVESTIGATION REPORT</h2>
                                                       <div className="row mt-3">
                                                            <div className="col-md-6">
                                                                 <div className="p-2">
                                                                      <div className="text-muted small">INCIDENT ID</div>
                                                                      <div className="fw-bold">{selectedIncident.id}</div>
                                                                 </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                 <div className="p-2">
                                                                      <div className="text-muted small">REPORT DATE</div>
                                                                      <div className="fw-bold">{new Date().toLocaleDateString()}</div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Report Content */}
                                                  <div className="mb-4">
                                                       <h4 className="fw-bold mb-3" style={{ fontSize: '1.2rem', borderBottom: '2px solid #333', paddingBottom: '6px' }}>
                                                            INCIDENT SUMMARY
                                                       </h4>
                                                       <div className="row">
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Title:</strong> {selectedIncident.title}
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Type:</strong> {incidentTypes.find(t => t.value === selectedIncident.type)?.label}
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Employee ID:</strong> {selectedIncident.employeeId}
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Reported By:</strong> {selectedIncident.reportedByUsername || 'N/A'} ({selectedIncident.reportedByRole || 'N/A'})
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Email:</strong> {selectedIncident.reportedByEmail || 'N/A'}
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                 <strong>Status:</strong> {statusOptions.find(o => o.value === selectedIncident.status)?.label}
                                                            </div>
                                                       </div>
                                                       <div className="mt-3">
                                                            <strong>Description:</strong>
                                                            <div className="mt-2">{selectedIncident.description}</div>
                                                       </div>
                                                  </div>

                                                  {/* Root Cause Analysis in Report */}
                                                  {(selectedIncident.rootCause || selectedIncident.rootCauseAnalysis) && (
                                                       <div className="mb-4">
                                                            <h4 className="fw-bold mb-3" style={{ fontSize: '1.2rem', borderBottom: '2px solid #333', paddingBottom: '6px' }}>
                                                                 ROOT CAUSE ANALYSIS
                                                            </h4>
                                                            {selectedIncident.rootCause && (
                                                                 <div className="mb-3">
                                                                      <strong>Root Cause Summary:</strong>
                                                                      <div className="mt-2">{selectedIncident.rootCause}</div>
                                                                 </div>
                                                            )}

                                                            {selectedIncident.rootCauseAnalysis && (
                                                                 <div>
                                                                      <h5 className="fw-bold mb-3" style={{ fontSize: '1.0rem' }}>5-Why Analysis:</h5>
                                                                      <div className="row">
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>What happened?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.what || 'Not analyzed'}</div>
                                                                           </div>
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>Why did it happen?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.why || 'Not analyzed'}</div>
                                                                           </div>
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>When did it happen?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.when || 'Not analyzed'}</div>
                                                                           </div>
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>Where did it happen?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.where || 'Not analyzed'}</div>
                                                                           </div>
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>Who was involved?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.who || 'Not analyzed'}</div>
                                                                           </div>
                                                                           <div className="col-md-6 mb-2">
                                                                                <strong>How did it happen?</strong>
                                                                                <div className="mt-1">{selectedIncident.rootCauseAnalysis.how || 'Not analyzed'}</div>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}

                                                  {/* Corrective Actions in Report */}
                                                  {(selectedIncident.correctiveActions || selectedIncident.correctiveActionPlan) && (
                                                       <div className="mb-4">
                                                            <h4 className="fw-bold mb-3" style={{ fontSize: '1.2rem', borderBottom: '2px solid #333', paddingBottom: '6px' }}>
                                                                 CORRECTIVE ACTIONS
                                                            </h4>
                                                            {selectedIncident.correctiveActions && (
                                                                 <div className="mb-3">
                                                                      <strong>Action Summary:</strong>
                                                                      <div className="mt-2">{selectedIncident.correctiveActions}</div>
                                                                 </div>
                                                            )}

                                                            {selectedIncident.correctiveActionPlan && selectedIncident.correctiveActionPlan.actions.length > 0 && (
                                                                 <div>
                                                                      <h5 className="fw-bold mb-3" style={{ fontSize: '1.0rem' }}>Detailed Action Plan:</h5>
                                                                      <div className="table-responsive">
                                                                           <table className="table table-bordered" style={{ fontSize: '0.85rem' }}>
                                                                                <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                                                     <tr>
                                                                                          <th className="fw-bold">Action</th>
                                                                                          <th className="fw-bold">Responsible</th>
                                                                                          <th className="fw-bold">Deadline</th>
                                                                                          <th className="fw-bold">Status</th>
                                                                                     </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                     {selectedIncident.correctiveActionPlan.actions.map((action, index) => (
                                                                                          <tr key={index}>
                                                                                               <td>{action}</td>
                                                                                               <td>{selectedIncident.correctiveActionPlan?.responsible[index] || ''}</td>
                                                                                               <td>{selectedIncident.correctiveActionPlan?.deadlines[index] ? new Date(selectedIncident.correctiveActionPlan.deadlines[index]).toLocaleDateString() : ''}</td>
                                                                                               <td>
                                                                                                    <span className={`badge ${selectedIncident.correctiveActionPlan?.status[index] === 'completed' ? 'bg-success' :
                                                                                                         selectedIncident.correctiveActionPlan?.status[index] === 'in-progress' ? 'bg-warning' : 'bg-secondary'
                                                                                                         }`}>
                                                                                                         {selectedIncident.correctiveActionPlan?.status[index] || 'pending'}
                                                                                                    </span>
                                                                                               </td>
                                                                                          </tr>
                                                                                     ))}
                                                                                </tbody>
                                                                           </table>
                                                                      </div>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}

                                                  {/* Report Footer */}
                                                  <div className="mt-4 pt-3 border-top text-center" style={{ fontSize: '0.8rem', color: '#666' }}>
                                                       <div className="mb-1">
                                                            Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                                       </div>
                                                       <div>
                                                            Incident Management System - Quality & Compliance Department
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   // Original single-column view
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
                                                  <strong>Status:</strong> <span className={
                                                       `fw-bold ${selectedIncident.status === 'reported' ? 'text-secondary' :
                                                            selectedIncident.status === 'investigating' ? 'text-warning' :
                                                                 selectedIncident.status === 'resolved' ? 'text-success' : 'text-dark'}`
                                                  }>{statusOptions.find(o => o.value === selectedIncident.status)?.label}</span>
                                             </Col>
                                             <Col md={6}>
                                                  <strong>Severity:</strong> {getSeverityBadge(selectedIncident.severity)}
                                             </Col>
                                        </Row>
                                        <Row>
                                             <Col md={6}>
                                                  <strong>Employee ID:</strong> {selectedIncident.employeeId}
                                             </Col>
                                             <Col md={6}>
                                                  <strong>Reported By:</strong> {selectedIncident.reportedByUsername || 'N/A'} ({selectedIncident.reportedByRole || 'N/A'})
                                             </Col>
                                        </Row>
                                        <Row>
                                             <Col md={6}>
                                                  <strong>Email:</strong> {selectedIncident.reportedByEmail || 'N/A'}
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

                                        {/* Root Cause Analysis Section */}
                                        {(selectedIncident.rootCause || selectedIncident.rootCauseAnalysis) && (
                                             <div className="mt-4">
                                                  <h5 className="fw-bold mb-3">Root Cause Analysis</h5>
                                                  <div>
                                                       {selectedIncident.rootCause && (
                                                            <div className="mb-3">
                                                                 <strong>Root Cause Summary:</strong>
                                                                 <p className="mt-2">{selectedIncident.rootCause}</p>
                                                            </div>
                                                       )}

                                                       {selectedIncident.rootCauseAnalysis && (
                                                            <div>
                                                                 <h6 className="fw-semibold mb-3">5-Why Analysis:</h6>
                                                                 <Row className="g-3">
                                                                      <Col md={6}>
                                                                           <div className="border-start border-primary border-3 ps-2">
                                                                                <strong>What happened?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.what || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                      <Col md={6}>
                                                                           <div className="border-start border-danger border-3 ps-2">
                                                                                <strong>Why did it happen?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.why || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                      <Col md={6}>
                                                                           <div className="border-start border-warning border-3 ps-2">
                                                                                <strong>When did it happen?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.when || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                      <Col md={6}>
                                                                           <div className="border-start border-info border-3 ps-2">
                                                                                <strong>Where did it happen?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.where || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                      <Col md={6}>
                                                                           <div className="border-start border-success border-3 ps-2">
                                                                                <strong>Who was involved?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.who || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                      <Col md={6}>
                                                                           <div className="border-start border-secondary border-3 ps-2">
                                                                                <strong>How did it happen?</strong>
                                                                                <p className="mb-0 mt-1">{selectedIncident.rootCauseAnalysis.how || 'Not analyzed'}</p>
                                                                           </div>
                                                                      </Col>
                                                                 </Row>
                                                            </div>
                                                       )}
                                                  </div>
                                             </div>
                                        )}

                                        {/* Corrective Actions Section */}
                                        {(selectedIncident.correctiveActions || selectedIncident.correctiveActionPlan) && (
                                             <div className="mt-4">
                                                  <h5 className="fw-bold mb-3">Corrective Actions</h5>
                                                  <div>
                                                       {selectedIncident.correctiveActions && (
                                                            <div className="mb-3">
                                                                 <strong>Action Summary:</strong>
                                                                 <p className="mt-2">{selectedIncident.correctiveActions}</p>
                                                            </div>
                                                       )}

                                                       {selectedIncident.correctiveActionPlan && selectedIncident.correctiveActionPlan.actions.length > 0 && (
                                                            <div>
                                                                 <h6 className="fw-semibold mb-3">Action Plan:</h6>
                                                                 <div className="table-responsive">
                                                                      <table className="table table-sm">
                                                                           <thead>
                                                                                <tr>
                                                                                     <th>Action</th>
                                                                                     <th>Responsible</th>
                                                                                     <th>Deadline</th>
                                                                                     <th>Status</th>
                                                                                </tr>
                                                                           </thead>
                                                                           <tbody>
                                                                                {selectedIncident.correctiveActionPlan.actions.map((action, index) => (
                                                                                     <tr key={index}>
                                                                                          <td>{action}</td>
                                                                                          <td>{selectedIncident.correctiveActionPlan?.responsible[index] || ''}</td>
                                                                                          <td>{selectedIncident.correctiveActionPlan?.deadlines[index] ? new Date(selectedIncident.correctiveActionPlan.deadlines[index]).toLocaleDateString() : ''}</td>
                                                                                          <td>
                                                                                               <span className={
                                                                                                    `fw-bold ${selectedIncident.correctiveActionPlan?.status[index] === 'completed' ? 'text-success' :
                                                                                                         selectedIncident.correctiveActionPlan?.status[index] === 'in-progress' ? 'text-warning' : 'text-secondary'}`
                                                                                               }>
                                                                                                    {selectedIncident.correctiveActionPlan?.status[index] || 'pending'}
                                                                                               </span>
                                                                                          </td>
                                                                                     </tr>
                                                                                ))}
                                                                           </tbody>
                                                                      </table>
                                                                 </div>
                                                            </div>
                                                       )}
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              )
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowModal(false)}>
                              Close
                         </Button>
                         {(selectedIncident?.status === 'investigating' || selectedIncident?.status === 'root-cause-analysis') && (
                              <Button variant="primary" onClick={() => {
                                   setShowModal(false);
                                   startInvestigation(selectedIncident);
                              }}>
                                   {selectedIncident?.status === 'investigating' ? 'Start Root Cause Analysis' : 'Update Analysis'}
                              </Button>
                         )}
                    </Modal.Footer>
               </Modal>

               {/* Investigation Modal */}
               <Modal show={showInvestigationModal} onHide={() => setShowInvestigationModal(false)} size="xl" backdrop="static" className="modal-top text-sm">
                    <Modal.Header closeButton>
                         <Modal.Title>Root Cause Analysis & Corrective Actions - {selectedIncident?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-sm">
                         {selectedIncident && (
                              <div className="container-fluid">
                                   {/* 5-Why Analysis */}
                                   <div className="mb-4">
                                        <h5 className="fw-bold mb-3">5-Why Root Cause Analysis</h5>
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
                                   </div>

                                   {/* Corrective Actions */}
                                   <div className="mb-4">
                                        <h5 className="fw-bold mb-3">Corrective Action Plan</h5>
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
                                                  <div key={index} className="mb-2 border rounded p-2">
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
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
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

               {/* Create New Incident Modal */}
               <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" backdrop="static">
                    <Modal.Header closeButton>
                         <Modal.Title>Report New Incident</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <ReportIncidentTab
                              onIncidentReported={(newIncident) => {
                                   setIncidents(prev => [newIncident, ...prev]);
                                   setShowCreateModal(false);
                                   toast.success('Incident reported successfully!');
                              }}
                         />
                    </Modal.Body>
               </Modal>
          </div>
     );
}