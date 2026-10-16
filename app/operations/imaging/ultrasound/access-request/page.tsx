"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { customPost } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { useSearchParams } from 'next/navigation';
import AccessHistoryTable from '../../../../../components/operations/Ultrasound/AccessHistoryTable';

export default function AccessRequestForm() {
     const patientid = useSearchParams()?.get('patientid') ?? null;
     const ascensionid = useSearchParams()?.get('ascensionid') ?? null;
     const employeeid = useApplication()?.user?.employeeid;
     let ptid = typeof patientid === 'string' && patientid.length > 10 ? parseInt(patientid.slice(50)) : patientid;

     const [activeTab, setActiveTab] = useState('request');
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleAccessRequest = async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const requestType = String(formData.get('requestType') || '');
          const requestReason = String(formData.get('requestReason') || '');
          const urgencyLevel = String(formData.get('urgencyLevel') || '');

          if (!requestType || !requestReason.trim() || requestReason.trim().length < 5) {
               toast.error('Please fill in all required fields and ensure the reason is at least 5 characters long');
               return;
          }

          if (!ascensionid || !patientid || !employeeid) {
               toast.error('Missing required parameters');
               return;
          }

          setIsSubmitting(true);
          try {
               const payload = {
                    patientid: ptid,
                    staffid: parseInt(employeeid),
                    requestType,
                    ascensionid: parseInt(ascensionid),
                    reason: requestReason,
                    urgency: urgencyLevel,
               };

               const response = await customPost('security-features/request-access?tenantId=1', 'POST', payload);

               if (response.status === true) {
                    toast.success(response.message || 'Access request submitted successfully');
                    form.reset();
               } else {
                    toast.error(response.message || 'Failed to submit request');
               }
          } catch (error) {
               console.error('Access request failed:', error);
               toast.error('Failed to submit access request');
          } finally {
               setIsSubmitting(false);
          }
     };

     return (
          <main className="container-fluid px-3 py-3">
               <header className="border-bottom pb-3 mb-3">
                    <h1 className="h4 fw-semibold mb-1">Imaging access requests</h1>
                    <p className="text-muted mb-0">Request access to an imaging report or review previous requests.</p>
               </header>

               <section aria-label="Imaging access request management">
                    <ul className="nav nav-tabs" role="tablist" aria-label="Access request sections">
                         <li className="nav-item" role="presentation">
                              <button
                                   className={`nav-link ${activeTab === 'request' ? 'active' : ''}`}
                                   id="request-tab"
                                   type="button"
                                   role="tab"
                                   aria-selected={activeTab === 'request'}
                                   aria-controls="request-panel"
                                   tabIndex={activeTab === 'request' ? 0 : -1}
                                   onClick={() => setActiveTab('request')}
                              >
                                   Request Access
                              </button>
                         </li>
                         <li className="nav-item" role="presentation">
                              <button
                                   className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                                   id="view-tab"
                                   type="button"
                                   role="tab"
                                   aria-selected={activeTab === 'view'}
                                   aria-controls="view-panel"
                                   tabIndex={activeTab === 'view' ? 0 : -1}
                                   onClick={() => setActiveTab('view')}
                              >
                                   Requested Access
                              </button>
                         </li>
                    </ul>

                    <div className="mt-3">
                         {activeTab === 'request' && (
                              <section className="tab-pane active" id="request-panel" role="tabpanel" aria-labelledby="request-tab" tabIndex={0}>
                                   <form onSubmit={handleAccessRequest} aria-busy={isSubmitting}>
                                        <div className="row g-3">
                                             <div className="col-12 col-md-3">
                                                  <label className="form-label fw-semibold" htmlFor="requestType">Request type</label>
                                             </div>
                                             <div className="col-12 col-md-9">
                                                  <select className="form-select" id="requestType" name="requestType" required>
                                                       <option value="">Select request type</option>
                                                       <option value="access">Request access</option>
                                                       <option value="edit">Request edit access</option>
                                                  </select>
                                             </div>

                                             <div className="col-12 col-md-3">
                                                  <label className="form-label fw-semibold" htmlFor="requestReason">Reason for request</label>
                                             </div>
                                             <div className="col-12 col-md-9">
                                                  <textarea
                                                       className="form-control"
                                                       rows={4}
                                                       placeholder="Explain why you need this access or permission."
                                                       id="requestReason"
                                                       name="requestReason"
                                                       minLength={5}
                                                       required
                                                  />
                                             </div>

                                             <div className="col-12 col-md-3">
                                                  <label className="form-label fw-semibold" htmlFor="urgencyLevel">Urgency level</label>
                                             </div>
                                             <div className="col-12 col-md-9">
                                                  <select className="form-select" id="urgencyLevel" name="urgencyLevel">
                                                       <option value="low">Low - Can wait</option>
                                                       <option value="medium">Medium - Within a few days</option>
                                                       <option value="high">High - Urgent (within 24 hours)</option>
                                                       <option value="critical">Critical - Emergency</option>
                                                  </select>
                                             </div>

                                             <div className="col-12 col-md-3">
                                                  <label className="form-label fw-semibold" htmlFor="additionalNotes">Additional notes</label>
                                             </div>
                                             <div className="col-12 col-md-9">
                                                  <textarea className="form-control" rows={3} placeholder="Any additional context." id="additionalNotes" name="additionalNotes" />
                                             </div>

                                             <div className="col-12 col-md-9 offset-md-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                                                  <small className="text-muted">
                                                       Requests are reviewed by administrators. You will be notified of the decision.
                                                  </small>
                                                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                                       {isSubmitting ? 'Submitting request...' : 'Submit request'}
                                                  </button>
                                             </div>
                                        </div>
                                   </form>
                              </section>
                         )}

                         {activeTab === 'view' && (
                              <section className="tab-pane active" id="view-panel" role="tabpanel" aria-labelledby="view-tab" tabIndex={0}>
                                   <AccessHistoryTable
                                        employeeid={employeeid || ''}
                                        ascensionid={ascensionid}
                                        shouldLoad={activeTab === 'view'}
                                   />
                              </section>
                         )}
                    </div>
               </section>
          </main>
     );
}