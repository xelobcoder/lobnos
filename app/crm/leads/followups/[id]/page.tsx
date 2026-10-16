'use client';
import { RiPhoneLine, RiMailLine, RiUserLine, RiMapPinLine, RiCalendarLine, RiArrowLeftLine, RiAddLine, RiTimeLine, RiDeleteBinLine } from "@remixicon/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { customPost, customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../../../components/Auth/roles";

interface Lead {
     id: number;
     firstname: string;
     lastname: string;
     middlename?: string;
     contact_person: string;
     contact_email: string;
     contact_phone: string;
     company_name?: string;
     location: string;
     industry_type: string;
     lead_source: string;
     status: string;
     priority: string;
     created_at: string;
     updated_at: string;
}

interface FollowUp {
     id: number;
     lead_id: number;
     followup_type: string;
     followup_date: string;
     notes: string;
     next_followup_date?: string;
     priority: string;
     status: string;
     created_by?: number;
     created_by_username?: string;
     created_at: string;
     updated_at: string;
}

export default function LeadFollowups() {
     const params = useParams();
     const leadId = params?.id || '' as string;
     const [lead, setLead] = useState<Lead | null>(null);
     const [followups, setFollowups] = useState<FollowUp[]>([]);
     const [loading, setLoading] = useState(true);
     const [showAddModal, setShowAddModal] = useState(false);
     const [showNotesModal, setShowNotesModal] = useState(false);
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [selectedFollowup, setSelectedFollowup] = useState<FollowUp | null>(null);
     const [followupToDelete, setFollowupToDelete] = useState<FollowUp | null>(null);
     const [highlightRows, setHighlightRows] = useState(false);
     const [followupForm, setFollowupForm] = useState({
          followup_type: 'call',
          followup_date: '',
          notes: '',
          next_followup_date: '',
          priority: 'medium'
     });
     const {user}= useApplication();
     const employeeid = user?.employeeid;

     const fetchLeadDetails = async () => {
          try {
               const response = await customFetch(`leads/${leadId}?employeeid=${employeeid}`);
               if (response.success && response.data) {
                    setLead(response.data);
               } else {
                    toast.error('Failed to load lead details');
               }
          } catch (error) {
               console.error('Error fetching lead:', error);
               toast.error('Error loading lead details');
          }
     };

     const fetchFollowups = async () => {
          try {
               const response = await customFetch(`followups/lead/${leadId}`);
               if (response.success && Array.isArray(response.data)) {
                    setFollowups(response.data);
               } else {
                    setFollowups([]);
               }
          } catch (error) {
               console.error('Error fetching follow-ups:', error);
               setFollowups([]);
          } finally {
               setLoading(false);
          }
     };

     const handleFollowupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          const { name, value } = e.target;
          setFollowupForm(prev => ({ ...prev, [name]: value }));
     };

     const handleFollowupSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!lead) return;

          try {
               if (!leadId)  return;
               const followupData = {
                    lead_id: parseInt(leadId.toString()),
                    followup_type: followupForm.followup_type,
                    followup_date: followupForm.followup_date || new Date().toISOString().split('T')[0],
                    notes: followupForm.notes,
                    next_followup_date: followupForm.next_followup_date,
                    priority: followupForm.priority,
                    status: 'pending',
                    created_by: employeeid
               };
               const response = await customPost(`followups?tenantId=${process.env.TENANTID}`, 'POST', followupData);
               if (response.success) {
                    toast.success(response.message || 'Follow-up added successfully');
                    setShowAddModal(false);
                    setFollowupForm({
                         followup_type: 'call',
                         followup_date: '',
                         notes: '',
                         next_followup_date: '',
                         priority: 'medium'
                    });
                    fetchFollowups(); // Refresh the follow-ups list
               } else {
                    toast.error(response.message || 'Failed to add follow-up');
               }
          } catch (error) {
               console.error('Error adding follow-up:', error);
               toast.error('Error adding follow-up');
          }
     };

     const handleNotesClick = (followup: FollowUp) => {
          setSelectedFollowup(followup);
          setShowNotesModal(true);
     };

     const canDeleteFollowup = (followup: FollowUp) => {
          if (!user) return false;
          const isAdmin = roleAllowed(user.role, ['admin']);
          if (isAdmin) return true;

          const isCreator = user.employeeid === followup.created_by;
          if (isCreator) {
               const createdAt = new Date(followup.created_at);
               const now = new Date();
               const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
               return hoursDiff <= 6;
          }
          return false;
     };

     const handleDeleteFollowup = (followup: FollowUp) => {
          setFollowupToDelete(followup);
          setShowDeleteModal(true);
     };

     const confirmDeleteFollowup = async () => {
          if (!followupToDelete) return;

          try {
               const response = await customPost(`followups/${followupToDelete.id}?tenantId=${process.env.TENANTID}`, 'DELETE', {});
               if (response.success) {
                    toast.success(response.message || 'Follow-up deleted successfully');
                    fetchFollowups();
               } else {
                    toast.error(response.message || 'Failed to delete follow-up');
               }
          } catch (error) {
               console.error('Error deleting follow-up:', error);
               toast.error('Error deleting follow-up');
          } finally {
               setShowDeleteModal(false);
               setFollowupToDelete(null);
          }
     };

     const cancelDeleteFollowup = () => {
          setShowDeleteModal(false);
          setFollowupToDelete(null);
     };

     useEffect(() => {
          if (leadId) {
               fetchLeadDetails();
               fetchFollowups();
          }
     }, [leadId]);

     const getStatusBadge = (status: string) => {
          const statusClasses = {
               pending: 'badge bg-warning',
               completed: 'badge bg-success',
               cancelled: 'badge bg-danger'
          };
          return statusClasses[status as keyof typeof statusClasses] || 'badge bg-secondary';
     };

     const getPriorityBadge = (priority: string) => {
          const priorityClasses = {
               low: 'badge bg-light text-dark',
               medium: 'badge bg-warning',
               high: 'badge bg-danger',
               urgent: 'badge bg-dark'
          };
          return priorityClasses[priority as keyof typeof priorityClasses] || 'badge bg-light text-dark';
     };

     const getRowClass = (status: string, priority: string) => {
          if (!highlightRows) return '';

          // Status takes precedence
          if (status === 'completed') return 'table-success';
          if (status === 'cancelled') return 'table-danger';

          // Then priority for pending items
          if (priority === 'urgent') return 'table-danger';
          if (priority === 'high') return 'table-warning';
          if (priority === 'medium') return 'table-primary';
          if (priority === 'low') return 'table-secondary';

          return '';
     };

     const getTypeIcon = (type: string) => {
          const typeIcons = {
               call: RiPhoneLine,
               email: RiMailLine,
               meeting: RiUserLine,
               visit: RiMapPinLine,
               other: RiCalendarLine
          };
          const IconComponent = typeIcons[type as keyof typeof typeIcons] || RiCalendarLine;
          return <IconComponent size={16} />;
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <p className="mt-2">Loading follow-ups...</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid #dee2e6' }}>
                    <div>
                         <h4 className="mb-1 fw-semibold">Lead Follow-ups</h4>
                         <p className="text-muted mb-0 small">View and manage follow-up activities</p>
                    </div>
                    <button
                         className="btn btn-outline-secondary btn-sm"
                         onClick={() => window.history.back()}
                    >
                         <RiArrowLeftLine size={16} className="me-1" />
                         Back
                    </button>
               </div>

               {/* Lead Information - Compact */}
               {lead && (
                    <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#fafafa' }}>
                         <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                              <div className="d-flex align-items-center">
                                   <RiUserLine size={18} className="me-2 text-secondary" />
                                   <strong className="me-3">{lead.firstname} {lead.lastname}</strong>
                                   <span className="text-muted small me-2">|</span>
                                   <RiMailLine size={14} className="me-1 text-secondary" />
                                   <span className="small me-3">{lead.contact_email}</span>
                                   <span className="text-muted small me-2">|</span>
                                   <RiPhoneLine size={14} className="me-1 text-secondary" />
                                   <span className="small me-3">{lead.contact_phone}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                   <span className="small text-muted">{lead.company_name || 'N/A'}</span>
                                   <span className="text-muted small">|</span>
                                   <span className="small text-muted">{lead.location}</span>
                                   <span className="text-muted small">|</span>
                                   <span className={`badge ${getStatusBadge(lead.status)}`} style={{ fontSize: '0.75rem' }}>
                                        {lead.status.replace('_', ' ')}
                                   </span>
                                   <span className={`badge ${getPriorityBadge(lead.priority)}`} style={{ fontSize: '0.75rem' }}>
                                        {lead.priority}
                                   </span>
                              </div>
                         </div>
                    </div>
               )}

               {/* Follow-ups Table */}
               <div className="border rounded">
                    <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                         <div className="d-flex align-items-center">
                              <RiCalendarLine size={18} className="me-2 text-secondary" />
                              <h6 className="mb-0 fw-semibold">Follow-up History</h6>
                              <span className="badge bg-secondary ms-2 small">{followups.length}</span>
                         </div>
                         <div className="d-flex align-items-center gap-2">
                              <div className="form-check form-switch">
                                   <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="highlightRowsToggle"
                                        checked={highlightRows}
                                        onChange={(e) => setHighlightRows(e.target.checked)}
                                   />
                                   <label className="form-check-label small text-muted" htmlFor="highlightRowsToggle">
                                        Highlight Rows
                                   </label>
                              </div>
                              <button
                                   className="btn btn-outline-dark btn-sm"
                                   onClick={() => setShowAddModal(true)}
                              >
                                   <RiAddLine size={16} className="me-1" />
                                   Add Follow-up
                              </button>
                         </div>
                    </div>
                    {followups.length === 0 ? (
                         <div className="text-center py-5">
                              <RiCalendarLine size={40} className="text-muted mb-2" />
                              <p className="text-muted small mb-3">No follow-ups recorded</p>
                              <button className="btn btn-outline-dark btn-sm" onClick={() => setShowAddModal(true)}>
                                   <RiAddLine size={14} className="me-1" />
                                   Add Follow-up
                              </button>
                         </div>
                    ) : (
                         <div className="table-responsive">
                              <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                                   <thead style={{ backgroundColor: '#fafafa' }}>
                                        <tr>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Type</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Date</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Next Follow-up</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Notes</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Created By</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Created</th>
                                             <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {followups.map((followup, index) => (
                                             <tr key={followup.id} className={getRowClass(followup.status, followup.priority)}>
                                                  <td className="border-0 py-2 px-3">
                                                       <div className="d-flex align-items-center">
                                                            {getTypeIcon(followup.followup_type)}
                                                            <span className="ms-2 text-capitalize">{followup.followup_type}</span>
                                                       </div>
                                                  </td>
                                                  <td className="border-0 py-2 px-3">
                                                       <RiTimeLine size={14} className="me-1 text-secondary" />
                                                       {new Date(followup.followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                  </td>
                                                  <td className="border-0 py-2 px-3">
                                                       {followup.next_followup_date ? (
                                                            <span>{new Date(followup.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                       ) : (
                                                            <span className="text-muted">—</span>
                                                       )}
                                                  </td>
                                                  <td className="border-0 py-2 px-3" style={{ maxWidth: '300px', cursor: 'pointer' }} onClick={() => handleNotesClick(followup)}>
                                                       <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={followup.notes}>
                                                            {followup.notes}
                                                       </div>
                                                  </td>
                                                  <td className="border-0 py-2 px-3 text-muted small">
                                                       {followup.created_by_username || 'Unknown'}
                                                  </td>
                                                  <td className="border-0 py-2 px-3 text-muted small">
                                                       {new Date(followup.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                  </td>
                                                  <td className="border-0 py-2 px-3">
                                                       {canDeleteFollowup(followup) && (
                                                            <button
                                                                 className="btn btn-sm btn-outline-danger"
                                                                 onClick={() => handleDeleteFollowup(followup)}
                                                                 title="Delete follow-up"
                                                            >
                                                                 <RiDeleteBinLine size={14} />
                                                            </button>
                                                       )}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>

               {/* Add Follow-up Modal */}
               {showAddModal && lead && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiCalendarLine size={20} className="me-2" />
                                             Add Follow-up for {lead.firstname} {lead.lastname}
                                        </h5>
                                        <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                   </div>
                                   <form onSubmit={handleFollowupSubmit}>
                                        <div className="modal-body">
                                             <div className="row">
                                                  <div className="col-md-6">
                                                       <div className="form-group mb-3">
                                                            <label className="form-label">Follow-up Type</label>
                                                            <select
                                                                 name="followup_type"
                                                                 value={followupForm.followup_type}
                                                                 onChange={handleFollowupChange}
                                                                 className="form-select form-select-sm"
                                                                 required
                                                            >
                                                                 <option value="call">Call</option>
                                                                 <option value="email">Email</option>
                                                                 <option value="meeting">Meeting</option>
                                                                 <option value="visit">Visit</option>
                                                                 <option value="other">Other</option>
                                                            </select>
                                                       </div>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <div className="form-group mb-3">
                                                            <label className="form-label">Priority</label>
                                                            <select
                                                                 name="priority"
                                                                 value={followupForm.priority}
                                                                 onChange={handleFollowupChange}
                                                                 className="form-select form-select-sm"
                                                                 required
                                                            >
                                                                 <option value="low">Low</option>
                                                                 <option value="medium">Medium</option>
                                                                 <option value="high">High</option>
                                                                 <option value="urgent">Urgent</option>
                                                            </select>
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="row">
                                                  <div className="col-md-6">
                                                       <div className="form-group mb-3">
                                                            <label className="form-label">Follow-up Date</label>
                                                            <input
                                                                 type="date"
                                                                 name="followup_date"
                                                                 value={followupForm.followup_date}
                                                                 onChange={handleFollowupChange}
                                                                 className="form-control form-control-sm"
                                                            />
                                                       </div>
                                                  </div>
                                                  <div className="col-md-6">
                                                       <div className="form-group mb-3">
                                                            <label className="form-label">Next Follow-up Date</label>
                                                            <input
                                                                 type="date"
                                                                 name="next_followup_date"
                                                                 value={followupForm.next_followup_date}
                                                                 onChange={handleFollowupChange}
                                                                 className="form-control form-control-sm"
                                                                 required
                                                            />
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="form-group mb-3">
                                                  <label className="form-label">Notes</label>
                                                  <textarea
                                                       name="notes"
                                                       value={followupForm.notes}
                                                       onChange={handleFollowupChange}
                                                       className="form-control form-control-sm"
                                                       rows={4}
                                                       placeholder="Enter follow-up notes..."
                                                       required
                                                  />
                                             </div>
                                        </div>
                                        <div className="modal-footer">
                                             <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-outline-primary btn-sm">
                                                  Save Follow-up
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>
               )}

               {/* Notes Modal */}
               {showNotesModal && selectedFollowup && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiCalendarLine size={20} className="me-2" />
                                             Follow-up Notes
                                        </h5>
                                        <button type="button" className="btn-close" onClick={() => setShowNotesModal(false)}></button>
                                   </div>
                                   <div className="modal-body">
                                        <div style={{
                                             whiteSpace: 'pre-wrap',
                                             lineHeight: '1.5',
                                             maxHeight: '400px',
                                             overflowY: 'auto',
                                             wordWrap: 'break-word'
                                        }}>
                                             {selectedFollowup.notes}
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowNotesModal(false)}>
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Delete Confirmation Modal */}
               {showDeleteModal && followupToDelete && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiDeleteBinLine size={20} className="me-2 text-danger" />
                                             Confirm Deletion
                                        </h5>
                                        <button type="button" className="btn-close" onClick={cancelDeleteFollowup}></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="text-center bg-danger-subtle br-5 p-3 text-sm mb-3">
                                             <RiDeleteBinLine size={20} className="text-danger mb-3" />
                                             <h6>Are you sure you want to delete this follow-up?</h6>
                                        </div>
                                        <div className="border rounded p-3 bg-light text-sm">
                                             <div className="row">
                                                  <div className="col-sm-6">
                                                       <strong>Type:</strong> {followupToDelete.followup_type.charAt(0).toUpperCase() + followupToDelete.followup_type.slice(1)}
                                                  </div>
                                                  <div className="col-sm-6">
                                                       <strong>Date:</strong> {new Date(followupToDelete.followup_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                       })}
                                                  </div>
                                             </div>
                                             <div className="mt-2">
                                                  <strong>Notes:</strong>
                                                  <div
                                                       className="mt-1 border rounded p-2 bg-white"
                                                       style={{
                                                            maxHeight: '100px',
                                                            overflowY: 'auto',
                                                            wordWrap: 'break-word',
                                                            fontSize: '0.875rem',
                                                            lineHeight: '1.4'
                                                       }}
                                                       title={followupToDelete.notes}
                                                  >
                                                       {followupToDelete.notes}
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="alert alert-warning mt-3">
                                             <small><strong>Warning:</strong> This action cannot be undone. The follow-up will be permanently deleted.</small>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelDeleteFollowup}>
                                             Cancel
                                        </button>
                                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={confirmDeleteFollowup}>
                                             <RiDeleteBinLine size={14} className="me-1" />
                                             Delete Follow-up
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>

     );
}