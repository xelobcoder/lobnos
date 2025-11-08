import React, { useState, useEffect } from 'react';
import { Button, Form, Offcanvas } from 'react-bootstrap';
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
     const [showFilters, setShowFilters] = useState(false);

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
               const oldObj = oldValue ? JSON.parse(oldValue) : {};
               const newObj = newValue ? JSON.parse(newValue) : {};
               const changes: string[] = [];

               const renderValue = (v: any) => {
                    if (v === null || v === undefined || v === '') return '(empty)';
                    if (Array.isArray(v)) return v.join(', ');
                    if (typeof v === 'object') return JSON.stringify(v, null, 0);
                    return String(v);
               };

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
                    const oldVal = oldObj[key];
                    const newVal = newObj[key];
                    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                         const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                         let oldDisplay: any = oldVal;
                         let newDisplay: any = newVal;

                         // Format specific field types
                         if (key === 'status') {
                              oldDisplay = statusLabels[oldVal] || oldVal;
                              newDisplay = statusLabels[newVal] || newVal;
                         } else if (key === 'severity') {
                              oldDisplay = severityLabels[oldVal] || oldVal;
                              newDisplay = severityLabels[newVal] || newVal;
                         } else if (key === 'type') {
                              oldDisplay = typeLabels[oldVal] || oldVal;
                              newDisplay = typeLabels[newVal] || newVal;
                         } else if (key === 'regulatoryReporting') {
                              oldDisplay = oldVal ? 'Yes' : 'No';
                              newDisplay = newVal ? 'Yes' : 'No';
                         } else if (key.includes('Date')) {
                              if (oldVal) oldDisplay = new Date(oldVal).toLocaleDateString();
                              if (newVal) newDisplay = new Date(newVal).toLocaleDateString();
                         }

                         changes.push(`${label}: "${renderValue(oldDisplay)}" → "${renderValue(newDisplay)}"`);
                    }
               });

               // Handle root cause analysis changes
               if (oldObj.rootCauseAnalysis || newObj.rootCauseAnalysis) {
                    const oldAnalysis = oldObj.rootCauseAnalysis || {};
                    const newAnalysis = newObj.rootCauseAnalysis || {};

                    ['what', 'why', 'when', 'where', 'who', 'how'].forEach(field => {
                         if (JSON.stringify(oldAnalysis[field]) !== JSON.stringify(newAnalysis[field])) {
                              const subLabels: { [key: string]: string } = {
                                   what: 'What happened',
                                   why: 'Why it happened',
                                   when: 'When it happened',
                                   where: 'Where it happened',
                                   who: 'Who was involved',
                                   how: 'How it happened'
                              };
                              const label = subLabels[field] || field;
                              changes.push(`${label}: "${renderValue(oldAnalysis[field])}" → "${renderValue(newAnalysis[field])}"`);
                         }
                    });
               }

               // Handle corrective action plan changes
               if (oldObj.correctiveActionPlan || newObj.correctiveActionPlan) {
                    const oldPlan = oldObj.correctiveActionPlan || {};
                    const newPlan = newObj.correctiveActionPlan || {};
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
          <>
               <div>
                    <div className="row g-3">
                         <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0">Audit Trail</h5>
                                   <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setShowFilters(true)}
                                   >
                                        Filters
                                   </Button>
                              </div>
                              <div>
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
                                                       auditTrail.map((entry) => {
                                                            const changes = entry.oldValue && entry.newValue ? formatChanges(entry.oldValue, entry.newValue) : [];
                                                            return (
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
                                                                           {changes.length > 0 && (
                                                                                <details>
                                                                                     <summary className="text-primary" style={{ cursor: 'pointer' }}>
                                                                                          View Changes ({changes.length} change{changes.length !== 1 ? 's' : ''})
                                                                                     </summary>
                                                                                     <div className="mt-2">
                                                                                          <div className="bg-light p-2 rounded small">
                                                                                               <ul className="mb-0" style={{ fontSize: '0.85rem' }}>
                                                                                                    {changes.map((change, index) => (
                                                                                                         <li key={index} className="mb-1">{change}</li>
                                                                                                    ))}
                                                                                               </ul>
                                                                                          </div>
                                                                                     </div>
                                                                                </details>
                                                                           )}
                                                                      </td>
                                                                 </tr>
                                                            );
                                                       })
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
               <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title>Filter Audit Trail</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="row g-3">
                              <div className="col-12">
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
                              <div className="col-12">
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
                              <div className="col-12">
                                   <Form.Group>
                                        <Form.Label className="fw-semibold">Start Date</Form.Label>
                                        <Form.Control
                                             type="date"
                                             value={auditTrailFilters.start_date}
                                             onChange={(e) => setAuditTrailFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                        />
                                   </Form.Group>
                              </div>
                              <div className="col-12">
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
                    </Offcanvas.Body>
                    <div className="p-3 border-top d-flex gap-2">
                         <Button
                              variant="primary"
                              size="sm"
                              className="flex-grow-1"
                              onClick={() => {
                                   fetchAuditTrail();
                                   setShowFilters(false);
                              }}
                              disabled={auditTrailLoading}
                         >
                              {auditTrailLoading ? 'Loading...' : 'Apply Filters'}
                         </Button>
                         <Button
                              variant="outline-secondary"
                              size="sm"
                              className="flex-grow-1"
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
               </Offcanvas>
          </>
     );
}