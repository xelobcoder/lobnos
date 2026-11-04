import React from 'react';
import { RiDatabaseLine, RiCheckLine, RiCloseLine, RiBox3Line, RiBarChartLine, RiTimeLine } from '@remixicon/react';
import styles from './BackupWorkspace.module.css';

interface BackupStats { total_backups: number; successful_backups: number; failed_backups: number; total_size: number; last_backup_date: string; }
interface BackupStatsCardsProps { backupStats: BackupStats | null; }
const count = (value: number) => Math.max(0, Number(value) || 0).toLocaleString();
function fileSize(value: number) {
    const bytes = Math.max(0, Number(value) || 0);
    if (bytes === 0) return '0 B';
    const unit = Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Number((bytes / 1024 ** unit).toFixed(1))} ${['B', 'KB', 'MB', 'GB', 'TB'][unit]}`;
}
function lastBackup(value: string) {
    if (!value) return 'No backups yet';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export default function BackupStatsCards({ backupStats }: BackupStatsCardsProps) {
    const stats = backupStats;
    const metrics = [
        { label: 'Backup records', value: stats ? count(stats.total_backups) : '—', note: 'Across all recorded runs', icon: RiDatabaseLine },
        { label: 'Successful', value: stats ? count(stats.successful_backups) : '—', note: 'Completed backup runs', icon: RiCheckLine, tone: styles.success },
        { label: 'Failed', value: stats ? count(stats.failed_backups) : '—', note: 'Review details in run history', icon: RiCloseLine, tone: stats?.failed_backups ? styles.failed : '' },
        { label: 'Recorded size', value: stats ? fileSize(stats.total_size) : '—', note: 'Size reported in backup logs', icon: RiBox3Line },
        { label: 'Success rate', value: stats && Number(stats.total_backups) > 0 ? `${Math.round(Number(stats.successful_backups) / Number(stats.total_backups) * 100)}%` : '—', note: 'Successful runs / recorded runs', icon: RiBarChartLine },
        { label: 'Latest backup', value: stats ? lastBackup(stats.last_backup_date) : '—', note: 'Most recent recorded backup', icon: RiTimeLine, date: true },
    ];
    return <section className={styles.metrics} aria-label="Backup overview">
        {metrics.map(metric => <article key={metric.label} className={styles.metric}>
            <div className={styles.metricLabel}><metric.icon size={17} aria-hidden="true" />{metric.label}</div>
            <strong className={`${styles.metricValue} ${metric.tone || ''} ${metric.date ? styles.metricDate : ''}`}>{metric.value}</strong>
            <span className={styles.metricHelp}>{metric.note}</span>
        </article>)}
    </section>;
}
