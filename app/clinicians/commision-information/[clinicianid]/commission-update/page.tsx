"use client";
import React, { useState, useEffect } from 'react';
import { customFetch, currencyFormatter, customPost } from '../../../../../components/Auth/customFetch';
import { Button, Modal, Form } from 'react-bootstrap';
import { RiEditLine, RiFileList3Line } from '@remixicon/react';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import { useParams } from 'next/navigation';
interface CommissionRecord {
     id: number;
     serviceid: number;
     commission_percentage: string;
     commission_due: string;
     type: string;
     recipient_id: number;
     calculated_at: string;
     created_at: string;
     updated_at: string;
     serviceCategory: string;
     totalpayable: string;
     paidamount: string;
     serviceAddedOn: string;
     test_name: string;
     recipient_name: string;
}

export default function CommissionUpdatePage() {
     const [data, setData] = useState<CommissionRecord[]>([]);
     const [showModal, setShowModal] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
     const [newRate, setNewRate] = useState('0');
     const [updating, setUpdating] = useState(false);
     const clinicianid = useParams().clinicianid;

     const handleServerSideProcessing = async (pagination) => {
          try {
               const { page, count } = pagination
               const response = await customFetch(`commission-payments/detailed/list?page=${page}&&count=${count}&&recipientType=clinician&&recipient_id=${encodeURIComponent(clinicianid.toString())}`);
               if (response && response.status) {
                    return { result: response.data || [] };
               } else {
                    return { error: 'Failed to load commission records' };
               }
          } catch (err: any) {
               return { error: err.message || 'An unknown error occurred' };
          }
     };

     useEffect(() => {
          const loadInitialData = async () => {
               const response = await handleServerSideProcessing({ page: 1, count: 10 });
               if (response.result) {
                    setData(response.result);
               } else if (response.error) {
                    console.error(response.error);
               }
          };
          loadInitialData();
     }, []);

     const handleUpdateRate = async () => {
          if (!selectedRecord) return;
          setUpdating(true);
          try {
               const response = await customPost('commission-payments/commission/recipient/update-rates', 'POST', {
                    recipientType: selectedRecord.type,
                    recipientId: selectedRecord.recipient_id,
                    commissionRate: parseFloat(newRate),
               });
               if (response && response.status) {
                    // Refresh data - since server-side, perhaps trigger reload
                    // For now, close modal
                    setShowModal(false);
                    setSelectedRecord(null);
               } else {
                    alert('Failed to update commission rate');
               }
          } catch (error) {
               console.error('Error updating rate:', error);
               alert('Error updating commission rate');
          } finally {
               setUpdating(false);
          }
     };

     const openUpdateModal = (record: CommissionRecord) => {
          setSelectedRecord(record);
          setNewRate(record.commission_percentage);
          setShowModal(true);
     };

     const columns = [
          { accessor: 'id', Header: 'ID' },
          { accessor: 'serviceid', Header: 'Service ID' },
          { accessor: 'test_name', Header: 'Test Name' },
          { accessor: 'serviceCategory', Header: 'Service Category' },
          { accessor: 'totalpayable', Header: 'Total Payable', Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.totalpayable)) },
          { accessor: 'paidamount', Header: 'Paid Amount', Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.paidamount)) },
          { accessor: 'commission_percentage', Header: 'Commission %', Cell: ({ row }: any) => `${row.original.commission_percentage}%` },
          { accessor: 'commission_due', Header: 'Commission Due', Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.commission_due)) },
          { accessor: 'type', Header: 'Recipient Type' },
          { accessor: 'recipient_name', Header: 'Recipient Name' },
          {
               Header: 'Actions', Cell: ({ row }: any) => (
                    <Button
                         variant="outline-primary btn-outline-sm"
                         size="sm"
                         onClick={() => openUpdateModal(row.original)}
                    >

                         Update
                    </Button>
               )
          }
     ];

     return (
          <div>
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="h3 mb-0">
                         <RiFileList3Line className="me-2" />
                         Update Commission Records
                    </h4>
               </div>

               <PrimeTable
                    data={data}
                    column={columns}
                    serverSideFiltering={true}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
               />

               {/* Update Modal */}
               <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Update Commission Rate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRecord && (
                              <div>
                                   <p><strong>Recipient:</strong> {selectedRecord.recipient_name} ({selectedRecord.type})</p>
                                   <p><strong>Service:</strong> {selectedRecord.test_name}</p>
                                   <Form.Group className="mb-3">
                                        <Form.Label>New Commission Rate (%)</Form.Label>
                                        <Form.Control
                                             type="number"
                                             value={newRate}
                                             onChange={(e) => setNewRate(e.target.value)}
                                             min="0"
                                             max="100"
                                             step="0.1"
                                        />
                                   </Form.Group>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="outline-primary" size="sm" onClick={handleUpdateRate} disabled={updating}>
                              {updating ? 'Updating...' : 'Update Rate'}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}