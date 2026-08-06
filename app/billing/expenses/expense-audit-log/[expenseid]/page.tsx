'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { motion, AnimatePresence } from 'motion/react';
import { RiRefreshLine, RiSearchLine } from '@remixicon/react';
import styles from './AuditLogDisplay.module.css';

interface ExpenseRecord {
  name: string;
  date: string;
  merchant: string;
  amount: number;
  category: number;
  mode: number;
  description: string;
  employeeid: number;
  branchid: number;
  createdon: string;
  approved: number | boolean;
  approvedby: number | null;
  approvedon: string | null;
  rejectionmessage: string | null;
  isassociatedservice: number | boolean;
  serviceid: number | null;
  [key: string]: any;
}

interface LogEntry {
  audit_id: number;
  uid: string;
  operation: 'UPDATE' | 'INSERT' | 'DELETE';
  table_name: string;
  record_id: number;
  old_data: Partial<ExpenseRecord> | null;
  new_data: Partial<ExpenseRecord> | null;
  changed_by: number;
  changed_on: string;
  client_ip: string | null;
  username: string;
}

const operationStyles = {
  INSERT: {
    bg: 'var(--success-bg)',
    text: 'var(--success-text)',
    border: 'var(--success-border)',
    icon: '➕',
  },
  UPDATE: {
    bg: 'var(--info-bg)',
    text: 'var(--info-text)',
    border: 'var(--info-border)',
    icon: '✏️',
  },
  DELETE: {
    bg: 'var(--danger-bg)',
    text: 'var(--danger-text)',
    border: 'var(--danger-border)',
    icon: '🗑️',
  },
};

const AuditLogDisplay: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<LogEntry[]>([]);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();
  const expenseid = params?.expenseid;

  const fetchAuditLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customFetch(`expenses/audit/${expenseid}`);
      if (response && Array.isArray(response)) {
        setAuditLogs(response);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load audit logs. Please try again.');
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [expenseid]);

  useEffect(() => {
    if (expenseid) {
      fetchAuditLog();
    }
  }, [expenseid, fetchAuditLog]);

  const toggleExpand = useCallback((logId: number) => {
    setExpandedLog((prev) => (prev === logId ? null : logId));
  }, []);

  const formatValue = useCallback((value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(
      (log) => {
        const username = log.username ? log.username.toLowerCase() : '';
        const operation = log.operation ? log.operation.toLowerCase() : '';
        const changedOn = formatDate(log.changed_on).toLowerCase();

        return (
          username.includes(searchTerm.toLowerCase()) ||
          operation.includes(searchTerm.toLowerCase()) ||
          changedOn.includes(searchTerm.toLowerCase())
        );
      }
    );
  }, [auditLogs, searchTerm, formatDate]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Expense Audit Trail</h1>
          <p>Track all modifications made to this expense record</p>
        </div>
        <div className={styles.totalChanges}>
          Total Changes: <span>{auditLogs.length}</span>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchAuditLog}>Retry</button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <RiSearchLine className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search by username, operation, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search audit logs"
          />
        </div>
        <button
          className={styles.refreshButton}
          onClick={fetchAuditLog}
          aria-label="Refresh audit logs"
        >
          <RiRefreshLine size={20} />
          Refresh
        </button>
      </div>

      {filteredLogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.noLogs}
        >
          <h3>No audit logs found</h3>
          <p>This expense has not been modified yet.</p>
        </motion.div>
      ) : (
        <div>
          {filteredLogs.map((log) => {
            const allKeys = new Set([
              ...(log.old_data ? Object.keys(log.old_data) : []),
              ...(log.new_data ? Object.keys(log.new_data) : []),
            ]);

            return (
              <motion.div
                key={log.audit_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={styles.logCard}
                style={{
                  borderLeftColor:
                    log.operation === 'INSERT'
                      ? 'var(--success-border)'
                      : log.operation === 'UPDATE'
                        ? 'var(--info-border)'
                        : 'var(--danger-border)',
                }}
              >
                <div
                  className={styles.logHeader}
                  onClick={() => toggleExpand(log.audit_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleExpand(log.audit_id);
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={expandedLog === log.audit_id}
                  aria-label={`Toggle details for ${log.operation} by ${log.username} on ${formatDate(log.changed_on)}`}
                >
                  <div className={styles.logHeaderContent}>
                    <span style={{ fontSize: '1.5rem' }}>{operationStyles[log.operation].icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          className={styles.operationTag}
                          style={{
                            background: operationStyles[log.operation].bg,
                            color: operationStyles[log.operation].text,
                            borderColor: operationStyles[log.operation].border,
                          }}
                        >
                          {log.operation}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          {formatDate(log.changed_on)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                        Changed by <span style={{ fontWeight: 600 }}>{log.username}</span>
                      </h3>
                    </div>
                  </div>
                  <span>{expandedLog === log.audit_id ? '▲' : '▼'}</span>
                </div>

                <AnimatePresence>
                  {expandedLog === log.audit_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.logDetails}
                    >
                      <table className={styles.logTable}>
                        <thead>
                          <tr>
                            <th style={{ width: '25%' }}>Field</th>
                            <th>Before</th>
                            <th>After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(allKeys).map((key) => (
                            <tr key={key}>
                              <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </td>
                              <td
                                className={log.old_data?.[key] !== log.new_data?.[key] ? styles.changed : ''}
                                style={{
                                  color:
                                    log.old_data?.[key] !== log.new_data?.[key]
                                      ? 'var(--danger-text)'
                                      : '#6c757d',
                                }}
                              >
                                {formatValue(log.old_data?.[key])}
                              </td>
                              <td
                                className={log.old_data?.[key] !== log.new_data?.[key] ? styles.changed : ''}
                                style={{
                                  color:
                                    log.old_data?.[key] !== log.new_data?.[key]
                                      ? 'var(--success-text)'
                                      : '#6c757d',
                                }}
                              >
                                {formatValue(log.new_data?.[key])}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditLogDisplay;