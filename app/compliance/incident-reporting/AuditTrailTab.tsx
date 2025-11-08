import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';

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

interface AuditTrailTabProps { }

export default function AuditTrailTab({ }: AuditTrailTabProps) {
     const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
     const [auditTrailLoading, setAuditTrailLoading] = useState(false);
     const [auditTrailFilters, setAuditTrailFilters] = useState({
          action: '',
          employeeId: '',
          start_date: '',
          end_date: '',
          page: 1,
          count: 10
     });
     const [auditTrailPagination, setAuditTrailPagination] = useState({
          page: 1,
          count: 10,
          total: 0,
          totalPages: 1
     });

     const fetchAuditTrail = async (filters: typeof auditTrailFilters = auditTrailFilters) => {
          try {
               setAuditTrailLoading(true);
               const queryParams = new URLSearchParams({
                    page: filters.page.toString(),
                    count: filters.count.toString(),
                    sortby: 'DESC'
               });

               if (filters.action) queryParams.append('action', filters.action);
               if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
               if (filters.start_date) queryParams.append('start_date', filters.start_date);
               if (filters.end_date) queryParams.append('end_date', filters.end_date);

               const response = await customFetch(`compliance/audit-trail?${queryParams.toString()}`);
               if (response && response.data && Array.isArray(response.data)) {
                    setAuditTrail(response.data);
                    setAuditTrailPagination({
                         page: response.pagination?.page || 1,
                         count: response.pagination?.count || 10,
                         total: response.pagination?.total || 0,
                         totalPages: response.pagination?.totalPages || 1
                    });
               } else {
                    setAuditTrail([]);
                    setAuditTrailPagination({ page: 1, count: 10, total: 0, totalPages: 1 });
               }
          } catch (error) {
               console.log('Audit trail fetch failed:', error);
               setAuditTrail([]);
               setAuditTrailPagination({ page: 1, count: 10, total: 0, totalPages: 1 });
          } finally {
               setAuditTrailLoading(false);
          }
     };

     // Fetch audit trail data on component mount
     useEffect(() => {
          fetchAuditTrail();
     }, []);

     const formatChanges = (oldValue: string, newValue: string) => {
          try {
               const oldObj = JSON.parse(oldValue);
               const newObj = JSON.parse(newValue);
               const changes: string[] = [];

               // Define field labels for better readability
               const fieldLabels: { [key: string]: string } = {
                    title: 'Title',
                    description: 'Description',
                    type: 'Incident Type',
                    severity: 'Severity',
                    status: 'Status',
                    employeeId: 'Employee ID',
                    reportedByUsername: 'Reported By (Username)',
                    reportedByEmail: 'Reported By (Email)',
                    reportedByRole: 'Reported By (Role)',
                    location: 'Location',
                    affectedParties: 'Affected Parties',
                    immediateActions: 'Immediate Actions',
                    rootCause: 'Root Cause',
                    correctiveActions: 'Corrective Actions',
                    regulatoryReporting: 'Regulatory Reporting Required',
                    escalatedTo: 'Escalated To',
                    followUpDate: 'Follow-up Date',
                    resolutionDate: 'Resolution Date',
                    updatedAt: 'Updated At',
                    createdAt: 'Created At'
               };

               // Define value mappings for enums
               const statusLabels: { [key: string]: string } = {
                    'reported': 'Reported',
                    'investigating': 'Under Investigation',
                    'root-cause-analysis': 'Root Cause Analysis',
                    'corrective-actions': 'Corrective Actions Planned',
                    'resolved': 'Resolved',
                    'closed': 'Closed'
               };

               const severityLabels: { [key: string]: string } = {
                    'low': 'Low',
                    'medium': 'Medium',
                    'high': 'High',
                    'critical': 'Critical'
               };

               const typeLabels: { [key: string]: string } = {
                    'patient-safety': 'Patient Safety',
                    'quality': 'Quality Issue',
                    'security': 'Security Incident',
                    'compliance': 'Compliance Violation'
               };

               // Compare all fields
               Object.keys(newObj).forEach(key => {
                    if (oldObj[key] !== newObj[key]) {
                         const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                         let oldDisplay = oldObj[key];
                         let newDisplay = newObj[key];

                         // Format specific field types
                         if (key === 'status') {
                              oldDisplay = statusLabels[oldObj[key]] || oldObj[key];
                              newDisplay = statusLabels[newObj[key]] || newObj[key];
                         } else if (key === 'severity') {
                              oldDisplay = severityLabels[oldObj[key]] || oldObj[key];
                              newDisplay = severityLabels[newObj[key]] || newObj[key];
                         } else if (key === 'type') {
                              oldDisplay = typeLabels[oldObj[key]] || oldObj[key];
                              newDisplay = typeLabels[newObj[key]] || newObj[key];
                         } else if (key === 'regulatoryReporting') {
                              oldDisplay = oldObj[key] ? 'Yes' : 'No';
                              newDisplay = newObj[key] ? 'Yes' : 'No';
                         } else if (key.includes('Date') && oldObj[key]) {
                              oldDisplay = new Date(oldObj[key]).toLocaleDateString();
                         } else if (key.includes('Date') && newObj[key]) {
                              newDisplay = new Date(newObj[key]).toLocaleDateString();
                         }

                         // Handle complex objects that shouldn't be displayed as strings
                         if (key === 'rootCauseAnalysis' || key === 'correctiveActionPlan' || key === 'investigationNotes' || key === 'attachments') {
                              oldDisplay = '(complex data updated)';
                              newDisplay = '(complex data updated)';
                         } else if (key === 'updatedAt' || key === 'createdAt') {
                              // Format timestamps properly
                              oldDisplay = oldObj[key] ? new Date(oldObj[key]).toLocaleString() : '(empty)';
                              newDisplay = newObj[key] ? new Date(newObj[key]).toLocaleString() : '(empty)';
                         } else if (typeof oldObj[key] === 'object' && oldObj[key] !== null) {
                              oldDisplay = '(object data)';
                         } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
                              newDisplay = '(object data)';
                         }

                         changes.push(`${label}: "${oldDisplay}" → "${newDisplay}"`);
                    }
               });

               // Handle root cause analysis changes
               if (oldObj.rootCauseAnalysis && newObj.rootCauseAnalysis) {
                    const oldAnalysis = oldObj.rootCauseAnalysis;
                    const newAnalysis = newObj.rootCauseAnalysis;

                    ['what', 'why', 'when', 'where', 'who', 'how'].forEach(field => {
                         if (oldAnalysis[field] !== newAnalysis[field]) {
                              const fieldLabels: { [key: string]: string } = {
                                   what: 'What happened',
                                   why: 'Why it happened',
                                   when: 'When it happened',
                                   where: 'Where it happened',
                                   who: 'Who was involved',
                                   how: 'How it happened'
                              };
                              const label = fieldLabels[field] || field;
                              changes.push(`${label}: "${oldAnalysis[field] || '(empty)'}" → "${newAnalysis[field] || '(empty)'}"`);
                         }
                    });
               }

               // Handle corrective action plan changes
               if (oldObj.correctiveActionPlan && newObj.correctiveActionPlan) {
                    const oldPlan = oldObj.correctiveActionPlan;
                    const newPlan = newObj.correctiveActionPlan;

                    if (JSON.stringify(oldPlan.actions) !== JSON.stringify(newPlan.actions)) {
                         changes.push('Corrective action plan was updated');
                    }
               }

               return changes.length > 0 ? changes : ['No field changes detected'];
          } catch (error) {
               return ['Unable to parse change details'];
          }
     };

     return (
          <div className="row g-3">
               <div className="col-12">
                    <div className="card">
                         <div className="card-header">
                              <h5 className="card-title mb-0">Audit Trail</h5>
                         </div>
                         <div className="card-body">
                              {/* Filters */}
                              <div className="row g-3 mb-4">
                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label className="fw-semibold">Action Type</Form.Label>
                                             <Form.Select
                                                  value={auditTrailFilters.action}
                                                  onChange={(e) => setAuditTrailFilters(prev => ({ ...prev, action: e.target.value }))}
                                             >
                                                  <option value="">All Actions</option>
                                                  <option value="CREATE">CREATE</option>
                                                  <option value="UPDATE">UPDATE</option>
                                                  <option value="DELETE">DELETE</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </div>
                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label className="fw-semibold">Employee ID</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  value={auditTrailFilters.employeeId}
                                                  onChange={(e) => setAuditTrailFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                                                  placeholder="Filter by employee ID"
                                             />
                                        </Form.Group>
                                   </div>
                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label className="fw-semibold">Start Date</Form.Label>
                                             <Form.Control
                                                  type="date"
                                                  value={auditTrailFilters.start_date}
                                                  onChange={(e) => setAuditTrailFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                             />
                                        </Form.Group>
                                   </div>
                                   <div className="col-md-3">
                                        <Form.Group>
                                             <Form.Label className="fw-semibold">End Date</Form.Label>
                                             <Form.Control
                                                  type="date"
                                                  value={auditTrailFilters.end_date}
                                                  onChange={(e) => setAuditTrailFilters(prev => ({ ...prev, end_date: e.target.value }))}
                                             />
                                        </Form.Group>
                                   </div>
                              </div>

                              <div className="d-flex gap-2 mb-4">
                                   <Button
                                        variant="primary"
                                        onClick={() => fetchAuditTrail()}
                                        disabled={auditTrailLoading}
                                   >
                                        {auditTrailLoading ? 'Loading...' : 'Apply Filters'}
                                   </Button>
                                   <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                             setAuditTrailFilters({
                                                  action: '',
                                                  employeeId: '',
                                                  start_date: '',
                                                  end_date: '',
                                                  page: 1,
                                                  count: 10
                                             });
                                             fetchAuditTrail({
                                                  action: '',
                                                  employeeId: '',
                                                  start_date: '',
                                                  end_date: '',
                                                  page: 1,
                                                  count: 10
                                             });
                                        }}
                                   >
                                        Clear Filters
                                   </Button>
                              </div>

                              {/* Audit Trail Table */}
                              <div className="table-responsive">
                                   <table className="table table-striped table-hover">
                                        <thead className="table-dark">
                                             <tr>
                                                  <th>Timestamp</th>
                                                  <th>Action</th>
                                                  <th>Employee</th>
                                                  <th>Incident ID</th>
                                                  <th>Details</th>
                                                  <th>Changes</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {auditTrailLoading ? (
                                                  <tr>
                                                       <td colSpan={6} className="text-center py-4">
                                                            <div className="d-flex justify-content-center">
                                                                 <div className="spinner-border spinner-border-sm" role="status">
                                                                      <span className="visually-hidden">Loading...</span>
                                                                 </div>
                                                                 <span className="ms-2">Loading audit trail...</span>
                                                            </div>
                                                       </td>
                                                  </tr>
                                             ) : auditTrail.length === 0 ? (
                                                  <tr>
                                                       <td colSpan={6} className="text-center py-4 text-muted">
                                                            No audit trail entries found
                                                       </td>
                                                  </tr>
                                             ) : (
                                                  auditTrail.map((entry) => (
                                                       <tr key={entry.id}>
                                                            <td className="text-nowrap">
                                                                 {new Date(entry.timestamp).toLocaleString()}
                                                            </td>
                                                            <td>
                                                                 <span className={`badge ${entry.action === 'CREATE' ? 'bg-success' :
                                                                      entry.action === 'UPDATE' ? 'bg-warning' :
                                                                           'bg-danger'
                                                                      }`}>
                                                                      {entry.action}
                                                                 </span>
                                                            </td>
                                                            <td>{entry.employeeUsername || entry.employeeId} {entry.employeeRole && `(${entry.employeeRole})`}</td>
                                                            <td className="text-nowrap">{entry.incidentId}</td>
                                                            <td style={{ maxWidth: '300px' }}>
                                                                 <small className="text-muted">{entry.details}</small>
                                                            </td>
                                                            <td style={{ maxWidth: '400px' }}>
                                                                 {entry.oldValue && entry.newValue && (
                                                                      <details>
                                                                           <summary className="text-primary" style={{ cursor: 'pointer' }}>
                                                                                View Changes ({formatChanges(entry.oldValue, entry.newValue).length} change{formatChanges(entry.oldValue, entry.newValue).length !== 1 ? 's' : ''})
                                                                           </summary>
                                                                           <div className="mt-2">
                                                                                <div className="bg-light p-2 rounded small">
                                                                                     <ul className="mb-0" style={{ fontSize: '0.85rem' }}>
                                                                                          {formatChanges(entry.oldValue, entry.newValue).map((change, index) => (
                                                                                               <li key={index} className="mb-1">{change}</li>
                                                                                          ))}
                                                                                     </ul>
                                                                                </div>
                                                                           </div>
                                                                      </details>
                                                                 )}
                                                            </td>
                                                       </tr>
                                                  ))
                                             )}
                                        </tbody>
                                   </table>
                              </div>

                              {/* Pagination */}
                              {auditTrailPagination.totalPages > 1 && (
                                   <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="text-muted">
                                             Showing {((auditTrailPagination.page - 1) * auditTrailPagination.count) + 1} to {Math.min(auditTrailPagination.page * auditTrailPagination.count, auditTrailPagination.total)} of {auditTrailPagination.total} entries
                                        </div>
                                        <div className="d-flex gap-2">
                                             <Button
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  disabled={auditTrailPagination.page === 1}
                                                  onClick={() => {
                                                       const newPage = auditTrailPagination.page - 1;
                                                       setAuditTrailFilters(prev => ({ ...prev, page: newPage }));
                                                       fetchAuditTrail({ ...auditTrailFilters, page: newPage });
                                                  }}
                                             >
                                                  Previous
                                             </Button>
                                             <span className="align-self-center px-3">
                                                  Page {auditTrailPagination.page} of {auditTrailPagination.totalPages}
                                             </span>
                                             <Button
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  disabled={auditTrailPagination.page === auditTrailPagination.totalPages}
                                                  onClick={() => {
                                                       const newPage = auditTrailPagination.page + 1;
                                                       setAuditTrailFilters(prev => ({ ...prev, page: newPage }));
                                                       fetchAuditTrail({ ...auditTrailFilters, page: newPage });
                                                  }}
                                             >
                                                  Next
                                             </Button>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}