"use client";
import React, { useState, useEffect } from 'react';
import { customFetch, currencyFormatter, customPost } from '../../../../components/Auth/customFetch';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import dayjs from 'dayjs';
import { RiEditLine } from '@remixicon/react';

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

export default function OrganizationCommissionUpdatePage({ params }: { params: { organization: string } }) {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [data, setData] = useState<CommissionRecord[]>([]);
     const [showModal, setShowModal] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
     const [newRate, setNewRate] = useState('0');
     const [filtering, setFiltering] = useState(false);
     const [updating, setUpdating] = useState(false);
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);

     const handleServerSideProcessing = async (pagination: any) => {
          try {
               const { page, count, startDate, endDate } = pagination;
               const response = await customFetch(`commission-payments/detailed/list?page=${page}&&count=${count}&&recipientType=organization&&recipient_id=${encodeURIComponent(params.organization)}&&startDate=${encodeURIComponent(startDate)}&&endDate=${encodeURIComponent(endDate)}`);
               if (response && response.status) {
                    return { result: response.data || [] };
               }
               return { error: 'Failed to load commission records' };
          } catch (err: any) {
               return { error: err.message || 'An unknown error occurred' };
          }
     };

     useEffect(() => {
          const loadInitialData = async () => {
               const response = await handleServerSideProcessing({ page: 1, count: 10, startDate, endDate });
               if (response.result) {
                    setData(response.result);
               }
          };
          loadInitialData();
     }, [params.organization, startDate, endDate]);

     const handleUpdateRate = async () => {
          if (!selectedRecord) return;
          setUpdating(true);
          try {
               const response = await customPost(`commission-payments/commission/recipient/update-rates/${selectedRecord.id}`, 'PUT', {
                    recipientType: 'organization',
                    recipientId: selectedRecord.recipient_id,
                    commissionRate: parseFloat(newRate),
                    serviceid: selectedRecord.serviceid,
               });
               if (response && response.status) {
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

     const applyFilter = async () => {
          setFiltering(true);
          try {
               const response = await handleServerSideProcessing({ page: 1, count: 10, startDate, endDate });
               if (response.result) {
                    setData(response.result);
               }
          } catch (error) {
               console.error('Error applying filter:', error);
          } finally {
               setFiltering(false);
          }
     };

     const summary = data.reduce((acc, item) => {
          acc.totalPayable += Number(item.totalpayable);
          acc.totalPaid += Number(item.paidamount);
          acc.totalDue += Number(item.commission_due);
          return acc;
     }, { totalPayable: 0, totalPaid: 0, totalDue: 0 });

     const columns = [
          { accessor: 'serviceid', Header: 'Service ID' },
          {
               accessor: 'test_name', Header: 'Test Name', Cell: ({ row }: any) => (
                    <div>
                         <div>{row.original.test_name}</div>
                         <small className="text-muted">{row.original.serviceCategory}</small>
                    </div>
               )
          },
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
                         <RiEditLine size={16} className="me-1" />
                         Update
                    </Button>
               )
          }
     ];

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div>
                         <h1 className="h5 mb-1">Organization Commission Update</h1>
                         <p className="text-muted mb-0">Organization ID: {params.organization}</p>
                    </div>
                    <div className="d-flex gap-2 align-items-end flex-wrap">
                         <div>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}
                                   style={{ width: '140px' }}
                              />
                         </div>
                         <div>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={endDate}
                                   onChange={(e) => setEndDate(e.target.value)}
                                   min={startDate}
                                   style={{ width: '140px' }}
                              />
                         </div>
                         <Button variant="outline-primary" size="sm" onClick={applyFilter} disabled={filtering}>
                              {filtering ? 'Filtering...' : 'Filter'}
                         </Button>
                    </div>
               </div>

               <div className="border rounded p-3 mb-4">
                    <div className="row g-3 text-muted small">
                         <div className="col-sm-4">Total Payable: {currencyFormatter.format(summary.totalPayable)}</div>
                         <div className="col-sm-4">Total Paid: {currencyFormatter.format(summary.totalPaid)}</div>
                         <div className="col-sm-4">Total Due: {currencyFormatter.format(summary.totalDue)}</div>
                    </div>
               </div>

               <div className="d-none d-md-block">
                    <PrimeTable
                         data={data}
                         column={columns}
                         serverSideFiltering={true}
                         urlparams={filtering}
                         filtering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                    />
               </div>

               <div className="d-block d-md-none">
                    {data.map((record) => (
                         <Card key={record.id} className="mb-2" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
                              <Card.Body className="py-2 px-3">
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                             <div className="fw-bold small">{record.test_name}</div>
                                             <div className="text-muted small text-capitalize">{record.recipient_name}</div>
                                             <div className="mt-1 small">
                                                  <div>Paid: {currencyFormatter.format(Number(record.paidamount))}</div>
                                                  <div>Commission Due: {currencyFormatter.format(Number(record.commission_due))}</div>
                                             </div>
                                        </div>
                                        <Button variant="outline-primary" size="sm" onClick={() => openUpdateModal(record)}>
                                             <RiEditLine size={16} />
                                        </Button>
                                   </div>
                              </Card.Body>
                         </Card>
                    ))}
               </div>

               <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Update Commission Rate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRecord && (
                              <div className="small">
                                   <p className='text-capitalize'><strong>Recipient:</strong> {selectedRecord.recipient_name} ({selectedRecord.type})</p>
                                   <p className='text-capitalize'><strong>Service:</strong> {selectedRecord.test_name}</p>
                                   <Form.Group className="mb-3">
                                        <Form.Label>New Commission Rate (%)</Form.Label>
                                        <Form.Control
                                             type="number"
                                             value={newRate}
                                             onChange={(e) => setNewRate(e.target.value)}
                                             min="0"
                                             max="100"
                                             step="0.1"
                                             size="sm"
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
