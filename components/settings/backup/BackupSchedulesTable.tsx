import styles from './BackupWorkspace.module.css';
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { RiPlayCircleLine, RiEditLine, RiDeleteBinLine, RiSettings4Line } from '@remixicon/react';
import PrimeTable from '../../accessories/Datatables/PrimeTable';

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

interface BackupSchedulesTableProps {
     backupSchedules: BackupSchedule[];
     onExecuteSchedule: (scheduleId: number) => void;
     onEditSchedule: (schedule: BackupSchedule) => void;
     onDeleteSchedule: (scheduleId: number) => void;
     onServerFilter?: (pagination: { count: number, page: number, sortby: string }) => Promise<{ result: any; error: boolean }>;
     loading?: boolean;
     executingSchedules?: Set<number>;
}

export default function BackupSchedulesTable({
     backupSchedules,
     onExecuteSchedule,
     onEditSchedule,
     onDeleteSchedule,
     onServerFilter,
     loading = false,
     executingSchedules = new Set()
}: BackupSchedulesTableProps) {
     const columns = [
          {
               Header: 'Schedule Name',
               accessor: 'schedule_name',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => <span className="fw-semibold">{row.original.schedule_name}</span>
          },
          {
               Header: 'Frequency',
               accessor: 'frequency',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => (
                    <span className="text-capitalize">
                         {row.original.frequency}
                    </span>
               )
          },
          {
               Header: 'Backup Time',
               accessor: 'backup_time',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => <span>{row.original.backup_time}</span>
          },
          {
               Header: 'Type',
               accessor: 'backup_type',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => (
                    <span>
                         {row.original.backup_type.replace('_', ' ')}
                    </span>
               )
          },
          {
               Header: 'Status',
               accessor: 'is_active',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => (
                    <span>
                         {Number(row.original.is_active) === 1 ? 'Active' : 'Paused'}
                    </span>
               )
          },
          {
               Header: 'Last Run',
               accessor: 'last_run',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => (
                    <small>
                         {row.original.last_run ? new Date(row.original.last_run).toLocaleString() : 'Never'}
                    </small>
               )
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: {row: {original: BackupSchedule; index: number}}) => {
                    const isExecuting = executingSchedules.has(row.original.id);
                    return (
                         <div className={styles.rowActions}>
                              <Button
                                   variant="outline-primary"
                                   size="sm"
                                   onClick={() => onExecuteSchedule(row.original.id)}
                                   disabled={isExecuting}
                                   title="Execute Now"
                              >
                                   {isExecuting ? (
                                        <>
                                             <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                             Running...
                                        </>
                                   ) : (
                                        <>
                                             <RiPlayCircleLine size={14} className="me-1" />
                                             Run
                                        </>
                                   )}
                              </Button>
                              <Button
                                   variant="outline-secondary"
                                   size="sm"
                                   disabled={isExecuting} onClick={() => onEditSchedule(row.original)}
                                   title="Edit Schedule"
                              >
                                   <RiEditLine size={14} className="me-1" />
                                   Edit
                              </Button>
                              <Button
                                   variant="outline-danger"
                                   size="sm"
                                   disabled={isExecuting} onClick={() => onDeleteSchedule(row.original.id)}
                                   title="Delete Schedule"
                              >
                                   <RiDeleteBinLine size={14} className="me-1" />
                                   Delete
                              </Button>
                         </div>
                    );
               }
          }
     ];

     return (
          <section className={styles.panel} aria-label="Backup schedules">
               <header className={styles.sectionHeader}>
                    <div className={styles.heading}>
                         <RiSettings4Line size={21} aria-hidden="true" />
                         <div><h2>Backup schedules</h2><p>Manage recurring runs, timing and retention.</p></div>
                    </div>
                    <span className={styles.count}>{backupSchedules.length} loaded</span>
               </header>
               <div className={styles.tableBody}>
               <PrimeTable
                    column={columns}
                    data={backupSchedules}
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={onServerFilter || (() => { })}
               />
               </div>
          </section>
     );
}