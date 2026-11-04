'use client';
import {errorMessage} from '../../../../lib/errorMessage';

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Alert, Modal } from 'react-bootstrap';
import { RiShieldCheckLine, RiAddLine, RiDatabaseLine } from '@remixicon/react';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { buildApiUrl } from '../../../../lib/apiBaseUrl';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

import {
     BackupStatsCards,
     BackupProgressSection,
     BackupSchedulesTable,
     BackupLogsTable,
     BackupScheduleModal
} from '../../../../components/settings/backup';

const API_BASE = 'security-features/backup';

interface BackupSchedule {
     id: number;
     schedule_name: string;
     frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
     backup_time: string;
     retention_days: number;
     employeeid: number;
     backup_type: 'database' | 'files' | 'full_system';
     is_active: boolean;
     last_run?: string;
     created_at: string;
     updated_at: string;
     username: string;
     email: string;
}

interface BackupLog {
     id: number;
     backup_name: string;
     is_successful: boolean;
     is_full_backup: boolean;
     backup_size_bytes: number;
     backup_type: string;
     backup_mode: 'automated' | 'manual';
     backup_date: string;
     backup_path?: string;
     error_message?: string;
     duration_seconds: number;
     created_by: string;
     created_at: string;
     updated_at: string;
}

interface BackupStats {
     total_backups: number;
     successful_backups: number;
     failed_backups: number;
     total_size: number;
     last_backup_date: string;
}

const FREQUENCY_OPTIONS = [
     { value: 'hourly', label: 'Hourly' },
     { value: 'daily', label: 'Daily' },
     { value: 'weekly', label: 'Weekly' },
     { value: 'monthly', label: 'Monthly' }
];

const BACKUP_TYPE_OPTIONS = [
     { value: 'database', label: 'Database Only' },
     { value: 'files', label: 'Files Only' },
     { value: 'full_system', label: 'Full System' }
];

