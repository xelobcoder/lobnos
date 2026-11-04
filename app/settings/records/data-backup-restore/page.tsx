'use client';
import {errorMessage} from '../../../../lib/errorMessage';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { RiShieldCheckLine, RiAddLine, RiDatabaseLine, RiRefreshLine } from '@remixicon/react';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { BackupDownloadError, requestBackupDownload } from '../../../../lib/backupDownload';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';
import { roleAllowed } from '../../../../components/Auth/roles';
import styles from '../../../../components/settings/backup/BackupWorkspace.module.css';
import themeContrast from '../../../../styles/theme-contrast.module.css';

import {
     BackupStatsCards,
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
     encryption_key_id?: string | null;
     is_full_backup: boolean;
     backup_size_bytes: number;
     backup_type: string;
     backup_mode: 'automated' | 'manual';
     backup_date: string;
     backup_path?: string;
     file_available?: boolean;
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
     const { applicationsettings } = useApplicationSettings();
     const user = applicationsettings?.user;
     const canManageBackups = roleAllowed(user?.role, ['admin']);
     const employeeid = user?.employeeid;

     // New backup scheduling states
     const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
     const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
     const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);
     const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([]);
     const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
     const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
     const [loading, setLoading] = useState(false);
     const [refreshing, setRefreshing] = useState(false);
     const [loadError, setLoadError] = useState('');
     const [downloading, setDownloading] = useState(false);
     const downloadInFlight = useRef(false);
     const schedulePage = useRef({ count: 50, page: 1, sortby: '' });
     const historyPage = useRef({ count: 50, page: 1, sortby: '' });

     const [executingSchedules, setExecutingSchedules] = useState<Set<number>>(new Set());

     // Decrypt modal states
     const [showDecryptModal, setShowDecryptModal] = useState(false);
     const [backupToDownload, setBackupToDownload] = useState<BackupLog | null>(null);
     const [downloadError, setDownloadError] = useState('');

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
          if (canManageBackups) void refreshBackupData();
     }, [canManageBackups]);

     const loadBackupSchedules = async (count: number = schedulePage.current.count, page: number = schedulePage.current.page, sortby: string = schedulePage.current.sortby) => {
          schedulePage.current = { count, page, sortby };
          try {
               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    ...(sortby && { sortby })
               });
               const response = await customFetch(`${API_BASE}/schedules?${queryParams}`);
               if (response.status === true || response.status === 'success') {
                    if (!Array.isArray(response.data)) return { result: [], error: true };
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

     const loadBackupLogs = async (count: number = historyPage.current.count, page: number = historyPage.current.page, sortby: string = historyPage.current.sortby) => {
          historyPage.current = { count, page, sortby };
          try {
               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    ...(sortby && { sortby })
               });
               const response = await customFetch(`${API_BASE}/logs?${queryParams}`);
               if (response.status === true || response.status === 'success') {
                    if (!Array.isArray(response.data)) return { result: [], error: true };
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
               const response = await customFetch(`${API_BASE}/stats`);
               if (response.status === true || response.status === 'success') {
                    if (!response.data || typeof response.data !== 'object') return { error: true };
                    setBackupStats(response.data);
                    return { error: false };
               }
          } catch (error) {
               console.error('Failed to load backup stats:', error);
               toast.error('Failed to load backup statistics');
          }
          return { error: true };
     };

     const refreshBackupData = async () => {
          setRefreshing(true);
          setLoadError('');
          try {
               const results = await Promise.all([loadBackupSchedules(), loadBackupLogs(), loadBackupStats()]);
               if (results.some(result => result.error)) setLoadError('Some backup information could not be loaded. Refresh to retry.');
          } finally {
               setRefreshing(false);
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
               if (response.status === true || response.status === 'success') {
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
               if (response.status === true || response.status === 'success') {
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
               if (response.status === true || response.status === 'success') {
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
               if (response.status === true || response.status === 'success') {
                    toast.success('Backup completed successfully');
                    await refreshBackupData();
                    setExecutingSchedules(prev => { const next = new Set(prev); next.delete(scheduleId); return next; });
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
               is_active: Number(schedule.is_active) === 1
          });
          setShowEditScheduleModal(true);
     };

     const handleDownloadFromLog = (backupLog: BackupLog) => {
          if (backupLog.file_available === false) {
               toast.error('This backup file is no longer available on the server. Restore the original file or create a new backup.');
               return;
          }
          setDownloadError('');
          setBackupToDownload(backupLog);
          setShowDecryptModal(true);
     };

     const performDownload = async (decrypt: boolean = false) => {
          if (!backupToDownload || downloadInFlight.current) return;
          downloadInFlight.current = true;
          setDownloading(true);
          setDownloadError('');

          try {
               const response = await requestBackupDownload(backupToDownload.id, decrypt);

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
               link.download = filename || `backup-${backupToDownload.id}`;
               link.style.display = 'none';

               document.body.appendChild(link);
               link.click();

               window.URL.revokeObjectURL(downloadUrl);
               document.body.removeChild(link);

               toast.success(`Download completed for backup: ${backupToDownload.backup_name}`);
               setShowDecryptModal(false);
               setBackupToDownload(null);
          } catch (error) {
               const message = errorMessage(error);
               setDownloadError(message);
               if (error instanceof BackupDownloadError && error.code === 'BACKUP_FILE_NOT_FOUND') {
                    setBackupLogs(logs => logs.map(log => log.id === backupToDownload.id ? { ...log, file_available: false } : log));
                    setBackupToDownload(current => current ? { ...current, file_available: false } : current);
                    console.warn('Backup file unavailable:', message);
               } else {
                    console.error('Download backup error:', error);
               }
               toast.error(message);
          } finally {
               downloadInFlight.current = false;
               setDownloading(false);
          }
     };

     const handleDeleteFromLog = async (backupLog: BackupLog) => {
          if (!confirm(`Are you sure you want to delete the backup "${backupLog.backup_name}"? This action cannot be undone.`)) return;

          try {
               const response = await customPost(`security-features/backup/${backupLog.id}`, 'DELETE', {});
               if (response.status === true || response.status === 'success') {
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

     if (!canManageBackups) return <section className={styles.workspace}>
          <div className={styles.panel}><div className={styles.empty}><RiShieldCheckLine size={30} aria-hidden="true" />
               <h1 className="h5">Administrator access required</h1><p>Backup administration is available to authorized administrators.</p>
          </div></div>
     </section>;

     return (
          <div className={`${styles.workspace} ${themeContrast.controls}`}>
               <header className={styles.header}>
                    <div className={styles.heading}>
                         <span className={styles.icon}><RiDatabaseLine size={23} aria-hidden="true" /></span>
                         <div><span className={styles.eyebrow}>Records / Data protection</span>
                              <h1>Data backup &amp; restore</h1>
                              <p>Schedule backups, inspect results and download files for recovery.</p>
                         </div>
                    </div>
                    <div className={styles.actions}>
                         <button type="button" className={styles.secondary} disabled={refreshing} onClick={() => void refreshBackupData()}>
                              <RiRefreshLine size={17} aria-hidden="true" />{refreshing ? 'Refreshing…' : 'Refresh'}
                         </button>
                         <Link className={styles.secondary} href="/settings/records/backup-security"><RiShieldCheckLine size={17} aria-hidden="true" />Security settings</Link>
                         <button type="button" className={styles.primary} disabled={loading} onClick={() => setShowCreateScheduleModal(true)}><RiAddLine size={18} aria-hidden="true" />New schedule</button>
                    </div>
               </header>
               {loadError && <Alert variant="warning" role="alert">{loadError}</Alert>}
               {downloadError && !showDecryptModal && <Alert variant="danger" dismissible onClose={() => setDownloadError('')} role="alert">{downloadError}</Alert>}
               <BackupStatsCards backupStats={backupStats} />
               <div className={styles.notice}><RiShieldCheckLine size={19} aria-hidden="true" /><span>Review encryption and storage in Security settings. Download an available backup when preparing a recovery.</span></div>
               <BackupSchedulesTable backupSchedules={backupSchedules} onExecuteSchedule={handleExecuteSchedule}
                    onEditSchedule={openEditModal} onDeleteSchedule={handleDeleteSchedule}
                    onServerFilter={handleSchedulesServerFilter} executingSchedules={executingSchedules} loading={refreshing} />
               <BackupLogsTable backupLogs={backupLogs} onDownloadBackup={handleDownloadFromLog}
                    onDeleteBackup={handleDeleteFromLog} onServerFilter={handleLogsServerFilter} loading={refreshing} />

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

               <Modal show={showDecryptModal} onHide={() => { if (!downloading) { setShowDecryptModal(false); setBackupToDownload(null); } }} centered
                    className={styles.modal} backdrop={downloading ? 'static' : true} keyboard={!downloading}>
                    <Modal.Header closeButton={!downloading}><Modal.Title>Download backup</Modal.Title></Modal.Header>
                    <Modal.Body>
                         <p className={styles.fileName}>{backupToDownload?.backup_name}</p>
                         {downloadError && <Alert variant="danger" role="alert">{downloadError}</Alert>}
                         {backupToDownload?.encryption_key_id || backupToDownload?.backup_path?.endsWith('.encrypted') ?
                              <p>Choose the encrypted file for secure storage, or a decrypted copy for recovery. A decrypted copy contains readable records and needs secure storage.</p> :
                              <p>Download this available backup file for your recovery process.</p>}
                         {downloading && <div role="status"><Spinner as="span" size="sm" className="me-2" />Preparing your download…</div>}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="outline-secondary" disabled={downloading} onClick={() => { setShowDecryptModal(false); setBackupToDownload(null); }}>Cancel</Button>
                         {(backupToDownload?.encryption_key_id || backupToDownload?.backup_path?.endsWith('.encrypted')) &&
                              <Button variant="outline-primary" disabled={downloading || backupToDownload?.file_available === false} onClick={() => void performDownload(true)}>Download decrypted copy</Button>}
                         <Button variant="primary" disabled={downloading || backupToDownload?.file_available === false} onClick={() => void performDownload(false)}>
                              {backupToDownload?.encryption_key_id || backupToDownload?.backup_path?.endsWith('.encrypted') ? 'Download encrypted' : 'Download file'}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}