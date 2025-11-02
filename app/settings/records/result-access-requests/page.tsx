'use client';

import React, { useState } from 'react';
import { Row, Col, Button, Badge, Modal, Alert, Form } from 'react-bootstrap';
import { RiTimeLine, RiCheckLine, RiShieldCheckLine, RiSettings4Line, RiSaveLine, RiEditLine, RiClockwiseLine, RiUserLine, RiAdminLine, RiEyeLine, RiFileTextLine } from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
interface AccessRequest {
     id: string;
     staffName: string;
     staffRole: string;
     patientId: string;
     testType: string;
     requestType: string;
     reason: string;
     requestedAt: string;
     status: string;
     approverRole: string;
     approvedBy?: string;
     approvedAt?: string;
     rejectedBy?: string;
     rejectedAt?: string;
     rejectionReason?: string;
}

export default function ResultAccessRequestsPage() {
     const [showModal, setShowModal] = useState(false);
     const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
     const [filterStatus, setFilterStatus] = useState('all');

     const accessRequests = [
          {
               id: 'req-001',
               staffName: 'Dr. Sarah Johnson',
               staffRole: 'Lab Technician',
               patientId: 'PAT-12345',
               testType: 'Routine Blood Work',
               requestType: 'Edit Result',
               reason: 'Corrected hemoglobin value based on re-test',
               requestedAt: '2025-11-02T10:30:00Z',
               status: 'pending',
               approverRole: 'supervisor'
          },
          {
               id: 'req-002',
               staffName: 'Mike Chen',
               staffRole: 'Lab Assistant',
               patientId: 'PAT-67890',
               testType: 'Urinalysis',
               requestType: 'Access Result',
               reason: 'Reviewing historical results for comparison',
               requestedAt: '2025-11-02T09:15:00Z',
               status: 'approved',
               approvedBy: 'Dr. Emily Davis',
               approvedAt: '2025-11-02T09:45:00Z',
               approverRole: 'manager'
          },
          {
               id: 'req-003',
               staffName: 'Lisa Wong',
               staffRole: 'Senior Technician',
               patientId: 'PAT-54321',
               testType: 'Specialized Genetic Test',
               requestType: 'Edit Result',
               reason: 'Updated interpretation based on new guidelines',
               requestedAt: '2025-11-01T14:20:00Z',
               status: 'rejected',
               rejectedBy: 'Dr. Robert Kim',
               rejectedAt: '2025-11-01T15:00:00Z',
               rejectionReason: 'Changes require additional clinical review',
               approverRole: 'admin'
          },
          {
               id: 'req-004',
               staffName: 'Tom Anderson',
               staffRole: 'Lab Supervisor',
               patientId: 'PAT-98765',
               testType: 'Urgent CBC',
               requestType: 'Access Result',
               reason: 'Emergency review requested by physician',
               requestedAt: '2025-11-02T11:00:00Z',
               status: 'pending',
               approverRole: 'supervisor'
          }
     ];

     const filteredRequests = filterStatus === 'all' ? accessRequests : accessRequests.filter(req => req.status === filterStatus);

     const getStatusBadge = (status) => {
          switch (status) {
               case 'pending':
                    return <Badge bg="warning" className="px-1">Pending</Badge>;
               case 'approved':
                    return <Badge bg="success" className="px-1">Approved</Badge>;
               case 'rejected':
                    return <Badge bg="danger" className="px-1">Rejected</Badge>;
               default:
                    return <Badge bg="secondary" className="px-1">{status}</Badge>;
          }
     };

     const columns = [
          {
               Header: 'Staff Member',
               accessor: 'staffName',
               Cell: ({ row }) => (
                    <div>
                         <div className="fw-semibold">{row.original.staffName}</div>
                         <small className="text-muted">{row.original.staffRole}</small>
                    </div>
               )
          },
          {
               Header: 'Patient ID',
               accessor: 'patientId',
               Cell: ({ row }) => <span className="fw-mono">{row.original.patientId}</span>
          },
          {
               Header: 'Request Type',
               accessor: 'requestType',
               Cell: ({ row }) => (
                    <Badge bg={row.original.requestType === 'Edit Result' ? 'primary' : 'info'} className="px-1">
                         {row.original.requestType}
                    </Badge>
               )
          },
          {
               Header: 'Requested At',
               accessor: 'requestedAt',
               Cell: ({ row }) => <small>{new Date(row.original.requestedAt).toLocaleString()}</small>
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ row }) => getStatusBadge(row.original.status)
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }) => (
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
                    </div>
               )
          }
     ];

     const handleApprove = (requestId) => {
          console.log('Approving request:', requestId);
          // In a real app, this would update the backend
     };

     const handleReject = (requestId) => {
          console.log('Rejecting request:', requestId);
          // In a real app, this would update the backend
     };

     const handleViewDetails = (request) => {
          setSelectedRequest(request);
          setShowModal(true);
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h2 className="mb-1">Result Access & Edit Requests</h2>
                         <p className="text-muted mb-0">Review and manage staff requests for accessing or editing test results</p>
                    </div>
                    <Button variant="outline-primary" onClick={() => window.location.reload()}>
                         <RiClockwiseLine size={16} className="me-2" />
                         Refresh
                    </Button>
               </div>

               <Alert variant="info" className="mb-4">
                    <div className="d-flex align-items-start gap-3">
                         <RiShieldCheckLine size={20} className="text-info mt-1" />
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
                              <Form.Select
                                   value={filterStatus}
                                   onChange={(e) => setFilterStatus(e.target.value)}
                                   style={{ width: 'auto' }}
                              >
                                   <option value="all">All Status</option>
                                   <option value="pending">Pending</option>
                                   <option value="approved">Approved</option>
                                   <option value="rejected">Rejected</option>
                              </Form.Select>
                         </div>
                         <PrimeTable   column={columns} data={filteredRequests} filtering={true} serverSideFiltering={true} handleSeverSideProcessing={() => { }} />
                    </Col>
               </Row>

               <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Request Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRequest && (
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <strong>Request ID:</strong> {selectedRequest.id}
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Status:</strong> {getStatusBadge(selectedRequest.status)}
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Staff Member:</strong> {selectedRequest.staffName} ({selectedRequest.staffRole})
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Patient ID:</strong> {selectedRequest.patientId}
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Request Type:</strong> {selectedRequest.requestType}
                                   </div>
                                   <div className="col-12">
                                        <strong>Reason:</strong>
                                        <p className="mt-1 mb-0">{selectedRequest.reason}</p>
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Requested At:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}
                                   </div>
                                   <div className="col-md-6">
                                        <strong>Approver Role:</strong> {selectedRequest.approverRole}
                                   </div>
                                   {selectedRequest.status === 'approved' && (
                                        <>
                                             <div className="col-md-6">
                                                  <strong>Approved By:</strong> {selectedRequest.approvedBy}
                                             </div>
                                             <div className="col-md-6">
                                                  <strong>Approved At:</strong> {selectedRequest.approvedAt ? new Date(selectedRequest.approvedAt).toLocaleString() : 'N/A'}
                                             </div>
                                        </>
                                   )}
                                   {selectedRequest.status === 'rejected' && (
                                        <>
                                             <div className="col-md-6">
                                                  <strong>Rejected By:</strong> {selectedRequest.rejectedBy}
                                             </div>
                                             <div className="col-md-6">
                                                  <strong>Rejected At:</strong> {selectedRequest.rejectedAt ? new Date(selectedRequest.rejectedAt).toLocaleString() : 'N/A'}
                                             </div>
                                             <div className="col-12">
                                                  <strong>Rejection Reason:</strong>
                                                  <p className="mt-1 mb-0 text-danger">{selectedRequest.rejectionReason}</p>
                                             </div>
                                        </>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowModal(false)}>
                              Close
                         </Button>
                         {selectedRequest && selectedRequest.status === 'pending' && (
                              <>
                                   <Button variant="success" onClick={() => { handleApprove(selectedRequest.id); setShowModal(false); }}>
                                        Approve
                                   </Button>
                                   <Button variant="danger" onClick={() => { handleReject(selectedRequest.id); setShowModal(false); }}>
                                        Reject
                                   </Button>
                              </>
                         )}
                    </Modal.Footer>
               </Modal>
          </div>
     );
}