"use client";
import { useState, useEffect } from 'react';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { RiFileTextLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch } from '../../Auth/customFetch';
interface AccessRequest {
     id: number;
     patientid: number;
     staffid: number;
     requestType: string;
     requestedAt: string;
     status: string;
     ascensionid: number;
     grantedAt: string | null;
     revokedAt: string | null;
     expiredAt: string | null;
     accessedAt: string | null;
     reason: string;
     urgency: string;
     username: string;
     email: string;
     employee_role: string;
     fullpatientid: string;
}

interface AccessHistoryTableProps {
     employeeid: string;
     ascensionid?: string | null;
     shouldLoad: boolean;
}

export default function AccessHistoryTable({ employeeid, ascensionid, shouldLoad }: AccessHistoryTableProps) {
     const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const fetchAccessRequests = async (params = {}) => {
          if (!ascensionid) {
               setAccessRequests([]);
               setError(null);
               return { result: [] };
          }
          try {
               setIsLoading(true);
               setError(null);
               const queryParams = new URLSearchParams({
                    ...params
               });

               const response = await customFetch(`security-features/history/${ascensionid}/${employeeid}?${queryParams}`);
               if (response && response.status === true && Array.isArray(response.data)) {
                    setAccessRequests(response.data);
                    return { result: response.data };
               } else {
                    const message = response?.message || 'Unable to load access request history.';
                    setError(message);
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Failed to fetch access requests:', error);
               const message = 'Failed to load access requests.';
               setError(message);
               toast.error(message);
               return { result: [], error: true };
          } finally {
               setIsLoading(false);
          }
     };

     useEffect(() => {
          if (shouldLoad) {
               fetchAccessRequests();
          }
     }, [employeeid, ascensionid, shouldLoad]);

     const handleServerSideProcessing = async (params: { page: number, count: number, sortby?: "ASC" | "DESC" }) => {
          const processedParams = { ...params, sortby: params.sortby || "ASC" };
          return await fetchAccessRequests(processedParams);
     };

     const columns = [
          {
               Header: 'Patient ID',
               accessor: 'fullpatientid',
          },
          {
               Header: "Requested By",
               accessor: "username",
          },
          {
               Header: "Role",
               accessor: "employee_role",
          },
          {
               Header: 'Request Type',
               accessor: 'requestType',
               Cell: ({ value }) => value === 'edit' ? 'Edit Result' : 'Access Result'
          },
          {
               Header: 'Urgency',
               accessor: 'urgency',
               Cell: ({ value }) => value
          },
          {
               Header: 'Requested At',
               accessor: 'requestedAt',
               Cell: ({ value }) => <small>{new Date(value).toLocaleString()}</small>
          },
          {
               Header: 'Granted At',
               accessor: 'grantedAt',
               Cell: ({ value }) => value ? <small>{new Date(value).toLocaleString()}</small> : '-'
          },
          {
               Header: 'Revoked At',
               accessor: 'revokedAt',
               Cell: ({ value }) => value ? <small>{new Date(value).toLocaleString()}</small> : '-'
          },
          {
               Header: 'Expired At',
               accessor: 'expiredAt',
               Cell: ({ value }) => value ? <small>{new Date(value).toLocaleString()}</small> : '-'
          },
          {
               Header: 'Accessed At',
               accessor: 'accessedAt',
               Cell: ({ value }) => value ? <small>{new Date(value).toLocaleString()}</small> : '-'
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => {
                    switch (value) {
                         case 'pending':
                              return <span className="fw-semibold">Pending</span>;
                         case 'approved':
                         case 'granted':
                              return <span className="fw-semibold text-success">Approved</span>;
                         case 'rejected':
                              return <span className="fw-semibold text-danger">Rejected</span>;
                         case 'revoked':
                              return <span className="fw-semibold text-secondary">Revoked</span>;
                         case 'expired':
                              return <span className="fw-semibold text-secondary">Expired</span>;
                         default:
                              return <span className="fw-semibold">{value}</span>;
                    }
               }
          }
     ];

     return (
          <section aria-labelledby="recent-access-requests-heading" aria-busy={isLoading}>
               <h3 id="recent-access-requests-heading" className="h6 fw-semibold mb-3">
                    <RiFileTextLine className="me-2" aria-hidden="true" />Recent access requests
               </h3>
               {!ascensionid ? (
                    <p className="text-muted mb-0">An imaging case is required to view access requests.</p>
               ) : error ? (
                    <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2" role="alert">
                         <span>{error}</span>
                         <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => fetchAccessRequests()} disabled={isLoading}>Retry</button>
                    </div>
               ) : (
                    <div className="w-100">
               {isLoading ? (
                    <div className="text-center py-4" role="status">
                         <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <p className="text-muted mt-2 mb-0">Loading access requests...</p>
                    </div>
               ) : (
                    <div style={{ fontSize: '0.85rem' }}>
                         <PrimeTable
                              column={columns}
                              data={accessRequests}
                              filtering={true}
                              serverSideFiltering={true}
                              handleSeverSideProcessing={handleServerSideProcessing}
                         />
                    </div>
               )}
                    </div>
               )}
          </section>
     );
}