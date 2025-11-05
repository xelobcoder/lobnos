import React from 'react';
import { Button } from 'react-bootstrap';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { RiDatabaseLine, RiDownloadLine, RiRefreshLine, RiDeleteBinLine } from '@remixicon/react';

interface BackupLog {
     id: number;
     backup_name: string;
     is_successful: boolean;
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
     onRestoreBackup?: (backupLog: BackupLog) => void;
     onDownloadBackup?: (backupLog: BackupLog) => void;
     onDeleteBackup?: (backupLog: BackupLog) => void;
     onServerFilter?: (pagination: { count: number, page: number, sortby: string }) => Promise<{ result: any; error: boolean }>;
     loading?: boolean;
}

export default function BackupLogsTable({ backupLogs, onRestoreBackup, onDownloadBackup, onDeleteBackup, onServerFilter, loading = false }: BackupLogsTableProps) {
     const columns = [
          {
               Header: 'Backup Name',
               accessor: 'backup_name',
               Cell: ({ row }) => <span className="fw-semibold">{row.original.backup_name}</span>
          },
          {
               Header: 'Status',
               accessor: 'is_successful',
               Cell: ({ row }) => (
                    <span>
                         {row.original.is_successful ? 'Success' : 'Failed'}
                    </span>
               )
          },
          {
               Header: 'Type',
               accessor: 'backup_type',
               Cell: ({ row }) => <span className="text-capitalize">{row.original.backup_type}</span>
          },
          {
               Header: 'Mode',
               accessor: 'backup_mode',
               Cell: ({ row }) => (
                    <span>
                         {row.original.backup_mode}
                    </span>
               )
          },
          {
               Header: 'Size',
               accessor: 'backup_size_bytes',
               Cell: ({ row }) => (
                    <span>{(row.original.backup_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
               )
          },
          {
               Header: 'Duration',
               accessor: 'duration_seconds',
               Cell: ({ row }) => <span>{row.original.duration_seconds}s</span>
          },
          {
               Header: 'Date',
               accessor: 'backup_date',
               Cell: ({ row }) => <small>{new Date(row.original.backup_date).toLocaleString()}</small>
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => onRestoreBackup?.(row.original)}
                              disabled={!row.original.is_successful}
                              title="Restore from this backup"
                         >
                              <RiRefreshLine size={14} className="me-1" />
                              Restore
                         </Button>
                         <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => onDownloadBackup?.(row.original)}
                              disabled={!row.original.is_successful}
                              title="Download backup file"
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
          <div className="border bg-white border-secondary-subtle mx-2 p-2">
               <div className="d-flex align-items-center gap-2 mb-3">
                    <RiDatabaseLine size={20} />
                    <h5 className="mb-0">Backup Logs</h5>
               </div>
               <PrimeTable
                    column={columns}
                    data={backupLogs}
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={onServerFilter || (() => { })}
               />
          </div>
     );
}