export default function DataBackupRestorePage() {
     const { user } = useApplicationSettings().applicationsettings;
     const employeeid = user?.employeeid;

     // New backup scheduling states
     const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
     const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
     const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);
     const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([]);
     const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
     const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
     const [loading, setLoading] = useState(false);

     const [executingSchedules, setExecutingSchedules] = useState<Set<number>>(new Set());

     // Decrypt modal states
     const [showDecryptModal, setShowDecryptModal] = useState(false);
     const [backupToDownload, setBackupToDownload] = useState<BackupLog | null>(null);

     // Form states for schedule creation/editing
     const [scheduleForm, setScheduleForm] = useState({
          schedule_name: '',
          frequency: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
          backup_time: '02:00',
          retention_days: 30,
          backup_type: 'database' as 'database' | 'files' | 'full_system',
          is_active: true
     });

     useEffect(() => {
          Promise.all([
               loadBackupSchedules(),
               loadBackupLogs(),
               loadBackupStats()
          ]).catch((error) => {
               console.error('Error loading backup data:', error);
          });
     }, []);

     const loadBackupSchedules = async (count: number = 50, page: number = 1, sortby: string = '') => {
          try {
               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    ...(sortby && { sortby })
               });
               const response = await customFetch(`${API_BASE}/schedules?${queryParams}`);
               if (response.status) {
                    setBackupSchedules(response.data);
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Failed to load backup schedules:', error);
               toast.error('Failed to load backup schedules');
               return { result: [], error: true };
          }
     };

     const loadBackupLogs = async (count: number = 50, page: number = 1, sortby: string = '') => {
          try {
               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    ...(sortby && { sortby })
               });
               const response = await customFetch(`${API_BASE}/logs?${queryParams}`);
               if (response.status) {
                    setBackupLogs(response.data);
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Failed to load backup logs:', error);
               toast.error('Failed to load backup logs');
               return { result: [], error: true };
          }
     };

     const loadBackupStats = async () => {
          try {
               const response = await customFetch(`${API_BASE}/stats?tenantId=1`);
               if (response.status) {
                    setBackupStats(response.data);
               }
          } catch (error) {
               console.error('Failed to load backup stats:', error);
               toast.error('Failed to load backup statistics');
          }
     };

     const validateForm = (form: any) => {
          const errors: string[] = [];

          if (!form.schedule_name || form.schedule_name.trim() === '') {
               errors.push('Schedule name is required');
          } else if (form.schedule_name.length > 255) {
               errors.push('Schedule name must be at most 255 characters');
          }

          if (!form.frequency || !['hourly', 'daily', 'weekly', 'monthly'].includes(form.frequency)) {
               errors.push('Frequency must be one of: hourly, daily, weekly, monthly');
          }

          if (!form.backup_time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.backup_time)) {
               errors.push('Time must be in HH:MM format (24-hour)');
          }

          const retentionDays = Number(form.retention_days);
          if (!form.retention_days || isNaN(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
               errors.push('Retention days must be between 1 and 3650');
          }

          if (!form.backup_type || !['database', 'files', 'full_system'].includes(form.backup_type)) {
               errors.push('Backup type must be one of: database, files, full_system');
          }

          return errors;
     };

     const handleCreateSchedule = async () => {
          const errors = validateForm(scheduleForm);
          if (errors.length > 0) {
               toast.error(errors.join(', '));
               return;
          }

          setLoading(true);
          try {
               const payload = {
                    schedule_name: scheduleForm.schedule_name,
                    frequency: scheduleForm.frequency,
                    backup_time: scheduleForm.backup_time,
                    retention_days: scheduleForm.retention_days,
                    backup_type: scheduleForm.backup_type,
                    is_active: scheduleForm.is_active ? true : false,
                    employeeid: employeeid
               };

               const response = await customPost(`${API_BASE}/schedules`, 'POST', payload);
               if (response.status) {
                    toast.success('Backup schedule created successfully');
                    setShowCreateScheduleModal(false);
                    resetScheduleForm();
                    loadBackupSchedules();
               } else {
                    toast.error(response.error || 'Failed to create schedule');
               }
          } catch (error) {
               console.error('Create schedule error:', error);
               toast.error('Failed to create backup schedule');
          } finally {
               setLoading(false);
          }
     };

     const handleUpdateSchedule = async () => {
          if (!editingSchedule) return;

          const errors = validateForm(scheduleForm);
          const isActive = !!scheduleForm.is_active;

          if (errors.length > 0) {
               toast.error(errors.join(', '));
               return;
          }

          setLoading(true);
          try {
               const payload = {
                    schedule_name: scheduleForm.schedule_name,
                    frequency: scheduleForm.frequency,
                    backup_time: scheduleForm.backup_time,
                    retention_days: scheduleForm.retention_days,
                    backup_type: scheduleForm.backup_type,
                    is_active: isActive,
                    employeeid: employeeid
               };

               const response = await customPost(`${API_BASE}/schedules/${editingSchedule.id}`, 'PUT', payload);
               if (response.status) {
                    toast.success('Backup schedule updated successfully');
                    setShowEditScheduleModal(false);
                    setEditingSchedule(null);
                    resetScheduleForm();
                    loadBackupSchedules();
               } else {
                    toast.error(response.error || 'Failed to update schedule');
               }
          } catch (error) {
               console.error('Update schedule error:', error);
               toast.error('Failed to update backup schedule');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteSchedule = async (scheduleId: number) => {
          if (!confirm('Are you sure you want to delete this backup schedule?')) return;

          try {
               const response = await customPost(`${API_BASE}/schedules/${scheduleId}`, 'DELETE', {});
               if (response.status) {
                    toast.success('Backup schedule deleted successfully');
                    loadBackupSchedules();
               } else {
                    toast.error(response.error || 'Failed to delete schedule');
               }
          } catch (error) {
               console.error('Delete schedule error:', error);
               toast.error('Failed to delete backup schedule');
          }
     };

     const handleExecuteSchedule = async (scheduleId: number) => {
          if (executingSchedules.has(scheduleId)) {
               return;
          }

          setExecutingSchedules(prev => new Set(prev).add(scheduleId));

          try {
               const response = await customPost(`${API_BASE}/schedules/${scheduleId}/execute`, 'POST', {});
               if (response.status) {
                    toast.success('Backup execution started');
                    loadBackupLogs();

                    setTimeout(() => {
                         setExecutingSchedules(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(scheduleId);
                              return newSet;
                         });
                         toast.success('Backup execution completed');
                    }, 3000);
               } else {
                    toast.error(response.error || 'Failed to execute schedule');
                    setExecutingSchedules(prev => {
                         const newSet = new Set(prev);
                         newSet.delete(scheduleId);
                         return newSet;
                    });
               }
          } catch (error) {
               console.error('Execute schedule error:', error);
               toast.error('Failed to execute backup schedule');
               setExecutingSchedules(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(scheduleId);
                    return newSet;
               });
          }
     };

     const resetScheduleForm = () => {
          setScheduleForm({
               schedule_name: '',
               frequency: 'daily',
               backup_time: '02:00',
               retention_days: 30,
               backup_type: 'database',
               is_active: true
          });
     };

     const openEditModal = (schedule: BackupSchedule) => {
          setEditingSchedule(schedule);
          setScheduleForm({
               schedule_name: schedule.schedule_name,
               frequency: schedule.frequency,
               backup_time: schedule.backup_time,
               retention_days: schedule.retention_days,
               backup_type: schedule.backup_type,
               is_active: !!(schedule as any).is_active
          });
          setShowEditScheduleModal(true);
     };

     const handleDownloadFromLog = (backupLog: BackupLog) => {
          setBackupToDownload(backupLog);
          setShowDecryptModal(true);
     };

     const performDownload = async (decrypt: boolean = false) => {
          if (!backupToDownload) return;

          try {
               const url = new URL(buildApiUrl(`${API_BASE}/logs/${backupToDownload.id}/download`));
               if (process.env.NEXT_PUBLIC_TENANTID) {
                    url.searchParams.append("tenantId", process.env.NEXT_PUBLIC_TENANTID);
               }
               if (decrypt) {
                    url.searchParams.append("decrypt", "true");
               }

               const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                         'cache': 'no-cache,must-revalidate,no-store,max-age=60,s-maxage=0'
                    },
                    cache: 'no-cache',
                    credentials: 'include'
               });

               if (!response.ok) {
                    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
               }

               const blob = await response.blob();
               const downloadUrl = window.URL.createObjectURL(blob);

               const contentDisposition = response.headers.get('content-disposition');
               let filename: string | null = null;
               if (contentDisposition) {
                    const match = contentDisposition.match(/filename="([^"]+)"/);
                    if (match) filename = match[1];
               }

               const link = document.createElement('a');
               link.href = downloadUrl;
               link.download = filename as string;
               link.style.display = 'none';

               document.body.appendChild(link);
               link.click();

               window.URL.revokeObjectURL(downloadUrl);
               document.body.removeChild(link);

               toast.success(`Download completed for backup: ${backupToDownload.backup_name}`);
          } catch (error) {
               console.error('Download backup error:', error);
               toast.error(`Failed to download backup file: ${errorMessage(error)}`);
          } finally {
               setShowDecryptModal(false);
               setBackupToDownload(null);
          }
     };

     const handleDeleteFromLog = async (backupLog: BackupLog) => {
          if (!confirm(`Are you sure you want to delete the backup "${backupLog.backup_name}"? This action cannot be undone.`)) return;

          try {
               const response = await customPost(`security-features/backup/${backupLog.id}?tenantId=1`, 'DELETE', {});
               if (response.status) {
                    toast.success('Backup deleted successfully');
                    loadBackupLogs(); // Refresh logs
               } else {
                    toast.error(response.error || 'Failed to delete backup');
               }
          } catch (error) {
               console.error('Delete backup error:', error);
               toast.error('Failed to delete backup');
          }
     };

     const handleSchedulesServerFilter = async (pagination: { count: number, page: number, sortby: string }) => {
          try {
               return await loadBackupSchedules(pagination.count, pagination.page, pagination.sortby);
          } catch (error) {
               console.error('Error in schedules server filter:', error);
               return { result: [], error: true };
          }
     };

     const handleLogsServerFilter = async (pagination: { count: number, page: number, sortby: string }) => {
          try {
               return await loadBackupLogs(pagination.count, pagination.page, pagination.sortby);
          } catch (error) {
               console.error('Error in logs server filter:', error);
               return { result: [], error: true };
          }
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h4 className="mb-1" style={{ fontSize: '1.5rem' }}>Data Backup & Restore</h4>
                         <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Manage automated backups and restore points for data protection</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-info" size="sm" onClick={() => setShowCreateScheduleModal(true)}>
                              <RiAddLine size={16} className="me-2" />
                              Create Schedule
                         </Button>
                         <Link href="/settings/records/backup-security">
                              <Button variant="outline-warning" size="sm">
                                   <RiShieldCheckLine size={16} className="me-2" />
                                   Security Settings
                              </Button>
                         </Link>
                    </div>
               </div>

               <Alert variant="info" className="mb-4">
                    <div className="d-flex align-items-start gap-3">
                         <RiShieldCheckLine size={20} className="text-info mt-1" />
                         <div style={{ fontSize: '0.875rem' }}>
                              <strong>Data Protection:</strong> Regular backups ensure business continuity and data recovery. Configure automated schedules and monitor backup status to maintain compliance and minimize data loss risks.
                         </div>
                    </div>
               </Alert>

               <Row className="g-4">
                    <Col lg={12}>
                         <div className=" mx-2 p-2 mb-4">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiDatabaseLine size={20} />
                                   <h5 className="mb-0">Backup Overview</h5>
                              </div>
                              <BackupStatsCards backupStats={backupStats} />
                         </div>

                    </Col>
               </Row>

               <Row className="g-4 mt-2">
                    <Col lg={12}>
                         <BackupSchedulesTable
                              backupSchedules={backupSchedules}
                              onExecuteSchedule={handleExecuteSchedule}
                              onEditSchedule={openEditModal}
                              onDeleteSchedule={handleDeleteSchedule}
                              onServerFilter={handleSchedulesServerFilter}
                              executingSchedules={executingSchedules}
                         />

                         <BackupLogsTable
                              backupLogs={backupLogs}
                              onDownloadBackup={handleDownloadFromLog}
                              onDeleteBackup={handleDeleteFromLog}
                              onServerFilter={handleLogsServerFilter}
                         />
                    </Col>
               </Row>

               <BackupScheduleModal
                    show={showCreateScheduleModal}
                    onHide={() => {
                         setShowCreateScheduleModal(false);
                         resetScheduleForm();
                    }}
                    title="Create Backup Schedule"
                    scheduleForm={scheduleForm}
                    setScheduleForm={setScheduleForm}
                    onSubmit={handleCreateSchedule}
                    loading={loading}
               />

               <BackupScheduleModal
                    show={showEditScheduleModal}
                    onHide={() => {
                         setShowEditScheduleModal(false);
                         setEditingSchedule(null);
                         resetScheduleForm();
                    }}
                    title="Edit Backup Schedule"
                    scheduleForm={scheduleForm}
                    setScheduleForm={setScheduleForm}
                    onSubmit={handleUpdateSchedule}
                    loading={loading}
                    isEdit={true}
               />

               {/* Decrypt Modal */}
               <Modal show={showDecryptModal} onHide={() => setShowDecryptModal(false)} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Download Backup</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <p>Would you like to decrypt the backup data before downloading?</p>
                         <div className="alert alert-info">
                              <strong>Note:</strong> Decrypted backups will be in plain text format. Encrypted backups maintain security but require decryption tools to access.
                         </div>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => performDownload(false)}>
                              Download Encrypted
                         </Button>
                         <Button variant="primary" onClick={() => performDownload(true)}>
                              Download Decrypted
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}