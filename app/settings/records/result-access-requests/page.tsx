'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Modal, Alert } from 'react-bootstrap';
import { RiCheckLine, RiShieldCheckLine, RiClockwiseLine, RiEyeLine, RiFileTextLine, RiCloseLine } from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';
import themeContrast from '../../../../styles/theme-contrast.module.css';
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
}

export default function ResultAccessRequestsPage() {
     const { user } = useApplicationSettings().applicationsettings;
     const [showModal, setShowModal] = useState(false);
     const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
     const [filterStatus, setFilterStatus] = useState('all');
     const [initialData, setInitialData] = useState<AccessRequest[]>([]);

     useEffect(() => {
          const loadInitialData = async () => {
               const result = await handleServerSideProcessing({ page: 1, count: 10, sortby: 'DESC' });
               if (result.result) {
                    setInitialData(result.result);
               }
          };
          loadInitialData();
     }, []);

     const handleServerSideProcessing = async (pagination: { page: number; count: number, sortby: 'ASC' | 'DESC' }) => {
          const url = `security-features/history?page=${pagination.page}&count=${pagination.count}&sort=${pagination.sortby}`;
          try {
               const response = await customFetch(url);
               if (response && response.status === true) {
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: false };
               }
          } catch (error) {
               console.error('Failed to fetch access requests:', error);
               toast.error('Failed to load access requests');
               return { result: [], error: true };
          }
     };

     const filteredRequests = []; // Server-side filtering handled by PrimeTable

     const getStatusBadge = (status: string) => {
          switch (status) {
               case 'pending':
                    return <Badge bg="warning" text="dark" className="px-1">Pending</Badge>;
               case 'approved':
               case 'granted':
                    return <Badge bg="success" className="px-1">Approved</Badge>;
               case 'rejected':
                    return <Badge bg="danger" className="px-1">Rejected</Badge>;
               case 'revoked':
                    return <Badge bg="secondary" className="px-1">Revoked</Badge>;
               case 'expired':
                    return <Badge bg="dark" className="px-1">Expired</Badge>;
               default:
                    return <Badge bg="secondary" className="px-1">{status}</Badge>;
          }
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
               Cell: ({ value, row }: {row: {original: AccessRequest; index: number}; value: AccessRequest["requestType"]}) => value === 'edit' ? 'Edit Result' : `Access Result for test with Ascension ID ${row.original.ascensionid}`
          },

          {
               Header: 'Urgency',
               accessor: 'urgency',
               Cell: ({ value }: {value: AccessRequest["urgency"]}) => value
          },
          {
               Header: 'Requested At',
               accessor: 'requestedAt',
               Cell: ({ value }: {value: AccessRequest["requestedAt"]}) => <small>{new Date(value).toLocaleString()}</small>
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: {value: AccessRequest["status"]}) => getStatusBadge(value)
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: {row: {original: AccessRequest; index: number}}) => (
                    <div className="d-flex gap-1">
                         <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewDetails(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </Button>
                         {row.original.status === 'pending' && (
                              <>
                                   <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleApprove(row.original.id)}
                                   >
                                        <RiCheckLine size={14} />
                                   </Button>
                                   <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleReject(row.original.id)}
                                   >
                                        ×
                                   </Button>
                              </>
                         )}
                         {(row.original.status === 'approved' || row.original.status === 'granted') && (
                              <>
                                   <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRevoke(row.original.id)}
                                        title="Revoke Access"
                                   >
                                        <RiCloseLine size={14} />
                                   </Button>
                                   <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleExpire(row.original.id)}
                                        title="Expire Access"
                                   >
                                        Expire
                                   </Button>
                              </>
                         )}
                         {(row.original.status === 'revoked' || row.original.status === 'expired') && (
                              <Button
                                   variant="outline-success"
                                   size="sm"
                                   onClick={() => handleApprove(row.original.id)}
                                   title="Grant Access Again"
                              >
                                   <RiCheckLine size={14} />
                              </Button>
                         )}
                    </div>
               )
          }
     ];

     const handleApprove = async (requestId: number) => {
          try {
               const response = await customPost(`security-features/grant/${requestId}`, 'PUT', {
                    approved_by: user?.employeeid,
                    approval_notes: 'Approved'
               });
               if (response.status === true) {
                    toast.success('Request approved successfully');
                    window.location.reload(); // Simple refresh for now
               } else {
                    toast.error(response.message || 'Failed to approve request');
               }
          } catch (error) {
               console.error('Error approving request:', error);
               toast.error('Failed to approve request');
          }
     };

     const handleReject = async (requestId: number) => {
          try {
               const response = await customPost(`security-features/revoke/${requestId}`, 'PUT', {});
               if (response.status === true) {
                    toast.success('Request rejected successfully');
                    window.location.reload(); // Simple refresh for now
               } else {
                    toast.error(response.message || 'Failed to reject request');
               }
          } catch (error) {
               console.error('Error rejecting request:', error);
               toast.error('Failed to reject request');
          }
     };

     const handleExpire = async (requestId: number) => {
          try {
               const response = await customPost('security-features/expire', 'POST', { requestId });
               if (response.status === true) {
                    toast.success('Request expired successfully');
                    window.location.reload(); // Simple refresh for now
               } else {
                    toast.error(response.message || 'Failed to expire request');
               }
          } catch (error) {
               console.error('Error expiring request:', error);
               toast.error('Failed to expire request');
          }
     };

     const handleRevoke = async (requestId: number) => {
          try {
               const response = await customPost(`security-features/revoke/${requestId}`, 'PUT', {});
               if (response.status === true) {
                    toast.success('Access revoked successfully');
                    window.location.reload(); // Simple refresh for now
               } else {
                    toast.error(response.message || 'Failed to revoke access');
               }
          } catch (error) {
               console.error('Error revoking access:', error);
               toast.error('Failed to revoke access');
          }
     };

     const handleViewDetails = (request: AccessRequest) => {
          setSelectedRequest(request);
          setShowModal(true);
     };

     return (
          <div className={`container-fluid p-4 ${themeContrast.controls}`}>
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h2 className="mb-1">Result Access & Edit Requests</h2>
                         <p className="text-muted mb-0">Review and manage staff requests for accessing or editing test results</p>
                    </div>
                    <Button variant="outline-primary" size='sm' onClick={() => window.location.reload()}>
                         <RiClockwiseLine size={16} className="me-2" />
                         Refresh
                    </Button>
               </div>

               <Alert variant="info" className="mb-4">
                    <div className="d-flex align-items-start gap-3 text-sm">
                         <RiShieldCheckLine size={20} className="text-info-emphasis mt-1" />
                         <div>
                              <strong>Approval Workflow:</strong> Requests are automatically generated when staff attempt to access or edit results outside their permitted window. Review carefully to maintain data integrity and compliance.
                         </div>
                    </div>
               </Alert>

               <Row className="g-4">
                    <Col lg={12}>
                         <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center gap-2">
                                   <RiFileTextLine size={20} />
                                   <h5 className="mb-0">Access & Edit Requests</h5>
                              </div>
                         </div>
                         <PrimeTable column={columns} data={initialData} filtering={true} serverSideFiltering={true} handleSeverSideProcessing={handleServerSideProcessing} />
                    </Col>
               </Row>

               <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className={themeContrast.controls}>
                    <Modal.Header closeButton>
                         <Modal.Title>Request Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRequest && (
                              <div className="row g-3">
                                   <div className="col-md-3 text-sm border br-5 p-2 mx-1">
                                        <strong>Request ID:</strong> {selectedRequest.id}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 mx-1">
                                        <strong>Status:</strong> {getStatusBadge(selectedRequest.status)}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 mx-1">
                                        <strong>Staff ID:</strong> {selectedRequest.staffid}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 text-sm mx-1">
                                        <strong>Patient ID:</strong> {selectedRequest.patientid}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 text-sm mx-1">
                                        <strong>Request Type:</strong> {selectedRequest.requestType === 'edit' ? 'Edit Result' : 'Access Result'}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 text-sm mx-1">
                                        <strong>Urgency:</strong> {selectedRequest.urgency}
                                   </div>
                                   <div className="col-md-3 text-sm border br-5 p-2 text-sm mx-1">
                                        <strong>Ascension ID:</strong> {selectedRequest.ascensionid}
                                   </div>
                                   <div className="col-12">
                                        <strong>Reason:</strong>
                                        <p className="mt-1 mb-0 border br-5 p-3 text-sm ">{selectedRequest.reason}</p>
                                   </div>
                                   <div className="col-md-6 text-sm border br-5 p-2 mx-1">
                                        <strong>Requested At:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}
                                   </div>
                                   {selectedRequest.grantedAt && (
                                        <div className="col-md-6 text-sm border br-5 p-2 mx-1">
                                             <strong>Granted At:</strong> {new Date(selectedRequest.grantedAt).toLocaleString()}
                                        </div>
                                   )}
                                   {selectedRequest.revokedAt && (
                                        <div className="col-md-6 text-sm border br-5 p-2 mx-1">
                                             <strong>Revoked At:</strong> {new Date(selectedRequest.revokedAt).toLocaleString()}
                                        </div>
                                   )}
                                   {selectedRequest.expiredAt && (
                                        <div className="col-md-6 text-sm border br-5 p-2 mx-1">
                                             <strong>Expired At:</strong> {new Date(selectedRequest.expiredAt).toLocaleString()}
                                        </div>
                                   )}
                                   {selectedRequest.accessedAt && (
                                        <div className="col-md-6 text-sm border br-5 p-2 mx-1">
                                             <strong>Accessed At:</strong> {new Date(selectedRequest.accessedAt).toLocaleString()}
                                        </div>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                              Close
                         </Button>
                         {selectedRequest && selectedRequest.status === 'pending' && (
                              <>
                                   <Button variant="success" size="sm" onClick={() => { handleApprove(selectedRequest.id); setShowModal(false); }}>
                                        Approve
                                   </Button>
                                   <Button variant="danger" size="sm" onClick={() => { handleReject(selectedRequest.id); setShowModal(false); }}>
                                        Reject
                                   </Button>
                              </>
                         )}
                         {selectedRequest && (selectedRequest.status === 'approved' || selectedRequest.status === 'granted') && (
                              <>
                                   <Button variant="outline-danger" size="sm" onClick={() => { handleRevoke(selectedRequest.id); setShowModal(false); }}>
                                        Revoke Access
                                   </Button>
                                   <Button variant="outline-warning" size="sm" onClick={() => { handleExpire(selectedRequest.id); setShowModal(false); }}>
                                        Expire Access
                                   </Button>
                              </>
                         )}
                         {selectedRequest && (selectedRequest.status === 'revoked' || selectedRequest.status === 'expired') && (
                              <Button variant="success" size="sm" onClick={() => { handleApprove(selectedRequest.id); setShowModal(false); }}>
                                   Grant Access Again
                              </Button>
                         )}
                    </Modal.Footer>
               </Modal>
          </div>
     );
}