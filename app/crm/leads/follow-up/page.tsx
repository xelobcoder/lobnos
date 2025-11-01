"use client"
import React, { useState, useEffect } from 'react';
import {
     RiAddLine,
     RiEyeLine,
     RiEditLine,
     RiPhoneLine,
     RiMailLine,
     RiCalendarLine,
     RiCheckLine,
     RiTimeLine,
     RiUserLine,
     RiMapPinLine,
     RiCloseLine
} from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface FollowUpLead {
     id: string;
     name: string;
     contact_person: string;
     contact_email: string;
     contact_phone: string;
     company_name: string;
     location: string;
     last_contact_date: string;
     next_followup_date: string;
     followup_type: string;
     status: string;
     priority: string;
     notes: string;
}

interface ScheduleFormData {
     followup_date: string;
     followup_type: string;
     priority: string;
     notes: string;
}

export default function LeadsFollowUp() {
     const [followUpLeads, setFollowUpLeads] = useState<FollowUpLead[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
     const [showScheduleModal, setShowScheduleModal] = useState(false);
     const [isBulkSchedule, setIsBulkSchedule] = useState(false);
     const [currentLead, setCurrentLead] = useState<FollowUpLead | null>(null);
     const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
          followup_date: '',
          followup_type: 'call',
          priority: 'medium',
          notes: ''
     });

     // Sample data - in real app this would come from API
     useEffect(() => {
          const sampleFollowUpLeads: FollowUpLead[] = [
               {
                    id: '1',
                    name: 'John Smith',
                    contact_person: 'John Smith',
                    contact_email: 'john.smith@company.com',
                    contact_phone: '+1-555-0123',
                    company_name: 'Tech Solutions Inc',
                    location: 'New York, NY',
                    last_contact_date: '2025-10-15',
                    next_followup_date: '2025-11-05',
                    followup_type: 'call',
                    status: 'pending',
                    priority: 'high',
                    notes: 'Interested in premium package, needs quote'
               },
               {
                    id: '2',
                    name: 'Sarah Johnson',
                    contact_person: 'Sarah Johnson',
                    contact_email: 'sarah.j@biotech.com',
                    contact_phone: '+1-555-0456',
                    company_name: 'BioTech Research',
                    location: 'Boston, MA',
                    last_contact_date: '2025-10-20',
                    next_followup_date: '2025-11-03',
                    followup_type: 'email',
                    status: 'overdue',
                    priority: 'medium',
                    notes: 'Follow up on research collaboration proposal'
               },
               {
                    id: '3',
                    name: 'Mike Davis',
                    contact_person: 'Mike Davis',
                    contact_email: 'mike.davis@pharma.com',
                    contact_phone: '+1-555-0789',
                    company_name: 'Pharma Corp',
                    location: 'San Francisco, CA',
                    last_contact_date: '2025-10-25',
                    next_followup_date: '2025-11-10',
                    followup_type: 'meeting',
                    status: 'scheduled',
                    priority: 'high',
                    notes: 'Demo scheduled for next week'
               },
               {
                    id: '4',
                    name: 'Lisa Chen',
                    contact_person: 'Lisa Chen',
                    contact_email: 'lisa.chen@medtech.com',
                    contact_phone: '+1-555-0321',
                    company_name: 'MedTech Solutions',
                    location: 'Austin, TX',
                    last_contact_date: '2025-10-18',
                    next_followup_date: '2025-11-01',
                    followup_type: 'call',
                    status: 'pending',
                    priority: 'medium',
                    notes: 'Check on contract status'
               }
          ];

          setTimeout(() => {
               setFollowUpLeads(sampleFollowUpLeads);
               setLoading(false);
          }, 1000);
     }, []);

     const filteredLeads = followUpLeads.filter(lead =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
     );

     const getStatusBadge = (status: string) => {
          const statusClasses = {
               pending: 'badge bg-warning',
               scheduled: 'badge bg-info',
               completed: 'badge bg-success',
               overdue: 'badge bg-danger',
               cancelled: 'badge bg-secondary'
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

     const handleScheduleFollowUp = (lead: FollowUpLead) => {
          setCurrentLead(lead);
          setIsBulkSchedule(false);
          setScheduleForm({
               followup_date: '',
               followup_type: 'call',
               priority: lead.priority,
               notes: lead.notes || ''
          });
          setShowScheduleModal(true);
     };

     const handleBulkSchedule = () => {
          if (selectedLeads.length === 0) {
               alert('Please select leads to schedule follow-ups for.');
               return;
          }
          setCurrentLead(null);
          setIsBulkSchedule(true);
          setScheduleForm({
               followup_date: '',
               followup_type: 'call',
               priority: 'medium',
               notes: ''
          });
          setShowScheduleModal(true);
     };

     const handleScheduleSubmit = () => {
          if (!scheduleForm.followup_date) {
               alert('Please select a follow-up date.');
               return;
          }

          const today = new Date().toISOString().split('T')[0];
          const updatedLeads = followUpLeads.map(lead => {
               if (isBulkSchedule) {
                    // Bulk schedule - update selected leads
                    if (selectedLeads.includes(lead.id)) {
                         return {
                              ...lead,
                              next_followup_date: scheduleForm.followup_date,
                              followup_type: scheduleForm.followup_type,
                              priority: scheduleForm.priority,
                              status: 'scheduled',
                              notes: scheduleForm.notes || lead.notes,
                              last_contact_date: today
                         };
                    }
               } else {
                    // Single lead schedule
                    if (lead.id === currentLead?.id) {
                         return {
                              ...lead,
                              next_followup_date: scheduleForm.followup_date,
                              followup_type: scheduleForm.followup_type,
                              priority: scheduleForm.priority,
                              status: 'scheduled',
                              notes: scheduleForm.notes || lead.notes,
                              last_contact_date: today
                         };
                    }
               }
               return lead;
          });

          setFollowUpLeads(updatedLeads);
          setShowScheduleModal(false);
          setSelectedLeads([]);
          setCurrentLead(null);
          alert(isBulkSchedule ? 'Follow-ups scheduled successfully!' : 'Follow-up scheduled successfully!');
     };

     const handleMarkCompleted = () => {
          if (selectedLeads.length === 0) {
               alert('Please select leads to mark as completed.');
               return;
          }

          const today = new Date().toISOString().split('T')[0];
          const updatedLeads = followUpLeads.map(lead => {
               if (selectedLeads.includes(lead.id)) {
                    return {
                         ...lead,
                         status: 'completed',
                         last_contact_date: today
                    };
               }
               return lead;
          });

          setFollowUpLeads(updatedLeads);
          setSelectedLeads([]);
          alert('Selected follow-ups marked as completed!');
     };

     const handleLeadSelection = (leadId: string, checked: boolean) => {
          if (checked) {
               setSelectedLeads(prev => [...prev, leadId]);
          } else {
               setSelectedLeads(prev => prev.filter(id => id !== leadId));
          }
     };

     const columns = [
          {
               Header: 'Select',
               accessor: 'select',
               Cell: ({ row }: any) => (
                    <input
                         type="checkbox"
                         className="form-check-input"
                         checked={selectedLeads.includes(row.original.id)}
                         onChange={(e) => handleLeadSelection(row.original.id, e.target.checked)}
                    />
               ),
               disableSortBy: true,
               width: 50
          },
          {
               Header: 'Lead Info',
               accessor: 'lead_info',
               Cell: ({ row }: any) => (
                    <div className="d-flex flex-column">
                         <strong className="text-dark">{row.original.name}</strong>
                         <small className="text-muted d-flex align-items-center">
                              <RiMailLine size={12} className="me-1" />
                              {row.original.contact_email}
                         </small>
                         <small className="text-muted d-flex align-items-center">
                              <RiPhoneLine size={12} className="me-1" />
                              {row.original.contact_phone}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Company',
               accessor: 'company',
               Cell: ({ row }: any) => (
                    <div className="d-flex flex-column">
                         <strong>{row.original.company_name}</strong>
                         <small className="text-muted d-flex align-items-center">
                              <RiMapPinLine size={12} className="me-1" />
                              {row.original.location}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Last Contact',
               accessor: 'last_contact_date',
               Cell: ({ value }: any) => (
                    <small className="text-muted">
                         {new Date(value).toLocaleDateString()}
                    </small>
               )
          },
          {
               Header: 'Next Follow-up',
               accessor: 'next_followup_date',
               Cell: ({ value, row }: any) => {
                    const overdue = isOverdue(value);
                    return (
                         <div className="d-flex flex-column">
                              <span className={overdue ? 'text-danger fw-medium' : ''}>
                                   {new Date(value).toLocaleDateString()}
                              </span>
                              {overdue && (
                                   <small className="text-danger">Overdue</small>
                              )}
                         </div>
                    );
               }
          },
          {
               Header: 'Type',
               accessor: 'followup_type',
               Cell: ({ value }: any) => (
                    <div className="d-flex align-items-center">
                         {getFollowUpTypeIcon(value)}
                         <span className="ms-1 text-capitalize">{value}</span>
                    </div>
               )
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: any) => (
                    <span className={`badge ${getStatusBadge(value)}`}>
                         {value}
                    </span>
               )
          },
          {
               Header: 'Priority',
               accessor: 'priority',
               Cell: ({ value }: any) => (
                    <span className={`badge ${getPriorityBadge(value)}`}>
                         {value}
                    </span>
               )
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: any) => (
                    <div className="btn-group btn-group-sm">
                         <button
                              className="btn btn-outline-success btn-sm"
                              title="Mark Complete"
                              onClick={() => {
                                   const today = new Date().toISOString().split('T')[0];
                                   const updatedLeads = followUpLeads.map(lead =>
                                        lead.id === row.original.id
                                             ? { ...lead, status: 'completed', last_contact_date: today }
                                             : lead
                                   );
                                   setFollowUpLeads(updatedLeads);
                              }}
                         >
                              <RiCheckLine size={14} />
                         </button>
                         <button
                              className="btn btn-outline-primary btn-sm"
                              title="Schedule Follow-up"
                              onClick={() => handleScheduleFollowUp(row.original)}
                         >
                              <RiCalendarLine size={14} />
                         </button>
                         <button className="btn btn-outline-secondary btn-sm" title="View Details">
                              <RiEyeLine size={14} />
                         </button>
                         <button className="btn btn-outline-info btn-sm" title="Contact">
                              <RiPhoneLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

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

     const overdueCount = followUpLeads.filter(lead => isOverdue(lead.next_followup_date)).length;
     const todayCount = followUpLeads.filter(lead => {
          const today = new Date().toDateString();
          const followupDate = new Date(lead.next_followup_date).toDateString();
          return followupDate === today;
     }).length;

     return (
          <>
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <div>
                              <h3 className="text-dark fw-medium mb-0">Leads Follow-up</h3>
                              <small className="text-muted">
                                   {overdueCount > 0 && (
                                        <span className="text-danger me-3">
                                             <RiTimeLine size={14} className="me-1" />
                                             {overdueCount} overdue
                                        </span>
                                   )}
                                   {todayCount > 0 && (
                                        <span className="text-warning">
                                             <RiCalendarLine size={14} className="me-1" />
                                             {todayCount} due today
                                        </span>
                                   )}
                              </small>
                         </div>
                         <a href="/crm/leads/create-customers-lead" className="btn btn-primary btn-sm">
                              <RiAddLine size={16} className="me-1" />
                              New Lead
                         </a>
                    </div>

                    <div className="card border-0 shadow-sm">
                         <div className="card-body p-0">
                              <div className="p-3 border-bottom">
                                   <div className="row align-items-center">
                                        <div className="col-md-6">
                                             <h6 className="mb-0">Follow-up Required ({followUpLeads.length})</h6>
                                             {selectedLeads.length > 0 && (
                                                  <small className="text-muted ms-2">
                                                       {selectedLeads.length} selected
                                                  </small>
                                             )}
                                        </div>
                                        <div className="col-md-6">
                                             <div className="d-flex gap-2 justify-content-end">
                                                  <button
                                                       className="btn btn-outline-primary btn-sm"
                                                       onClick={handleBulkSchedule}
                                                       disabled={selectedLeads.length === 0}
                                                  >
                                                       <RiCalendarLine size={14} className="me-1" />
                                                       Schedule Follow-ups
                                                  </button>
                                                  <button
                                                       className="btn btn-outline-success btn-sm"
                                                       onClick={handleMarkCompleted}
                                                       disabled={selectedLeads.length === 0}
                                                  >
                                                       <RiCheckLine size={14} className="me-1" />
                                                       Mark Completed
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              <PrimeTable
                                   column={columns}
                                   data={filteredLeads}
                                   filtering={true}
                                   handleSeverSideProcessing={() => { }}
                              />
                         </div>
                    </div>
               </div>

               {/* Schedule Follow-up Modal */}
               {showScheduleModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {isBulkSchedule ? 'Schedule Follow-ups' : 'Schedule Follow-up'}
                                             {currentLead && (
                                                  <small className="text-muted ms-2">for {currentLead.name}</small>
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
                                             <div className="col-md-6">
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
                                             className="btn btn-secondary"
                                             onClick={() => setShowScheduleModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={handleScheduleSubmit}
                                        >
                                             Schedule {isBulkSchedule ? 'Follow-ups' : 'Follow-up'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
}