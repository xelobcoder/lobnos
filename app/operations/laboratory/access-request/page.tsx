"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { customPost } from '../../../../components/Auth/customFetch';
import AccessHistoryTable from '../../../../components/operations/Ultrasound/AccessHistoryTable';

export default function AccessRequestForm() {
     const ascensionid = useSearchParams().get('ascensionid');
     const patientid = useSearchParams().get('patientid');
     const employeeid = useApplication()?.user?.employeeid;

     const ptid = typeof patientid === 'string' && patientid.length > 50 ? parseInt(patientid.slice(50)) : patientid;

     const [activeTab, setActiveTab] = useState('request');

     const handleAccessRequest = async () => {

          const requestType = (document.getElementById('requestType') as HTMLSelectElement)?.value;
          const requestReason = (document.getElementById('requestReason') as HTMLTextAreaElement)?.value;
          const urgencyLevel = (document.getElementById('urgencyLevel') as HTMLSelectElement)?.value;
          const additionalNotes = (document.getElementById('additionalNotes') as HTMLTextAreaElement)?.value;

          if (!requestType || !requestReason.trim() || requestReason.trim().length < 5) {
               toast.error('Please fill in all required fields and ensure the reason is at least 5 characters long');
               return;
          }

          if (!ascensionid || !ptid || !employeeid) {
               toast.error('Missing required parameters');
               return;
          }

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
                    // Clear form
                    (document.getElementById('requestType') as HTMLSelectElement).value = '';
                    (document.getElementById('requestReason') as HTMLTextAreaElement).value = '';
                    (document.getElementById('urgencyLevel') as HTMLSelectElement).value = 'low';
                    (document.getElementById('additionalNotes') as HTMLTextAreaElement).value = '';
               } else {
                    toast.error(response.message || 'Failed to submit request');
               }
          } catch (error) {
               console.error('Access request failed:', error);
               toast.error('Failed to submit access request');
          }
     };

     return (
          <div>
               <div className="d-flex justify-content-between bg-secondary-subtle br-5 my-2 p-2">
                    <div>
                         <h5 className="d-flex my-2 mx-4 text-uppercase">Access Request Management</h5>
                    </div>
               </div>

               <div className="border br-5 p-3 mb-3" style={{ border: '1px solid #dee2e6' }}>
                    <ul className="nav nav-tabs" id="accessRequestTabs" role="tablist">
                         <li className="nav-item" role="presentation">
                              <button
                                   className={`nav-link ${activeTab === 'request' ? 'active' : ''}`}
                                   id="request-tab"
                                   type="button"
                                   role="tab"
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
                                   onClick={() => setActiveTab('view')}
                              >
                                   Requested Access
                              </button>
                         </li>
                    </ul>

                    <div className="tab-content mt-3" id="accessRequestTabContent">
                         {activeTab === 'request' && (
                              <div className="tab-pane fade show active" id="request" role="tabpanel">
                                   <div className="row mb-3">
                                        <div className="col-md-3">
                                             <label className="form-label fw-bold">Request Type</label>
                                        </div>
                                        <div className="col-md-9">
                                             <select className="form-select" id="requestType">
                                                  <option value="">Select Request Type</option>
                                                  <option value="access">Request Access</option>
                                                  <option value="edit">Request Edit Access</option>
                                             </select>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-3">
                                             <label className="form-label fw-bold">Reason for Request</label>
                                        </div>
                                        <div className="col-md-9">
                                             <textarea
                                                  className="form-control"
                                                  rows={4}
                                                  placeholder="Please explain why you need this access or permission..."
                                                  id="requestReason"
                                             ></textarea>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-3">
                                             <label className="form-label fw-bold">Urgency Level</label>
                                        </div>
                                        <div className="col-md-9">
                                             <select className="form-select" id="urgencyLevel">
                                                  <option value="low">Low - Can wait</option>
                                                  <option value="medium">Medium - Within a few days</option>
                                                  <option value="high">High - Urgent (within 24 hours)</option>
                                                  <option value="critical">Critical - Emergency</option>
                                             </select>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-3">
                                             <label className="form-label fw-bold">Additional Notes</label>
                                        </div>
                                        <div className="col-md-9">
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  placeholder="Any additional information or context..."
                                                  id="additionalNotes"
                                             ></textarea>
                                        </div>
                                   </div>

                                   <div className="row">
                                        <div className="col-md-9 offset-md-3">
                                             <div className="d-flex justify-content-between align-items-center">
                                                  <small className="text-muted">
                                                       Requests will be reviewed by administrators and you will be notified of the decision.
                                                  </small>
                                                  <button className="btn btn-primary" onClick={handleAccessRequest}>
                                                       Submit Request
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {activeTab === 'view' && (
                              <div className="tab-pane fade show active" id="view" role="tabpanel">
                                   <AccessHistoryTable
                                        employeeid={employeeid || ''}
                                        ascensionid={ascensionid}
                                        shouldLoad={activeTab === 'view'}
                                   />
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}