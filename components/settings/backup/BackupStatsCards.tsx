import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

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
          <Row className="g-3">
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h4 text-success mb-1">{backupStats?.successful_backups || 0}</div>
                              <small className="text-muted">Successful</small>
                         </Card.Body>
                    </Card>
               </Col>
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h4 text-warning mb-1">{backupStats?.failed_backups || 0}</div>
                              <small className="text-muted">Failed</small>
                         </Card.Body>
                    </Card>
               </Col>
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h4 text-info mb-1">
                                   {backupStats ? formatFileSize(backupStats.total_size) : '0 B'}
                              </div>
                              <small className="text-muted">Total Size</small>
                         </Card.Body>
                    </Card>
               </Col>
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h4 text-primary mb-1">
                                   {backupStats ? Math.round((backupStats.successful_backups / Math.max(backupStats.total_backups, 1)) * 100) : 0}%
                              </div>
                              <small className="text-muted">Success Rate</small>
                         </Card.Body>
                    </Card>
               </Col>
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h4 text-secondary mb-1">{backupStats?.total_backups || 0}</div>
                              <small className="text-muted">Total Backups</small>
                         </Card.Body>
                    </Card>
               </Col>
               <Col md={4} lg={2}>
                    <Card className="text-center">
                         <Card.Body>
                              <div className="h6 text-dark mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                   {backupStats ? formatDate(backupStats.last_backup_date) : 'Never'}
                              </div>
                              <small className="text-muted">Last Backup</small>
                         </Card.Body>
                    </Card>
               </Col>
          </Row>
     );
}