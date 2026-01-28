'use client'
import React, { useEffect, useState, useRef } from 'react'
import { customFetch, customPost } from '../../../../components/Auth/customFetch'
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import Head from 'next/head';


interface FreeServiceRequest {
     id: number;
     requester_name: string;
     reason: string;
     status: string;
     created_at: string;
     updated_at: string;
     // Add other fields as needed
}

interface ReviewerInfo {
     id: string;
     name: string;
}

interface ReviewPayload {
     request_id: number;
     reviewer_id: string;
     reviewer_name: string;
     reviewer_notes: string;
}

export default function Authorization() {
     const [requests, setRequests] = useState<FreeServiceRequest[]>([]);
     const [loading, setLoading] = useState<boolean>(false);
     const [modalShow, setModalShow] = useState<boolean>(false);
     const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
     const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
     const [reviewerNotes, setReviewerNotes] = useState<string>('');
     const [reviewerInfo, setReviewerInfo] = useState<ReviewerInfo | null>(null);
     const [processing, setProcessing] = useState<boolean>(false);
     const [error, setError] = useState<string>('');
     const formRef = useRef<HTMLFormElement>(null);
     const user = useApplication()?.user;
     const employeeid = user?.employeeid;
     const username = user?.username;

     const getData = async () => {
          try {
               setLoading(true);
               const response = await customFetch('billing/free-services/list');
               const { status, data } = response;
               if (Array.isArray(data?.data) && status) {
                    setRequests(data.data);
               } else {
                    setRequests([]);
               }
          } catch (error) {
               console.error('Error fetching requests:', error);
               setRequests([]);
          } finally {
               setLoading(false);
          }
     }

     // Fetch reviewer info on component mount
     useEffect(() => {
          const fetchReviewerInfo = () => {
               // Replace with actual reviewer info from your auth system
               // Example: from localStorage, context, or API
               const reviewerId = localStorage.getItem('userId') || 'reviewer_123';
               const reviewerName = localStorage.getItem('userName') || 'Reviewer User';

               setReviewerInfo({
                    id: reviewerId,
                    name: reviewerName
               });
          };

          fetchReviewerInfo();
          getData();
     }, []);

     const handleReviewAction = (id: number, action: 'approve' | 'reject') => {
          setSelectedRequestId(id);
          setActionType(action);
          setReviewerNotes('');
          setError('');
          setModalShow(true);
     }

     const handleSubmitReview = async () => {
          if (!selectedRequestId || !actionType || !reviewerInfo) {
               setError('Missing required information');
               return;
          }

          if (reviewerNotes.trim().length === 0) {
               setError('Please enter reviewer notes');
               return;
          }

          const payload: ReviewPayload = {
               request_id: selectedRequestId,
               reviewer_id: employeeid,
               reviewer_name: username,
               reviewer_notes: reviewerNotes
          };

          try {
               setProcessing(true);
               setError('');

               const endpoint = actionType === 'approve'
                    ? 'billing/free-services/approve'
                    : 'billing/free-services/reject';

               const response = await customPost(endpoint, 'POST', payload);

               if (response.status) {
                    // Show success message
                    alert(`Request successfully ${actionType === 'approve' ? 'approved' : 'rejected'}!`);

                    // Refresh the data
                    await getData();

                    // Close modal
                    handleCloseModal();
               } else {
                    setError(response.message || `Failed to ${actionType} request`);
               }
          } catch (error) {
               console.error(`Error ${actionType}ing request:`, error);
               setError(`An error occurred while processing your request`);
          } finally {
               setProcessing(false);
          }
     }

     const handleCloseModal = () => {
          setModalShow(false);
          setSelectedRequestId(null);
          setActionType(null);
          setReviewerNotes('');
          setError('');
          setProcessing(false);
     }

     const handleModalShow = () => {
          if (formRef.current) {
               formRef.current.focus();
          }
     }

     const columns = [
          { Header: 'ID', accessor: 'id' },
          { Header: 'Requester Name', accessor: 'requester_name' },
          { Header: 'Reason', accessor: 'reason' },
          { Header: 'Reviewer Name', accessor: 'reviewer_name' },
          { Header: 'Reviewer Notes', accessor: 'reviewer_notes' },
          { Header: 'Status', accessor: 'status' },
          { Header: 'Created At', accessor: 'created_at' },
          { Header: 'Updated At', accessor: 'updated_at' },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: any) => {
                    const request = row.original;
                    const isPending = request.status ? request.status.toLowerCase() === 'pending' : false;

                    return (
                         <div>
                              <button
                                   className='btn btn-outline-primary btn-sm me-2'
                                   onClick={() => handleReviewAction(request.id, 'approve')}
                                   disabled={!isPending || loading}
                                   style={{ marginRight: '10px' }}
                              >
                                   {loading ? 'Loading...' : 'Approve'}
                              </button>
                              <button
                                   className='btn btn-outline-danger btn-sm'
                                   onClick={() => handleReviewAction(request.id, 'reject')}
                                   disabled={!isPending || loading}
                              >
                                   {loading ? 'Loading...' : 'Reject'}
                              </button>
                         </div>
                    )
               }
          },
     ]

     return (
          <div>
               <div className="mx-2">
                    <PrimeTable
                         filtering={true}
                         column={columns}
                         isExpoerted={false}
                         handleSeverSideProcessing={null}
                         serverSideFiltering={false}
                         data={requests}
                    />
               </div>

               {/* Bootstrap Modal for Review Notes */}
               <Modal
                    show={modalShow}
                    onHide={handleCloseModal}
                    onShow={handleModalShow}
                    centered
                    backdrop="static"
               >
                    <Modal.Header closeButton>
                         <Modal.Title>
                              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {error && (
                              <div className="alert alert-danger" role="alert">
                                   {error}
                              </div>
                         )}

                         <Form ref={formRef}>
                              <Form.Group className="mb-3" controlId="reviewerNotes">
                                   <Form.Label>
                                        Reviewer Notes <span className="text-danger">*</span>
                                   </Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={reviewerNotes}
                                        onChange={(e) => setReviewerNotes(e.target.value)}
                                        placeholder="Enter your review notes here..."
                                        disabled={processing}
                                        required
                                   />
                                   <Form.Text className="text-muted">
                                        Please provide details for your decision to {actionType} this request.
                                   </Form.Text>
                              </Form.Group>

                              <div className="alert alert-info" role="alert">
                                   <strong>Request ID:</strong> {selectedRequestId}<br />
                                   <strong>Reviewer:</strong> {reviewerInfo?.name}
                              </div>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button
                              variant="secondary"
                              onClick={handleCloseModal}
                              disabled={processing}
                         >
                              Cancel
                         </Button>
                         <Button
                              variant={actionType === 'approve' ? 'success' : 'danger'}
                              onClick={handleSubmitReview}
                              disabled={processing || reviewerNotes.trim().length === 0}
                         >
                              {processing ? (
                                   <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                   </>
                              ) : (
                                   `${actionType === 'approve' ? 'Approve' : 'Reject'} Request`
                              )}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     )
}