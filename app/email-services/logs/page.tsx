'use client';

import React, { useEffect, useState } from 'react';
import ui from "../../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
import { Badge, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
import { RiEyeLine, RiRefreshLine, RiTimeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../components/accessories/PrimeToast';
import styles from '../email-standard.module.css';
import EmailPageHero from '../_components/EmailPageHero';
import { EmailLog, callGet, parseList, statusBadge } from '../_lib';

export default function EmailLogsPage() {
     const [loading, setLoading] = useState(false);
     const [logs, setLogs] = useState<EmailLog[]>([]);
     const [logsLimit, setLogsLimit] = useState(100);
     const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

     const loadLogs = async () => {
          setLoading(true);
          try {
               const response = await callGet(`email/logs?limit=${logsLimit}`);
               setLogs(parseList<EmailLog>(response));
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load logs');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadLogs();
     }, [logsLimit]);

     const logColumns = [
          { Header: 'Log ID', accessor: 'id' },
          { Header: 'Queue ID', accessor: 'queue_id' },
          { Header: 'Status', accessor: 'status', Cell: ({ row }: any) => <Badge bg={statusBadge(row.original.status)}>{row.original.status || 'unknown'}</Badge> },
          { Header: 'Subject', accessor: 'subject' },
          { Header: 'Provider ID', accessor: 'provider_id' },
          { Header: 'Failure Reason', accessor: 'failure_reason', Cell: ({ row }: any) => row.original.failure_reason || '-' },
          { Header: 'Duration (ms)', accessor: 'duration_ms', Cell: ({ row }: any) => row.original.duration_ms || '-' },
          { Header: 'Created At', accessor: 'created_at', Cell: ({ row }: any) => row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '-' },
          { Header: 'Actions', accessor: 'logActions', Cell: ({ row }: any) => <Button size="sm" variant="outline-secondary" onClick={() => setSelectedLog(row.original)}><RiEyeLine size={14} className="me-1"/>View log</Button> },
     ];

     return (
          <div className={`${ui.workspace} ${styles.pageRoot}`}>
               <PrimeToast /><EmailPageHero title="Email delivery logs" subtitle="Review delivery outcomes and inspect details for each message." icon={<RiTimeLine size={24}/>} />
               <Card className={styles.surfaceCard}>
                    <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <h2 className={styles.surfaceTitle}>Delivery history</h2>
                         <div className="d-flex gap-2 align-items-center">
                              <Form.Select aria-label="Log result limit" style={{ width: 120 }} value={logsLimit} onChange={(e) => setLogsLimit(Number(e.target.value))}>{[50, 100, 200].map((opt) => <option key={opt} value={opt}>{opt}</option>)}</Form.Select>
                              <Button size="sm" variant="outline-secondary" onClick={() => loadLogs()}><RiRefreshLine size={14} className="me-1"/>Refresh logs</Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loading ? <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading logs...</div> : <PrimeTable column={logColumns} data={logs} filtering={true} handleSeverSideProcessing={() => { }} />}
                    </Card.Body>
               </Card>

               <Modal className={styles.dialog} show={Boolean(selectedLog)} onHide={() => setSelectedLog(null)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="d-flex align-items-center gap-2"><RiTimeLine size={18} /> Log Details #{selectedLog?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedLog ? (
                              <div className="d-flex flex-column gap-2">
                                   <div><strong>Status:</strong> <Badge bg={statusBadge(selectedLog.status)}>{selectedLog.status || 'unknown'}</Badge></div>
                                   <div><strong>Subject:</strong> {selectedLog.subject || '-'}</div>
                                   <div><strong>Failure Reason:</strong> {selectedLog.failure_reason || '-'}</div>
                                   <div><strong>Recipients JSON:</strong></div>
                                   <pre className="bg-body-tertiary border rounded p-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedLog.recipients_json || '[]'}</pre>
                                   <div><strong>Response Payload JSON:</strong></div>
                                   <pre className="bg-body-tertiary border rounded p-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedLog.response_payload_json || '{}'}</pre>
                              </div>
                         ) : null}
                    </Modal.Body>
               </Modal>
          </div>
     );
}
