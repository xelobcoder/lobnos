"use client";
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import { RiEditLine, RiFileList3Line } from '@remixicon/react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import PrimeTable from '../../../../../../components/accessories/Datatables/PrimeTable';
import { customPost, currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface CommissionRecord {
     id: number;
     service_id: number;
     service_amount: string;
     commission_type: string;
     percentage_rate_applied: number | null;
     fixed_amount_applied: number | null;
     tier_id: number | null;
     commission_due: string;
     min_cap_adjustment: string;
     max_cap_adjustment: string;
     period_cap_adjustment: string;
     final_commission: string;
     config_id: number | null;
     assignment_id: number | null;
     recipient_type: string;
     recipient_id: number;
     cap_period_reference: string | null;
     status: string;
     currency: string;
     calculated_at: string;
     created_at: string;
     updated_at: string;
     totalpayable: string;
     paidamount: string;
     serviceAddedOn: string;
     serviceCategory: string;
     test_name: string;
     recipient_name?: string; // Optional, may be added separately
}

export default function CommissionUpdatePage() {
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
     const [dateFilter, setDateFilter] = useState('This Year');
     const clinicianid = useParams()?.clinicianid;

     const handleDateRangeChange = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     const handleServerSideProcessing = async (pagination) => {
          try {
               const { page, count, startDate, endDate } = pagination
               const response = await customFetch(`commission-payments/detailed/list?page=${page}&&count=${count}&&recipientType=clinician&&recipient_id=${encodeURIComponent(clinicianid ? clinicianid.toString() : '')}&&startDate=${encodeURIComponent(startDate)}&&endDate=${encodeURIComponent(endDate)}`);
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
               const response = await customPost(`commission-payments/commission/recipient/update-rates/${selectedRecord.id}`, 'PUT', {
                    recipientType: selectedRecord.recipient_type,
                    recipientId: selectedRecord.recipient_id,
                    commissionRate: parseFloat(newRate),
                    serviceid: selectedRecord.service_id,
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
          setNewRate(record.percentage_rate_applied ? record.percentage_rate_applied.toString() : '0');
          setShowModal(true);
     };

     const applyFilter = async () => {
          setFiltering(true);
          try {
               const response = await handleServerSideProcessing({ page: 1, count: 10 });
               if (response.result) {
                    setData(response.result);
               } else if (response.error) {
                    console.error(response.error);
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
          {
               accessor: 'test_name', Header: 'Test Name', Cell: ({ row }: any) => (
                    <div className="fw-bold">
                         <div>{row.original.test_name} ({row.original.service_id})</div>
                         <small className="text-muted">{row.original.serviceCategory.toString().includes("_") ? row.original.serviceCategory.toString().replace("_", " ") : row.original.serviceCategory.toString()}</small>
                    </div>
               )
          },
          { accessor: 'service_amount', Header: 'Service Amount', Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.service_amount)) },
          {
               accessor: 'commission_type', Header: 'Commission Type',
               Cell: ({ row }: any) => {
                    const type = row.original.commission_type;
                    const rate = row.original.percentage_rate_applied;
                    return type === 'percentage' ? `Percentage (${rate}%)` : 'Fixed Amount';
               }
          },
          { accessor: 'fixed_amount_applied', Header: 'Fixed Amount', Cell: ({ row }: any) => row.original.fixed_amount_applied ? currencyFormatter.format(Number(row.original.fixed_amount_applied)) : 'N/A' },
          {
               accessor: 'commission_due', Header: 'Commission',
               Cell: ({ row }: any) => {
                    const commissionDue = Number(row.original.commission_due);
                    return (
                         <div>
                              <span className="fw-bold">{currencyFormatter.format(commissionDue)}</span>
                         </div>
                    )
               }
          },
          {
               accessor:"final_commission", Header: 'Final Commission', Cell: ({ row }: any) => {
                    const finalCommission = Number(row.original.final_commission);
                    return (
                         <div>
                              <span className="fw-bold">{currencyFormatter.format(finalCommission)}</span>
                         </div>
                    )
               }
          },
          { accessor: 'status', Header: 'Status' },
          { accessor: 'recipient_type', Header: 'Recipient Type' },
          { accessor: 'recipient_name', Header: 'Recipient Name', Cell: ({ row }: any) => row.original.recipient_name || 'N/A' },
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
               <h1 className="fs-5 fw-bold mb-3 bg-white p-2 d-flex align-items-center">
                    Commission Update
               </h1>

               <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="border rounded p-3 mb-4 d-flex flex-column col-4  bg-white">
                         <div>
                              <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>Total Commission Due</span>
                              <div className="fs-3 fw-bold text-primary">{currencyFormatter.format(summary.totalDue)}</div>
                         </div>

                    </div>
                    <div className="d-flex col-6">
                         <DateFilterReusable
                              value={dateFilter}
                              onChange={setDateFilter}
                              className="me-2"
                              onDateRangeChange={handleDateRangeChange}
                              label="Filter by"
                         />
                         <Button variant="outline-primary" size="sm" onClick={applyFilter} disabled={filtering}>
                              {filtering ? 'Filtering...' : 'Filter Records'}
                         </Button>
                    </div>
               </div>

               {/* Mobile Card View */}
               <div className="d-block d-md-none">
                    {data.map((record) => (
                         <Card key={record.id} className="mb-2" style={{ fontSize: '0.9rem', backgroundColor: 'var(--theme-card-bg)' }}>
                              <Card.Body className="py-2 px-3">
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                             <div className="fw-bold text-primary small">{record.test_name}</div>
                                             <div className="text-muted small text-capitalize">{record.recipient_name}</div>
                                             <div className="mt-1">
                                                  <div className="d-flex justify-content-between">
                                                       <span className="small">Paid: {currencyFormatter.format(Number(record.paidamount))}</span>
                                                       <span className="small">Comm: {record.percentage_rate_applied !== null ? `${record.percentage_rate_applied}%` : 'N/A'}</span>
                                                  </div>
                                                  <div className="small fw-bold">Commission Due: {currencyFormatter.format(Number(record.commission_due))}</div>
                                             </div>
                                        </div>
                                        <Button
                                             variant="outline-primary"
                                             size="sm"
                                             onClick={() => openUpdateModal(record)}
                                             title="Update Commission"
                                        >
                                             <RiEditLine size={16} />
                                             Edit
                                        </Button>
                                   </div>
                              </Card.Body>
                         </Card>
                    ))}
               </div>

               {/* Table View */}
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

               <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Update Commission Rate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRecord && (
                              <div className="small">
                                   <p className='text-capitalize'><strong>Recipient:</strong> {selectedRecord.recipient_name || 'N/A'} ({selectedRecord.recipient_type})</p>
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