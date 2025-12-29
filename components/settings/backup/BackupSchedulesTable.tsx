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
               Cell: ({ row }) => <span className="fw-semibold">{row.original.schedule_name}</span>
          },
          {
               Header: 'Frequency',
               accessor: 'frequency',
               Cell: ({ row }) => (
                    <span className="text-capitalize">
                         {row.original.frequency}
                    </span>
               )
          },
          {
               Header: 'Backup Time',
               accessor: 'backup_time',
               Cell: ({ row }) => <span>{row.original.backup_time}</span>
          },
          {
               Header: 'Type',
               accessor: 'backup_type',
               Cell: ({ row }) => (
                    <span>
                         {row.original.backup_type.replace('_', ' ')}
                    </span>
               )
          },
          {
               Header: 'Status',
               accessor: 'is_active',
               Cell: ({ row }) => (
                    <span>
                         {row.original.is_active ? 'Active' : 'Inactive'}
                    </span>
               )
          },
          {
               Header: 'Last Run',
               accessor: 'last_run',
               Cell: ({ row }) => (
                    <small>
                         {row.original.last_run ? new Date(row.original.last_run).toLocaleString() : 'Never'}
                    </small>
               )
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }) => {
                    const isExecuting = executingSchedules.has(row.original.id);
                    return (
                         <div className="d-flex gap-1">
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
                                   onClick={() => onEditSchedule(row.original)}
                                   title="Edit Schedule"
                              >
                                   <RiEditLine size={14} className="me-1" />
                                   Edit
                              </Button>
                              <Button
                                   variant="outline-danger"
                                   size="sm"
                                   onClick={() => onDeleteSchedule(row.original.id)}
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
          <div className="border p-3  rounded bg-white mx-2 p-2 mb-4">
               <div className="d-flex align-items-center gap-2 mb-3">
                    <RiSettings4Line size={20} />
                    <h5 className="mb-0">Backup Schedules</h5>
               </div>
               <PrimeTable
                    column={columns}
                    data={backupSchedules}
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={onServerFilter || (() => { })}
               />
          </div>
     );
}