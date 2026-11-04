import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import { RiDatabaseLine, RiCloseLine } from '@remixicon/react';
import themeContrast from '../../../styles/theme-contrast.module.css';

interface BackupProgressSectionProps {
     isBackupRunning: boolean;
     backupProgress: number;
     backupStatus: string;
     currentOperation: string;
     estimatedTime: string;
     onCancelBackup: () => void;
}

export default function BackupProgressSection({
     isBackupRunning,
     backupProgress,
     backupStatus,
     currentOperation,
     estimatedTime,
     onCancelBackup
}: BackupProgressSectionProps) {
     if (!isBackupRunning) {
          return null;
     }

     // If we have detailed progress info, show it; otherwise show simple running state
     const hasProgress = backupProgress > 0 || backupStatus || currentOperation || estimatedTime;

     return (
          <div className={`border border-warning bg-body-tertiary border-2 mx-2 p-3 mb-4 shadow-sm ${themeContrast.controls}`}>
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                         <RiDatabaseLine size={20} className="text-warning-emphasis" />
                         <h5 className="mb-0 text-warning-emphasis">🔥 Backup in Progress</h5>
                    </div>
                    <Button
                         variant="outline-danger"
                         size="sm"
                         onClick={onCancelBackup}
                         className="d-flex align-items-center gap-1"
                    >
                         <RiCloseLine size={14} />
                         Cancel Backup
                    </Button>
               </div>

               {hasProgress ? (
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
               ) : (
                    <div className="text-center">
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <p className="mt-2 mb-0">Manual backup is running... Please wait.</p>
                    </div>
               )}
          </div>
     );
}