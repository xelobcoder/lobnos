"use client";
import { RiEditLine } from '@remixicon/react';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import { customPost, currencyFormatter,customFetch } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';

interface CommissionRecord {
     id: number;
     service_id: number;
     service_amount: string;
     commission_type: string;
     percentage_rate_applied: number | null;
     fixed_amount_applied: number | null;
     tier_id?: number;
     commission_due: string;
     min_cap_adjustment: string;
     max_cap_adjustment: string;
     period_cap_adjustment: string;
     final_commission: string;
     config_id: number;
     assignment_id?: number;
     recipient_type: string;
     recipient_id: number;
     cap_period_reference?: string;
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
     recipient_name?: string;
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
     const employeeid = useApplication()?.user?.employeeid;

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
               const response = await customPost(
                    `commission-payments/commission/recipient/update-rates/${selectedRecord.id}?employeeid=${employeeid}`,
                    'PUT',
                    {
                         recipientType: selectedRecord.recipient_type,
                         recipientId: selectedRecord.recipient_id,
                         configId: selectedRecord.config_id,
                         serviceId: selectedRecord.service_id,
                         newCommissionAmount: parseFloat(newRate),
                    }
               );
               if (response && response.status == true) {
                    toast.success('Commission rate updated successfully');
                    setShowModal(false);
                    setSelectedRecord(null);
                    const refreshResponse = await handleServerSideProcessing({
                         page: 1,
                         count: 10,
                         startDate,
                         endDate,
                    });
                    if (refreshResponse.result) {
                         setData(refreshResponse.result);
                    }
               } else {
                    toast.error(response?.message || 'Failed to update commission rate');
               }
          } catch (error) {
               console.error('Error updating rate:', error);
               toast.error('Error updating commission rate');
          } finally {
               setUpdating(false);
          }
     };

     const openUpdateModal = (record: CommissionRecord) => {
          setSelectedRecord(record);
          setNewRate(record.final_commission);
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

     const summary = data.reduce(
          (acc, item) => {
               acc.totalServiceAmount += Number(item.service_amount);
               acc.totalCommission += Number(item.final_commission);
               acc.totalAdjustments +=
                    Number(item.min_cap_adjustment) +
                    Number(item.max_cap_adjustment) +
                    Number(item.period_cap_adjustment);
               return acc;
          },
          { totalServiceAmount: 0, totalCommission: 0, totalAdjustments: 0 }
     );

     const columns = [
          { accessor: 'service_id', Header: 'Service ID' },
          {
               accessor: 'test_name',
               Header: 'Test Name',
               Cell: ({ row }: any) => (
                    <div>
                         <div>{row.original.test_name}</div>
                         <small className="text-muted">{row.original.serviceCategory}</small>
                    </div>
               ),
          },
          {
               accessor: 'service_amount',
               Header: 'Service Amount',
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.service_amount)),
          },
          {
               accessor: 'commission_type',
               Header: 'Commission Type',
               Cell: ({ row }: any) => (
                    <span className="badge bg-info">{row.original.commission_type}</span>
               ),
          },
          {
               accessor: 'final_commission',
               Header: 'Commission',
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.final_commission)),
          },
          {
               accessor: 'min_cap_adjustment',
               Header: 'Min Cap Adj',
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.min_cap_adjustment)),
          },
          {
               accessor: 'max_cap_adjustment',
               Header: 'Max Cap Adj',
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.max_cap_adjustment)),
          },
          {
               accessor: 'period_cap_adjustment',
               Header: 'Period Cap Adj',
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.period_cap_adjustment)),
          },
          {
               accessor: 'status',
               Header: 'Status',
               Cell: ({ row }: any) => {
                    const statusColor: { [key: string]: string } = {
                         pending: 'warning',
                         approved: 'info',
                         paid: 'success',
                         voided: 'danger',
                         adjusted: 'secondary',
                    };
                    return (
                         <span className={`badge bg-${statusColor[row.original.status] || 'secondary'}`}>
                              {row.original.status}
                         </span>
                    );
               },
          },
          {
               Header: 'Actions',
               Cell: ({ row }: any) => (
                    <Button
                         variant="outline-primary btn-outline-sm"
                         size="sm"
                         onClick={() => openUpdateModal(row.original)}
                    >
                         <RiEditLine size={16} className="me-1" />
                         Update
                    </Button>
               ),
          },
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
                         <div className="col-sm-4">Total Service Amount: {currencyFormatter.format(summary.totalServiceAmount)}</div>
                         <div className="col-sm-4">Total Commission: {currencyFormatter.format(summary.totalCommission)}</div>
                         <div className="col-sm-4">Total Adjustments: {currencyFormatter.format(summary.totalAdjustments)}</div>
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
                         <div key={record.id} className="border rounded p-3 mb-2">
                              <div className="d-flex justify-content-between align-items-start">
                                   <div className="flex-grow-1">
                                        <div className="fw-bold small">{record.test_name}</div>
                                        <div className="text-muted small text-capitalize">{record.serviceCategory}</div>
                                        <div className="mt-1 small">
                                             <div>Service Amount: {currencyFormatter.format(Number(record.service_amount))}</div>
                                             <div>Type: <span className="badge bg-info">{record.commission_type}</span></div>
                                             <div>Commission: {currencyFormatter.format(Number(record.final_commission))}</div>
                                             <div>Status: <span className="badge bg-warning">{record.status}</span></div>
                                        </div>
                                   </div>
                                   <Button variant="outline-primary" size="sm" onClick={() => openUpdateModal(record)}>
                                        <RiEditLine size={16} />
                                   </Button>
                              </div>
                         </div>
                    ))}
               </div>

               <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Update Commission</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedRecord && (
                              <div className="small">
                                   <p>
                                        <strong>Service:</strong> {selectedRecord.test_name}
                                   </p>
                                   <p>
                                        <strong>Type:</strong> <span className="badge bg-info">{selectedRecord.commission_type}</span>
                                   </p>
                                   <p>
                                        <strong>Service Amount:</strong> {currencyFormatter.format(Number(selectedRecord.service_amount))}
                                   </p>
                                   <p>
                                        <strong>Current Commission:</strong> {currencyFormatter.format(Number(selectedRecord.final_commission))}
                                   </p>
                                   <Form.Group className="mb-3">
                                        <Form.Label>New Commission Amount</Form.Label>
                                        <Form.Control
                                             type="number"
                                             value={newRate}
                                             onChange={(e) => setNewRate(e.target.value)}
                                             min="0"
                                             step="0.01"
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
                              {updating ? 'Updating...' : 'Update Commission'}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
