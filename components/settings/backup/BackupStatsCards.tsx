import React from 'react';
import { RiDatabaseLine, RiCheckLine, RiCloseLine, RiBox3Line, RiBarChartLine, RiTimeLine } from '@remixicon/react';

interface BackupStats {
     total_backups: number;
     successful_backups: number;
     failed_backups: number;
     total_size: number;
     last_backup_date: string;
}

interface BackupStatsCardsProps {
     backupStats: BackupStats | null;
}

const formatFileSize = (bytes: number): string => {
     if (bytes === 0) return '0 B';

     const k = 1024;
     const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));

     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
     if (!dateString) return 'Never';

     try {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     } catch {
          return 'Invalid Date';
     }
};

export default function BackupStatsCards({ backupStats }: BackupStatsCardsProps) {
     return (
          <div className="row g-3">
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiDatabaseLine size={32} className="me-2 text-primary-emphasis" />
                              <span className="fw-medium text-muted small">Total Backups</span>
                         </div>
                         <div className="fs-4 fw-bold text-primary-emphasis">{backupStats?.total_backups || 0}</div>
                         <div className="small text-muted">All backup records</div>
                    </div>
               </div>
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiCheckLine size={32} className="me-2 text-success-emphasis" />
                              <span className="fw-medium text-muted small">Successful</span>
                         </div>
                         <div className="fs-4 fw-bold text-success-emphasis">{backupStats?.successful_backups || 0}</div>
                         <div className="small text-muted">Completed backups</div>
                    </div>
               </div>
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiCloseLine size={32} className="me-2 text-danger-emphasis" />
                              <span className="fw-medium text-muted small">Failed</span>
                         </div>
                         <div className="fs-4 fw-bold text-danger-emphasis">{backupStats?.failed_backups || 0}</div>
                         <div className="small text-muted">Failed backups</div>
                    </div>
               </div>
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiBox3Line size={32} className="me-2 text-info-emphasis" />
                              <span className="fw-medium text-muted small">Total Size</span>
                         </div>
                         <div className="fs-4 fw-bold text-info-emphasis">
                              {backupStats ? formatFileSize(backupStats.total_size) : '0 B'}
                         </div>
                         <div className="small text-muted">Backup storage used</div>
                    </div>
               </div>
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiBarChartLine size={32} className="me-2 text-warning-emphasis" />
                              <span className="fw-medium text-muted small">Success Rate</span>
                         </div>
                         <div className="fs-4 fw-bold text-warning-emphasis">
                              {backupStats ? Math.round((backupStats.successful_backups / Math.max(backupStats.total_backups, 1)) * 100) : 0}%
                         </div>
                         <div className="small text-muted">Backup reliability</div>
                    </div>
               </div>
               <div className="col-md-4">
                    <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-2">
                              <RiTimeLine size={32} className="me-2 text-body-secondary" />
                              <span className="fw-medium text-muted small">Last Backup</span>
                         </div>
                         <div className="fs-6 fw-bold text-body-secondary" style={{ lineHeight: '1.2' }}>
                              {backupStats ? formatDate(backupStats.last_backup_date) : 'Never'}
                         </div>
                         <div className="small text-muted">Most recent backup</div>
                    </div>
               </div>
          </div>
     );
}