"use client";
import { useState, useEffect } from 'react';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { RiFileTextLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch } from '../../Auth/customFetch';
interface AccessRequest {
     id: number;
     requestType: string;
     requestReason: string;
     urgencyLevel: string;
     additionalNotes?: string;
     ascensionid: string;
     testid: string;
     patientid: string;
     employeeid: string;
     requestedAt: string;
     status: 'pending' | 'approved' | 'rejected';
     response?: string;
}

interface AccessHistoryTableProps {
     employeeid: string;
}

export default function AccessHistoryTable({ employeeid }: AccessHistoryTableProps) {
     const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
     const [isLoading, setIsLoading] = useState(false);

     const fetchAccessRequests = async (params = {}) => {
          try {
               setIsLoading(true);
               const queryParams = new URLSearchParams({
                    employeeid,
                    ...params
               });

               const response = await customFetch(`ultrasound/access/requests?${queryParams}`);
               if (response && Array.isArray(response)) {
                    setAccessRequests(response);
                    return { result: response };
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
          fetchAccessRequests();
     }, [employeeid]);

     const handleServerSideProcessing = async (params: any) => {
          return await fetchAccessRequests(params);
     };

     const columns = [
          {
               Header: 'Date',
               accessor: 'requestedAt',
               Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Type',
               accessor: 'requestType'
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => value.charAt(0).toUpperCase() + value.slice(1)
          },
          {
               Header: 'Response',
               accessor: 'response',
               Cell: ({ value }: { value: string }) => value || 'Awaiting review'
          }
     ];

     const defaultData = [
          {
               requestedAt: '2025-11-02',
               requestType: 'Edit Access',
               status: 'pending',
               response: 'Awaiting review'
          }
     ];

     return (
          <div className="border br-5 p-3" style={{ border: '1px solid #dee2e6' }}>
               <h6 className="fw-bold text-uppercase mb-3" style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    <RiFileTextLine className="me-2" />Recent Access Requests
               </h6>
               <div style={{ fontSize: '0.85rem' }}>
                    <PrimeTable
                         column={columns}
                         data={accessRequests.length > 0 ? accessRequests : defaultData}
                         filtering={true}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                    />
               </div>
               {(!accessRequests || accessRequests.length === 0) && !isLoading && (
                    <p className="text-muted text-center mb-0" style={{ fontSize: '0.85rem' }}>No access requests found.</p>
               )}
          </div>
     );
}