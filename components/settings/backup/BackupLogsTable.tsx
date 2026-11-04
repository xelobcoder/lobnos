import styles from './BackupWorkspace.module.css';
import React from 'react';
import { Button } from 'react-bootstrap';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { RiDatabaseLine, RiDownloadLine, RiRefreshLine, RiDeleteBinLine } from '@remixicon/react';

interface BackupLog {
     id: number;
     backup_name: string;
     is_successful: boolean;
     encryption_key_id?: string | null;
     file_available?: boolean;
     is_full_backup: boolean;
     backup_size_bytes: number;
     backup_type: string;
     backup_mode: 'automated' | 'manual';
     backup_date: string;
     error_message?: string;
     duration_seconds: number;
     created_by: string;
     created_at: string;
     updated_at: string;
}

interface BackupLogsTableProps {
     backupLogs: BackupLog[];
     onDownloadBackup?: (backupLog: BackupLog) => void;
     onDeleteBackup?: (backupLog: BackupLog) => void;
     onServerFilter?: (pagination: { count: number, page: number, sortby: string }) => Promise<{ result: any; error: boolean }>;
     loading?: boolean;
}

export default function BackupLogsTable({ backupLogs, onDownloadBackup, onDeleteBackup, onServerFilter, loading = false }: BackupLogsTableProps) {
     const columns = [
          {
               Header: 'Backup Name',
               accessor: 'backup_name',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => <span className="fw-semibold">{row.original.backup_name}<small className={styles.detail}>{row.original.encryption_key_id ? "Encrypted backup" : "Encryption not recorded"}</small>{Number(row.original.is_successful) !== 1 && row.original.error_message && <small className={styles.failureDetail} title={row.original.error_message}>{row.original.error_message}</small>}</span>
          },
          {
               Header: 'Status',
               accessor: 'is_successful',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => (
                    <span>
                         <span className={`${styles.status} ${Number(row.original.is_successful) === 1 ? styles.success : styles.failed}`}>{Number(row.original.is_successful) === 1 ? 'Successful' : 'Failed'}</span>
                         {Number(row.original.is_successful) === 1 && row.original.file_available === false && <small className="d-block text-danger-emphasis">File unavailable</small>}
                    </span>
               )
          },
          {
               Header: 'Type',
               accessor: 'backup_type',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => <span className="text-capitalize">{row.original.backup_type}</span>
          },
          {
               Header: 'Mode',
               accessor: 'backup_mode',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => (
                    <span>
                         {row.original.backup_mode}
                    </span>
               )
          },
          {
               Header: 'Size',
               accessor: 'backup_size_bytes',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => (
                    <span>{(row.original.backup_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
               )
          },
          {
               Header: 'Duration',
               accessor: 'duration_seconds',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => <span>{row.original.duration_seconds}s</span>
          },
          {
               Header: 'Date',
               accessor: 'backup_date',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => <small>{new Date(row.original.backup_date).toLocaleString()}</small>
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: {row: {original: BackupLog; index: number}}) => (
                    <div className={styles.rowActions}>
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => onDownloadBackup?.(row.original)}
                              disabled={Number(row.original.is_successful) !== 1 || row.original.file_available === false}
                              title={row.original.file_available === false ? 'Backup file is unavailable on the server' : 'Download backup file'}
                         >
                              <RiDownloadLine size={14} className="me-1" />
                              Download
                         </Button>
                         <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => onDeleteBackup?.(row.original)}
                              title="Delete this backup"
                         >
                              <RiDeleteBinLine size={14} className="me-1" />
                              Delete
                         </Button>
                    </div>
               )
          }
     ];

     return (
          <section className={styles.panel} aria-label="Run history">
               <header className={styles.sectionHeader}>
                    <div className={styles.heading}>
                         <RiDatabaseLine size={21} aria-hidden="true" />
                         <div><h2>Run history</h2><p>Review outcomes and download available backup files.</p></div>
                    </div>
                    <span className={styles.count}>{backupLogs.length} loaded</span>
               </header>
               <div className={styles.tableBody}>
               <PrimeTable
                    column={columns}
                    data={backupLogs}
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={onServerFilter || (() => { })}
               />
               </div>
          </section>
     );
}