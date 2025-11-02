'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Modal, Alert, Card, ProgressBar } from 'react-bootstrap';
import { RiTimeLine, RiShieldCheckLine, RiSettings4Line, RiSaveLine, RiPlayLine, RiDatabaseLine, RiServerLine, RiCloseLine, RiPauseLine } from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import Link from 'next/link';

interface RestorePoint {
     id: string;
     name: string;
     createdAt: string;
     size: string;
     status: string;
     type: string;
}

export default function DataBackupRestorePage() {
     const [showScheduleModal, setShowScheduleModal] = useState(false);
     const [showStorageModal, setShowStorageModal] = useState(false);
     const [backupFrequency, setBackupFrequency] = useState('daily');
     const [backupTime, setBackupTime] = useState('02:00');
     const [retentionDays, setRetentionDays] = useState(30);
     const [storageType, setStorageType] = useState('local');
     const [storagePath, setStoragePath] = useState('/backups');
     const [cloudProvider, setCloudProvider] = useState('aws');
     const [bucketName, setBucketName] = useState('');

     // Backup progress state
     const [isBackupRunning, setIsBackupRunning] = useState(false);
     const [backupProgress, setBackupProgress] = useState(0);
     const [backupStatus, setBackupStatus] = useState('');
     const [estimatedTime, setEstimatedTime] = useState('');
     const [currentOperation, setCurrentOperation] = useState('');

     const restorePoints: RestorePoint[] = [
          {
               id: 'bk-001',
               name: 'Daily Backup - 2025-11-02',
               createdAt: '2025-11-02T02:00:00Z',
               size: '2.4 GB',
               status: 'completed',
               type: 'automated'
          },
          {
               id: 'bk-002',
               name: 'Manual Backup - Pre-Update',
               createdAt: '2025-11-01T14:30:00Z',
               size: '2.2 GB',
               status: 'completed',
               type: 'manual'
          },
          {
               id: 'bk-003',
               name: 'Weekly Backup - 2025-10-26',
               createdAt: '2025-10-26T02:00:00Z',
               size: '2.1 GB',
               status: 'completed',
               type: 'automated'
          },
          {
               id: 'bk-004',
               name: 'Emergency Backup',
               createdAt: '2025-10-25T10:15:00Z',
               size: '2.3 GB',
               status: 'failed',
               type: 'manual'
          }
     ];

     const columns = [
          {
               Header: 'Backup Name',
               accessor: 'name',
               Cell: ({ row }) => <span className="fw-semibold">{row.original.name}</span>
          },
          {
               Header: 'Created At',
               accessor: 'createdAt',
               Cell: ({ row }) => <small>{new Date(row.original.createdAt).toLocaleString()}</small>
          },
          {
               Header: 'Size',
               accessor: 'size',
               Cell: ({ row }) => <span>{row.original.size}</span>
          },
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ row }) => <span>{row.original.type}</span>
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ row }) => <span>{row.original.status}</span>
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleRestore(row.original.id)}
                              disabled={row.original.status !== 'completed'}
                         >
                              Restore
                         </Button>
                         <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleDownload(row.original.id)}
                              disabled={row.original.status !== 'completed'}
                         >
                              Download
                         </Button>
                    </div>
               )
          }
     ];

     const handleManualBackup = () => {
          if (isBackupRunning) return; // Prevent multiple backups

          setIsBackupRunning(true);
          setBackupProgress(0);
          setBackupStatus('Starting backup...');
          setCurrentOperation('Initializing backup process');
          setEstimatedTime('Calculating...');

          // Simulate backup process with different stages
          const backupStages = [
               { progress: 5, status: 'Connecting to database...', operation: 'Database connection', time: '2 min' },
               { progress: 15, status: 'Analyzing data...', operation: 'Data analysis', time: '1 min 45 sec' },
               { progress: 30, status: 'Backing up patient records...', operation: 'Patient data backup', time: '1 min 30 sec' },
               { progress: 45, status: 'Backing up test results...', operation: 'Test results backup', time: '1 min 15 sec' },
               { progress: 60, status: 'Backing up configurations...', operation: 'Configuration backup', time: '1 min' },
               { progress: 75, status: 'Compressing files...', operation: 'File compression', time: '45 sec' },
               { progress: 90, status: 'Verifying integrity...', operation: 'Integrity check', time: '30 sec' },
               { progress: 100, status: 'Backup completed successfully!', operation: 'Backup complete', time: '0 sec' }
          ];

          let stageIndex = 0;

          const runStage = () => {
               if (stageIndex >= backupStages.length) {
                    setIsBackupRunning(false);
                    setTimeout(() => {
                         setBackupStatus('');
                         setCurrentOperation('');
                         setEstimatedTime('');
                         setBackupProgress(0);
                    }, 3000); // Clear status after 3 seconds
                    return;
               }

               const stage = backupStages[stageIndex];
               setBackupProgress(stage.progress);
               setBackupStatus(stage.status);
               setCurrentOperation(stage.operation);
               setEstimatedTime(stage.time);

               stageIndex++;

               // Random delay between 1-3 seconds for each stage
               const delay = Math.random() * 2000 + 1000;
               setTimeout(runStage, delay);
          };

          runStage();
     };

     const handleCancelBackup = () => {
          setIsBackupRunning(false);
          setBackupProgress(0);
          setBackupStatus('Backup cancelled by user');
          setCurrentOperation('Operation cancelled');
          setEstimatedTime('');

          setTimeout(() => {
               setBackupStatus('');
               setCurrentOperation('');
          }, 3000);
     };

     const handleRestore = (backupId: string) => {
          console.log('Restoring from backup:', backupId);
          // In a real app, this would initiate restore process
     };

     const handleDownload = (backupId: string) => {
          console.log('Downloading backup:', backupId);
          // In a real app, this would download the backup file
     };

     const handleSaveSchedule = () => {
          console.log('Saving backup schedule:', { backupFrequency, backupTime, retentionDays });
          setShowScheduleModal(false);
     };

     const handleSaveStorage = () => {
          console.log('Saving storage config:', { storageType, storagePath, cloudProvider, bucketName });
          setShowStorageModal(false);
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h2 className="mb-1">Data Backup & Restore</h2>
                         <p className="text-muted mb-0">Manage automated backups and restore points for data protection</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" size="sm" onClick={() => setShowScheduleModal(true)}>
                              <RiSettings4Line size={16} className="me-2" />
                              Schedule Settings
                         </Button>
                         <Button
                              variant="outline-success"
                              size="sm"
                              onClick={handleManualBackup}
                              disabled={isBackupRunning}
                         >
                              {isBackupRunning ? (
                                   <>
                                        <RiPauseLine size={16} className="me-2" />
                                        Backup Running...
                                   </>
                              ) : (
                                   <>
                                        <RiPlayLine size={16} className="me-2" />
                                        Manual Backup
                                   </>
                              )}
                         </Button>
                         <Link href="/settings/records/backup-security">
                              <Button variant="outline-warning" size="sm">
                                   <RiShieldCheckLine size={16} className="me-2" />
                                   Security Settings
                              </Button>
                         </Link>
                    </div>
               </div>

               {/* Backup Progress Section */}
               {isBackupRunning && (
                    <div className="border bg-white border-secondary-subtle mx-2 p-3 mb-4">
                         <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center gap-2">
                                   <RiDatabaseLine size={20} className="text-primary" />
                                   <h5 className="mb-0">Backup in Progress</h5>
                              </div>
                              <Button
                                   variant="outline-danger"
                                   size="sm"
                                   onClick={handleCancelBackup}
                                   className="d-flex align-items-center gap-1"
                              >
                                   <RiCloseLine size={14} />
                                   Cancel Backup
                              </Button>
                         </div>

                         <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                   <span className="fw-semibold">{currentOperation}</span>
                                   <small className="text-muted">{backupProgress}% complete</small>
                              </div>
                              <ProgressBar
                                   now={backupProgress}
                                   variant={backupProgress < 100 ? "primary" : "success"}
                                   animated={backupProgress < 100}
                                   className="mb-2"
                              />
                              <div className="d-flex justify-content-between align-items-center">
                                   <small className="text-muted">{backupStatus}</small>
                                   <small className="text-muted">
                                        {estimatedTime && `Estimated time: ${estimatedTime}`}
                                   </small>
                              </div>
                         </div>
                    </div>
               )}

               <Alert variant="info" className="mb-4">
                    <div className="d-flex align-items-start gap-3">
                         <RiShieldCheckLine size={20} className="text-info mt-1" />
                         <div>
                              <strong>Data Protection:</strong> Regular backups ensure business continuity and data recovery. Configure automated schedules and monitor backup status to maintain compliance and minimize data loss risks.
                         </div>
                    </div>
               </Alert>

               <Row className="g-4">
                    <Col lg={12}>
                         <div className="border bg-white border-secondary-subtle mx-2 p-2 mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <div className="d-flex align-items-center gap-2">
                                        <RiDatabaseLine size={20} />
                                        <h5 className="mb-0">Backup Overview</h5>
                                   </div>
                                   <Button variant="outline-secondary" size="sm" onClick={() => setShowStorageModal(true)}>
                                        <RiServerLine size={16} className="me-2" />
                                        Storage Config
                                   </Button>
                              </div>
                              <Row className="g-3">
                                   <Col md={3}>
                                        <Card className="text-center">
                                             <Card.Body>
                                                  <div className="h3 text-success mb-1">24</div>
                                                  <small className="text-muted">Successful Backups</small>
                                             </Card.Body>
                                        </Card>
                                   </Col>
                                   <Col md={3}>
                                        <Card className="text-center">
                                             <Card.Body>
                                                  <div className="h3 text-warning mb-1">2</div>
                                                  <small className="text-muted">Failed Backups</small>
                                             </Card.Body>
                                        </Card>
                                   </Col>
                                   <Col md={3}>
                                        <Card className="text-center">
                                             <Card.Body>
                                                  <div className="h3 text-info mb-1">2.4 GB</div>
                                                  <small className="text-muted">Latest Backup Size</small>
                                             </Card.Body>
                                        </Card>
                                   </Col>
                                   <Col md={3}>
                                        <Card className="text-center">
                                             <Card.Body>
                                                  <div className="h3 text-primary mb-1">98.5%</div>
                                                  <small className="text-muted">Success Rate</small>
                                             </Card.Body>
                                        </Card>
                                   </Col>
                              </Row>
                         </div>

                         <div className="border bg-white border-secondary-subtle mx-2 p-2">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiTimeLine size={20} />
                                   <h5 className="mb-0">Restore Points</h5>
                              </div>
                              <PrimeTable column={columns} data={restorePoints} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={() => { }} />
                         </div>
                    </Col>
               </Row>

               {/* Schedule Settings Modal */}
               <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Backup Schedule Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Backup Frequency</Form.Label>
                                   <Form.Select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                   </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Backup Time</Form.Label>
                                   <Form.Control
                                        type="time"
                                        value={backupTime}
                                        onChange={(e) => setBackupTime(e.target.value)}
                                   />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Retention Period (Days)</Form.Label>
                                   <Form.Control
                                        type="number"
                                        value={retentionDays}
                                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                                        min="1"
                                        max="365"
                                   />
                                   <Form.Text className="text-muted">
                                        Backups older than this period will be automatically deleted
                                   </Form.Text>
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" size="sm" onClick={() => setShowScheduleModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" size="sm" onClick={handleSaveSchedule}>
                              <RiSaveLine size={14} className="me-1" />
                              Save Schedule
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Storage Configuration Modal */}
               <Modal show={showStorageModal} onHide={() => setShowStorageModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Backup Storage Configuration</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Storage Type</Form.Label>
                                   <Form.Select value={storageType} onChange={(e) => setStorageType(e.target.value)}>
                                        <option value="local">Local Storage</option>
                                        <option value="network">Network Drive</option>
                                        <option value="cloud">Cloud Storage</option>
                                   </Form.Select>
                              </Form.Group>

                              {(storageType === 'local' || storageType === 'network') && (
                                   <Form.Group className="mb-3">
                                        <Form.Label>Storage Path</Form.Label>
                                        <Form.Control
                                             type="text"
                                             value={storagePath}
                                             onChange={(e) => setStoragePath(e.target.value)}
                                             placeholder="/path/to/backups"
                                        />
                                   </Form.Group>
                              )}

                              {storageType === 'cloud' && (
                                   <>
                                        <Form.Group className="mb-3">
                                             <Form.Label>Cloud Provider</Form.Label>
                                             <Form.Select value={cloudProvider} onChange={(e) => setCloudProvider(e.target.value)}>
                                                  <option value="aws">Amazon S3</option>
                                                  <option value="azure">Azure Blob Storage</option>
                                                  <option value="gcp">Google Cloud Storage</option>
                                             </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                             <Form.Label>Bucket/Container Name</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={bucketName}
                                                  onChange={(e) => setBucketName(e.target.value)}
                                                  placeholder="my-backup-bucket"
                                             />
                                        </Form.Group>
                                   </>
                              )}
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" size="sm" onClick={() => setShowStorageModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" size="sm" onClick={handleSaveStorage}>
                              <RiSaveLine size={14} className="me-1" />
                              Save Configuration
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}