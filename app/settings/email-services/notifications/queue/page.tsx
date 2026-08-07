'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Form, Spinner } from 'react-bootstrap';
import { RiRefreshLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../../../components/accessories/PrimeToast';
import { loadQueue, callMutate } from '../_lib';
import { statusBadge } from '../../_lib';

export default function NotificationQueuePage() {
     const [loading, setLoading] = useState(false);
     const [limit, setLimit] = useState(50);
     const [rows, setRows] = useState<any[]>([]);

     const refresh = async () => {
          setLoading(true);
          try {
               setRows(await loadQueue(limit));
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load notification queue');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          refresh();
     }, [limit]);

     const retryQueueRow = async (row: any) => {
          try {
               await callMutate(`notifications/queue/${row.id}/retry`, 'POST', {});
               toast.success(`Queue #${row.id} retried`);
               await refresh();
          } catch (err: any) {
               toast.error(err?.message || 'Retry failed');
          }
     };

     const cancelQueueRow = async (row: any) => {
          try {
               await callMutate(`notifications/queue/${row.id}/cancel`, 'POST', {});
               toast.success(`Queue #${row.id} cancelled`);
               await refresh();
          } catch (err: any) {
               toast.error(err?.message || 'Cancel failed');
          }
     };

     const columns = [
          { Header: 'Queue ID', accessor: 'id' },
          { Header: 'Event', accessor: 'event_code' },
          { Header: 'Status', accessor: 'status', Cell: ({ row }: any) => <Badge bg={statusBadge(row.original.status)}>{row.original.status || 'unknown'}</Badge> },
          { Header: 'Priority', accessor: 'priority', Cell: ({ row }: any) => <span className="text-capitalize">{row.original.priority || '-'}</span> },
          { Header: 'Updated', accessor: 'updated_at', Cell: ({ row }: any) => row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : '-' },
          {
               Header: 'Actions',
               accessor: 'queueActions',
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1 flex-wrap">
                         <Button size="sm" variant="outline-warning" onClick={() => retryQueueRow(row.original)}>Retry</Button>
                         <Button size="sm" variant="outline-danger" onClick={() => cancelQueueRow(row.original)}>Cancel</Button>
                    </div>
               ),
          },
     ];

     return (
          <div className="container-fluid px-3 py-3">
               <PrimeToast />
               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex align-items-center justify-content-between gap-2 flex-wrap">
                         <strong>Notification Queue</strong>
                         <div className="d-flex align-items-center gap-2">
                              <Form.Select size="sm" style={{ width: 120 }} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                                   {[20, 50, 100].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </Form.Select>
                              <Button size="sm" variant="outline-secondary" onClick={refresh}><RiRefreshLine size={14} /></Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loading ? <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading queue...</div> : <PrimeTable column={columns} data={rows} filtering={true} handleSeverSideProcessing={() => { }} />}
                    </Card.Body>
               </Card>
          </div>
     );
}
