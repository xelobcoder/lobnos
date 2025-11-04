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

     const fetchAccessRequests = async (params = {}) => {
          if (!ascensionid) {
               setAccessRequests([]);
               return { result: [] };
          }
          try {
               setIsLoading(true);
               const queryParams = new URLSearchParams({
                    ...params
               });

               const response = await customFetch(`security-features/history/${ascensionid}/${employeeid}?${queryParams}`);
               if (response && response.status === true && Array.isArray(response.data)) {
                    setAccessRequests(response.data);
                    return { result: response.data };
               } else {
                    return { result: [] };
               }
          } catch (error) {
               console.error('Failed to fetch access requests:', error);
               toast.error('Failed to load access requests');
               return { error: 'Failed to load access requests' };
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
               Cell: ({ value }) => {
                    switch (value) {
                         case 'pending':
                              return <span className="badge bg-warning">Pending</span>;
                         case 'approved':
                         case 'granted':
                              return <span className="badge bg-success">Approved</span>;
                         case 'rejected':
                              return <span className="badge bg-danger">Rejected</span>;
                         case 'revoked':
                              return <span className="badge bg-secondary">Revoked</span>;
                         case 'expired':
                              return <span className="badge bg-dark">Expired</span>;
                         default:
                              return <span className="badge bg-secondary">{value}</span>;
                    }
               }
          }
     ];



     return (
          <div className="border br-5 p-3" style={{ border: '1px solid #dee2e6' }}>
               <h6 className="fw-bold text-uppercase mb-3" style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    <RiFileTextLine className="me-2" />Recent Access Requests
               </h6>
               {isLoading ? (
                    <div className="text-center py-4">
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
               {(!accessRequests || accessRequests.length === 0) && !isLoading && (
                    <p className="text-muted text-center mb-0" style={{ fontSize: '0.85rem' }}>No access requests found.</p>
               )}
          </div>
     );
}