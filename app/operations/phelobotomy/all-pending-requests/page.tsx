'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Spinner, Badge } from 'react-bootstrap';
import { RiInboxLine, RiTestTubeLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from '@remixicon/react';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../components/Auth/customFetch';

interface PendingRequest {
     fullname: string;
     patientid: number;
     age: string;
     gender: string;
     mobilenumber: string;
     billingid: number;
     date: string;
     clientstatus: string;
     collectionStartDate: string | null;
     collectionEndDate: string | null;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

export default function AllPendingRequestsPage() {
     const [data, setData] = useState<PendingRequest[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const { user } = useApplication();

     useEffect(() => {
          const fetchData = async () => {
               setLoading(true);
               setError(null);
               try {
                    const response = await customFetch('test/ascension/all/pending');
                    if (response?.status === 'success' && Array.isArray(response.result)) {
                         setData(response.result);
                    } else {
                         setError('Failed to fetch pending requests');
                    }
               } catch (err: any) {
                    setError(err.message || 'An error occurred while fetching data');
               } finally {
                    setLoading(false);
               }
          };
          fetchData();
     }, []);


     const handleCollectSample = (billingid: string|number) => {
          window.open(
               `/operations/phelobotomy/pending-samples-collection?billingid=${billingid}`,
               '_blank'
          );
     };

     if (loading) {
          return (
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading pending requests...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted">{error}</p>
                    </div>
               </div>
          );
     }

     if (data.length === 0) {
          return (
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                         <h5 className="fw-medium mb-1">No Pending Requests</h5>
                         <p className="text-muted">There are currently no pending requests.</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                         <RiInboxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                         All Pending Requests ({data.length})
                    </h2>
               </div>
               <div className="card-body p-3 p-md-4">
                    <div className="table-responsive">
                         <table className="table table-sm table-hover table-striped mb-0">
                              <thead className="table-light sticky-top">
                                   <tr>
                                        <th className="fw-semibold text-start py-3">Request Date</th>
                                        <th className="fw-semibold text-start py-3">Patient Name</th>
                                        <th className="fw-semibold text-start py-3">Patient ID</th>
                                        <th className="fw-semibold text-start py-3">Age</th>
                                        <th className="fw-semibold text-start py-3">Gender</th>
                                        <th className="fw-semibold text-start py-3">Mobile Number</th>
                                        <th className="fw-semibold text-start py-3">Billing ID</th>
                                        <th className="fw-semibold text-start py-3">Status</th>
                                        <th className="fw-semibold text-start py-3">Action</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {data.map((request, idx) => (
                                        <tr key={idx}>
                                             <td className="py-3 text-start">{dayjs(request.date).format('DD-MM-YYYY HH:mm:ss')}</td>
                                             <td className="py-3 text-start fw-medium">{request.fullname}</td>
                                             <td className="py-3 text-start">{request.patientid}</td>
                                             <td className="py-3 text-start">{request.age}</td>
                                             <td className="py-3 text-start text-capitalize">{request.gender}</td>
                                             <td className="py-3 text-start">{request.mobilenumber}</td>
                                             <td className="py-3 text-start">{request.billingid}</td>
                                             <td className="py-3 text-start">
                                                 {request.clientstatus}
                                             </td>
                                             <td className="py-3 text-start">
                                                  <button
                                                       className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                                       onClick={() => handleCollectSample(request.billingid)}
                                                  >
                                                       <RiTestTubeLine size={16} />
                                                       <span>Collect Sample</span>
                                                  </button>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               </div>
               <style jsx global>{`
				.animate-spin {
					animation: spin 1s linear infinite;
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
          </div>
     );
}
