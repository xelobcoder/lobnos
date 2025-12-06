"use client"
import React, { useState, useEffect } from 'react';
import {
     RiPhoneLine,
     RiMailLine,
     RiCalendarLine,
     RiCheckLine,
     RiTimeLine,
     RiUserLine
} from '@remixicon/react';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';

interface FollowUpItem {
     id: number;
     lead_id: number;
     followup_type: string;
     followup_date: string;
     notes: string;
     next_followup_date: string;
     priority: string;
     status: string;
     created_by?: number;
     created_at: string;
     updated_at: string;
     firstname?: string;
     lastname?: string;
     middlename?: string;
     contact_person?: string;
     contact_email?: string;
     contact_phone?: string;
     company_name?: string;
     industry_type?: string;
     lead_source?: string;
     service_interest?: string;
     location?: string;
     assigned_to?: number;
     created_by_username?: string;
     lead_status?: string;
     lead_priority?: string;
}

interface ScheduleFormData {
     followup_date: string;
     followup_type: string;
     priority: string;
     status: string;
     notes: string;
}

export default function LeadsFollowUp() {
     const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [showScheduleModal, setShowScheduleModal] = useState(false);
     const [currentLead, setCurrentLead] = useState<FollowUpItem | null>(null);
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(10);
     const [totalRecords, setTotalRecords] = useState(0);
     const [serverTotalPages, setServerTotalPages] = useState(1);
     const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
          followup_date: '',
          followup_type: 'call',
          priority: 'medium',
          status: 'scheduled',
          notes: ''
     });

     useEffect(() => {
          const fetchFollowUps = async () => {
               try {
                    setLoading(true);
                    const response = await customFetch(`followups?page=${currentPage}&count=${itemsPerPage}`);
                    const { success, data, totalPages, total } = response;
                    if (success && data && Array.isArray(data)) {
                         setFollowUps(data);
                         setTotalRecords(total || 0);
                         setServerTotalPages(totalPages || 1);
                    } else {
                         setFollowUps([]);
                         setTotalRecords(0);
                         setServerTotalPages(1);
                    }
               } catch (error) {
                    console.error('Error fetching follow-ups:', error);
                    toast.error('Error fetching follow-ups');
               } finally {
                    setLoading(false);
               }
          };

          fetchFollowUps();
     }, [currentPage]);

     const filteredLeads = followUps.filter(item =>
          item.followup_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lead_id.toString().includes(searchTerm) ||
          item.id.toString().includes(searchTerm) ||
          (item.firstname && item.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.lastname && item.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.contact_person && item.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.contact_email && item.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.company_name && item.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.created_by_username && item.created_by_username.toLowerCase().includes(searchTerm.toLowerCase()))
     );

     // Reset to page 1 when search changes
     useEffect(() => {
          setCurrentPage(1);
     }, [searchTerm]);

     // Use server-side pagination
     const totalPages = serverTotalPages;
     const paginatedLeads = followUps;

     const handlePageChange = (page: number) => {
          if (page < 1) {
               setCurrentPage(serverTotalPages);
          } else if (page > serverTotalPages) {
               setCurrentPage(1);
          } else {
               setCurrentPage(page);
          }
     };

     const handleItemsPerPageChange = (value: number) => {
          setItemsPerPage(value);
          setCurrentPage(1);
     };

     const getFollowUpTypeIcon = (type: string) => {
          switch (type) {
               case 'call':
                    return <RiPhoneLine size={14} className="text-primary" />;
               case 'email':
                    return <RiMailLine size={14} className="text-info" />;
               case 'meeting':
                    return <RiCalendarLine size={14} className="text-success" />;
               default:
                    return <RiTimeLine size={14} className="text-muted" />;
          }
     };

     const isOverdue = (nextFollowupDate: string) => {
          const today = new Date();
          const followupDate = new Date(nextFollowupDate);
          return followupDate < today;
     };

     const getRowClass = (status: string, priority: string) => {
          // Status-based colors
          if (status === 'completed' || status === 'qualified') return 'table-success';
          if (status === 'pending' || status === 'scheduled') return 'table-info';
          if (status === 'overdue' || status === 'cancelled') return 'table-secondary';

          // Priority-based colors (if no status match)
          if (priority === 'urgent') return 'table-danger';
          if (priority === 'high') return 'table-warning';

          return '';
     };

     const handleScheduleFollowUp = (lead: FollowUpItem) => {
          setCurrentLead(lead);
          setScheduleForm({
               followup_date: new Date(lead.next_followup_date).toISOString().slice(0, 10) || '',
               followup_type: lead.followup_type || 'call',
               priority: lead.priority,
               status: lead.status || 'scheduled',
               notes: lead.notes || ''
          });
          setShowScheduleModal(true);
     };

     const handleScheduleSubmit = async () => {
          if (!scheduleForm.followup_date) {
               toast.error('Please select a follow-up date.');
               return;
          }

          if (!currentLead) return;

          try {
               const updateData = {
                    ...currentLead,
                    next_followup_date: scheduleForm.followup_date,
                    followup_type: scheduleForm.followup_type,
                    priority: scheduleForm.priority,
                    status: scheduleForm.status,
                    notes: scheduleForm.notes || currentLead.notes
               };

               const result = await customPost(`followups/${currentLead.id}`, 'PUT', updateData);

               if (result.success) {
                    toast.success('Follow-up updated successfully!');
                    const fetchResponse = await customFetch('followups');
                    if (fetchResponse.success && fetchResponse.data) {
                         setFollowUps(fetchResponse.data);
                    }
                    setShowScheduleModal(false);
                    setCurrentLead(null);
               } else {
                    toast.error(result.message || 'Failed to update follow-up');
               }
          } catch (error) {
               console.error('Error updating follow-up:', error);
               toast.error('Error updating follow-up');
          }
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <p className="mt-2">Loading follow-up leads...</p>
                    </div>
               </div>
          );
     }

     const overdueCount = followUps.filter(item => isOverdue(item.next_followup_date)).length;
     const todayCount = followUps.filter(item => {
          const today = new Date().toDateString();
          const followupDate = new Date(item.next_followup_date).toDateString();
          return followupDate === today;
     }).length;

     return (
          <>
               <div className="px-4 py-3">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid #dee2e6' }}>
                         <div>
                              <h4 className="mb-1 fw-semibold">Leads Follow-up</h4>
                              <p className="text-muted mb-0 small">
                                   {overdueCount > 0 && (
                                        <span className="text-danger me-3">
                                             <RiTimeLine size={14} className="me-1" />
                                             {overdueCount} overdue
                                        </span>
                                   )}
                                   {todayCount > 0 && (
                                        <span className="text-warning me-3">
                                             <RiCalendarLine size={14} className="me-1" />
                                             {todayCount} due today
                                        </span>
                                   )}
                                   Manage all follow-up activities
                              </p>
                         </div>
                         <div className="d-flex gap-2 align-items-center">
                              <div className="d-flex align-items-center gap-1">
                                   <label className="form-label mb-0 small text-muted">Show:</label>
                                   <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        style={{ width: '60px' }}
                                        value={itemsPerPage}
                                        onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value) || 10)}
                                        min="1"
                                        max="100"
                                        title="Items per page"
                                   />
                              </div>
                              <button
                                   className="btn btn-sm btn-outline-secondary"
                                   onClick={() => handlePageChange(currentPage - 1)}
                                   title="Previous Page"
                              >
                                   Previous
                              </button>
                              <button
                                   className="btn btn-sm btn-outline-primary"
                                   onClick={() => handlePageChange(currentPage + 1)}
                                   title="Next Page"
                              >
                                   Next
                              </button>
                         </div>
                    </div>

                    {/* Follow-ups Table */}
                    <div className="border rounded">
                         <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                              <div className="d-flex align-items-center">
                                   <RiCalendarLine size={18} className="me-2 text-secondary" />
                                   <h6 className="mb-0 fw-semibold">Follow-up History</h6>
                                   <span className="text-secondary ms-2 small">({followUps.length})</span>
                              </div>
                         </div>
                         {followUps.length === 0 ? (
                              <div className="text-center py-5">
                                   <RiCalendarLine size={40} className="text-muted mb-2" />
                                   <p className="text-muted small mb-3">No follow-ups recorded</p>
                              </div>
                         ) : (
                              <div className="table-responsive">
                                   <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                                        <thead style={{ backgroundColor: '#fafafa' }}>
                                             <tr>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Type</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Lead Info</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Date</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Next Follow-up</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Priority</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Status</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Notes</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Created By</th>
                                                  <th className="border-0 py-2 px-3" style={{ fontWeight: '600' }}>Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {paginatedLeads.map((followup) => (
                                                  <tr key={followup.id} className={getRowClass(followup.status, followup.priority)}>
                                                       <td className="border-0 py-2 px-3">
                                                            <div className="d-flex align-items-center">
                                                                 {getFollowUpTypeIcon(followup.followup_type)}
                                                                 <span className="ms-2 text-capitalize">{followup.followup_type}</span>
                                                            </div>
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            <div>
                                                                 <div className="fw-semibold text-dark">{followup.company_name || 'N/A'}</div>
                                                                 <div className="text-muted small">{followup.contact_person || followup.firstname} {followup.lastname}</div>
                                                                 {followup.contact_email && (
                                                                      <div className="text-muted small">{followup.contact_email}</div>
                                                                 )}
                                                            </div>
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            <RiTimeLine size={14} className="me-1 text-secondary" />
                                                            {new Date(followup.followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            {followup.next_followup_date ? (
                                                                 <span className={isOverdue(followup.next_followup_date) ? 'text-danger' : ''}>
                                                                      {new Date(followup.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                 </span>
                                                            ) : (
                                                                 <span className="text-muted">—</span>
                                                            )}
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            <span className="fw-semibold">
                                                                 {followup.priority}
                                                            </span>
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            <span className="fw-semibold">
                                                                 {followup.status}
                                                            </span>
                                                       </td>
                                                       <td className="border-0 py-2 px-3" style={{ maxWidth: '300px', cursor: 'pointer' }}>
                                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={followup.notes}>
                                                                 {followup.notes}
                                                            </div>
                                                       </td>
                                                       <td className="border-0 py-2 px-3 text-muted small">
                                                            {followup.created_by_username || `User #${followup.created_by}`}
                                                       </td>
                                                       <td className="border-0 py-2 px-3">
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 title="Schedule Follow-up"
                                                                 onClick={() => handleScheduleFollowUp(followup)}
                                                            >
                                                                 <RiCalendarLine size={14} />
                                                            </button>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
               </div>

               {/* Schedule Follow-up Modal */}
               {showScheduleModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Schedule Follow-up
                                             {currentLead && (
                                                  <small className="text-muted ms-2">for Follow-up #{currentLead.id}</small>
                                             )}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowScheduleModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row g-3">
                                             <div className="col-12">
                                                  <label className="form-label">Follow-up Date *</label>
                                                  <input
                                                       type="date"
                                                       className="form-control"
                                                       value={scheduleForm.followup_date}
                                                       onChange={(e) => setScheduleForm(prev => ({
                                                            ...prev,
                                                            followup_date: e.target.value
                                                       }))}
                                                       min={new Date().toISOString().split('T')[0]}
                                                  />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label">Follow-up Type</label>
                                                  <select
                                                       className="form-select"
                                                       value={scheduleForm.followup_type}
                                                       onChange={(e) => setScheduleForm(prev => ({
                                                            ...prev,
                                                            followup_type: e.target.value
                                                       }))}
                                                  >
                                                       <option value="call">Call</option>
                                                       <option value="email">Email</option>
                                                       <option value="meeting">Meeting</option>
                                                  </select>
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label">Priority</label>
                                                  <select
                                                       className="form-select"
                                                       value={scheduleForm.priority}
                                                       onChange={(e) => setScheduleForm(prev => ({
                                                            ...prev,
                                                            priority: e.target.value
                                                       }))}
                                                  >
                                                       <option value="low">Low</option>
                                                       <option value="medium">Medium</option>
                                                       <option value="high">High</option>
                                                       <option value="urgent">Urgent</option>
                                                  </select>
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label">Status</label>
                                                  <select
                                                       className="form-select"
                                                       value={scheduleForm.status}
                                                       onChange={(e) => setScheduleForm(prev => ({
                                                            ...prev,
                                                            status: e.target.value
                                                       }))}
                                                  >
                                                       <option value="pending">Pending</option>
                                                       <option value="completed">Completed</option>
                                                       <option value="cancelled">Cancelled</option>

                                                  </select>
                                             </div>
                                             <div className="col-12">
                                                  <label className="form-label">Notes</label>
                                                  <textarea
                                                       className="form-control"
                                                       rows={3}
                                                       value={scheduleForm.notes}
                                                       onChange={(e) => setScheduleForm(prev => ({
                                                            ...prev,
                                                            notes: e.target.value
                                                       }))}
                                                       placeholder="Add any notes about this follow-up..."
                                                  />
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn  btn-outline-danger btn-sm"
                                             onClick={() => setShowScheduleModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn  btn-outline-primary btn-sm"
                                             onClick={handleScheduleSubmit}
                                        >
                                             Schedule Follow-up
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
}