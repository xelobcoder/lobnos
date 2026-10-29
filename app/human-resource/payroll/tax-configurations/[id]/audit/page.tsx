'use client';
import screens from '../../../PayrollScreens.module.css';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Collapse, Spinner, Alert } from 'react-bootstrap';
import { RiArrowLeftLine, RiHistoryLine, RiUserLine, RiTimeLine, RiFileTextLine, RiCheckboxCircleLine, RiEditLine, RiDeleteBinLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';

interface AuditRecord {
     audit_id: number;
     tax_config_id: number;
     tax_year: string;
     country: string;
     tax_bands: string;
     standard_exemption: string;
     dependent_relief: string;
     disability_exemption: string;
     employee_ssnit_rate: string;
     employer_ssnit_rate: string;
     tier3_employee_rate: string;
     tier3_employer_rate: string;
     ssnit_ceiling: string | null;
     pension_ceiling: string | null;
     is_active: number;
     operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
     operation_timestamp: string;
     operation_user: number | null;
     operation_user_name: string | null;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function TaxConfigurationAuditPage() {
     const params = useParams();
     const configId = params?.id as string;

     const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
     const [searchText, setSearchText] = useState('');
     const [isLoading, setIsLoading] = useState(true);
     const [isRefreshing, setIsRefreshing] = useState(false);
     const [isSearching, setIsSearching] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

     const fetchAuditHistory = async (refreshing = false, search = '') => {
          if (!configId) {
               setError('No configuration ID provided');
               setIsLoading(false);
               setIsRefreshing(false);
               setIsSearching(false);
               return;
          }

          try {
               if (refreshing) setIsRefreshing(true);
               else if (search) setIsSearching(true);
               else setIsLoading(true);

               const url = `payroll/tax-configurations/${configId}/audit`;
               const response = await customFetch(url);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    const validRecords = response.result.filter((record: any) => record !== null && record !== undefined);
                    setAuditHistory(validRecords);
               } else {
                    setAuditHistory([]);
               }
          } catch (err) {
               setError('Failed to load audit history');
          } finally {
               setIsLoading(false);
               setIsRefreshing(false);
               setIsSearching(false);
          }
     };

     const handleSearch = () => {
          if (searchText.trim()) {
               // For now, we'll filter client-side since the API doesn't support search
               // In a real implementation, you'd pass search to the API
               setAuditHistory(prev => prev.filter(record =>
                    record.operation_user_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                    record.operation_type.toLowerCase().includes(searchText.toLowerCase()) ||
                    record.tax_year.toLowerCase().includes(searchText.toLowerCase())
               ));
          }
     };

     const handleKeyPress = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
               handleSearch();
          }
     };

     const handleRefresh = () => {
          setSearchText('');
          fetchAuditHistory(true);
     };

     useEffect(() => {
          fetchAuditHistory();
     }, [configId]);

     const groupedData = useMemo(() => {
          const groupedMap = new Map<string, AuditRecord[]>();

          auditHistory.forEach(record => {
               const timestampKey = record.operation_timestamp;

               if (!groupedMap.has(timestampKey)) {
                    groupedMap.set(timestampKey, []);
               }

               groupedMap.get(timestampKey)!.push(record);
          });

          // For each timestamp group, sort by audit_id descending (newer first)
          // and compute changes if there are multiple records
          const processedGroups: Array<{
               timestamp: string;
               records: AuditRecord[];
               changes: Array<{ field: string; oldValue: any; newValue: any }>;
               operation_type: string;
               operation_user_name: string | null;
          }> = [];

          groupedMap.forEach((records, timestamp) => {
               records.sort((a, b) => b.audit_id - a.audit_id); // Newer first

               let changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

               if (records.length >= 2) {
                    // Compare first (new) and second (old) records
                    const newRecord = records[0];
                    const oldRecord = records[1];

                    const fieldsToCompare = [
                         'tax_year', 'country', 'tax_bands', 'standard_exemption', 'dependent_relief',
                         'disability_exemption', 'employee_ssnit_rate', 'employer_ssnit_rate',
                         'tier3_employee_rate', 'tier3_employer_rate', 'ssnit_ceiling', 'pension_ceiling', 'is_active'
                    ];

                    fieldsToCompare.forEach(field => {
                         if (newRecord[field as keyof AuditRecord] !== oldRecord[field as keyof AuditRecord]) {
                              changes.push({
                                   field,
                                   oldValue: oldRecord[field as keyof AuditRecord],
                                   newValue: newRecord[field as keyof AuditRecord]
                              });
                         }
                    });
               }

               processedGroups.push({
                    timestamp,
                    records,
                    changes,
                    operation_type: records[0].operation_type,
                    operation_user_name: records[0].operation_user_name
               });
          });

          // Sort groups by timestamp descending (newest first)
          processedGroups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          return processedGroups;
     }, [auditHistory]);

     const toggleRecord = (timestamp: string) => {
          setExpandedRecords(prev => {
               const newSet = new Set(prev);
               if (newSet.has(timestamp)) {
                    newSet.delete(timestamp);
               } else {
                    newSet.add(timestamp);
               }
               return newSet;
          });
     };

     const formatFieldName = (field: string) => {
          return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
     };

     const formatFieldValue = (field: string, value: any) => {
          if (value === null || value === undefined) return '-';

          // Format currency fields
          if (['standard_exemption', 'dependent_relief', 'disability_exemption', 'ssnit_ceiling', 'pension_ceiling'].includes(field)) {
               return currencyFormatter.format(parseFloat(value) || 0);
          }

          // Format percentage fields
          if (['employee_ssnit_rate', 'employer_ssnit_rate', 'tier3_employee_rate', 'tier3_employer_rate'].includes(field)) {
               return `${value}%`;
          }

          // Format boolean fields
          if (field === 'is_active') {
               return value == 1 ? 'Active' : 'Inactive';
          }

          // Format tax bands (JSON string)
          if (field === 'tax_bands') {
               try {
                    const bands = JSON.parse(value);
                    return `${bands.length} bands`;
               } catch {
                    return value;
               }
          }

          return value;
     };

     if (isLoading) {
          return (
               <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    Loading audit history...
               </div>
          );
     }

     if (error) {
          return <Alert variant="danger">{error}</Alert>;
     }
     return (
          <div className={screens.page}>
               <div className={screens.header}>
                    <div className="col-auto">
                         <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                    </div>
                    <div className="col-auto">
                         <h6 className="mb-0 d-flex align-items-center">
                              <RiHistoryLine size={20} className="me-2" />
                              Audit History: Tax Configuration {configId}
                         </h6>
                    </div>
                    <div className="col-auto">
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={handleRefresh}
                              disabled={isRefreshing}
                              className="d-flex align-items-center gap-2"
                         >
                              {isRefreshing ? (
                                   <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Refreshing...</span>
                                   </>
                              ) : (
                                   <>
                                        <RiRefreshLine size={16} />
                                        <span>Refresh Data</span>
                                   </>
                              )}
                         </Button>
                    </div>
                    <div className="col"></div>
                    <div className="col-3">
                         <div className="d-flex gap-1">
                              <input
                                   type="text"
                                   className="form-control form-control-sm"
                                   placeholder="Search operations..."
                                   value={searchText}
                                   onChange={(e) => setSearchText(e.target.value)}
                                   onKeyPress={handleKeyPress}
                                   disabled={isSearching}
                              />
                              <button
                                   className="btn btn-primary btn-sm"
                                   type="button"
                                   onClick={handleSearch}
                                   disabled={!searchText.trim() || isSearching}
                              >
                                   {isSearching ? (
                                        <Spinner animation="border" size="sm" />
                                   ) : (
                                        <RiSearchLine size={16} />
                                   )}
                              </button>
                              {searchText && (
                                   <button
                                        className="btn btn-outline-secondary btn-sm"
                                        type="button"
                                        onClick={() => {
                                             setSearchText('');
                                             fetchAuditHistory(true);
                                        }}
                                        disabled={isSearching}
                                   >
                                        ×
                                   </button>
                              )}
                         </div>
                    </div>
               </div>

               {auditHistory.length > 0 && (
                    <div className="mb-3 text-muted">
                         <small>Showing {auditHistory.length} audit records{searchText ? ` for search "${searchText}"` : ''}</small>
                    </div>
               )}

               {auditHistory.length === 0 && searchText && !isSearching && !isLoading && (
                    <div className="mb-3 text-danger">
                         <small>No results found for &quot;{searchText}&quot;</small>
                    </div>
               )}

               {groupedData.length > 0 ? (
                    <div className="position-relative" style={{ paddingLeft: '40px' }}>
                         {/* Timeline Line */}
                         <div
                              style={{
                                   position: 'absolute',
                                   left: '20px',
                                   top: '0',
                                   bottom: '0',
                                   width: '2px',
                                   background: 'linear-gradient(to bottom, #dee2e6 0%, #dee2e6 100%)'
                              }}
                         />

                         {groupedData.map((group) => {
                              const isExpanded = expandedRecords.has(group.timestamp);
                              const operationIcon = group.operation_type === 'INSERT' ? RiCheckboxCircleLine :
                                   group.operation_type === 'UPDATE' ? RiEditLine :
                                        RiDeleteBinLine;

                              const IconComponent = operationIcon as React.ComponentType<{ size: number; style?: React.CSSProperties }>;

                              const getOperationTitle = (type: string) => {
                                   switch (type) {
                                        case 'INSERT': return 'Configuration Created';
                                        case 'UPDATE': return 'Configuration Updated';
                                        case 'DELETE': return 'Configuration Deleted';
                                        default: return 'Unknown Operation';
                                   }
                              };

                              return (
                                   <div key={group.timestamp} className="mb-4 position-relative">
                                        <div
                                             style={{
                                                  position: 'absolute',
                                                  left: '-28px',
                                                  top: '8px',
                                                  width: '16px',
                                                  height: '16px',
                                                  borderRadius: '50%',
                                                  backgroundColor: group.operation_type === 'INSERT' ? '#28a745' : group.operation_type === 'UPDATE' ? '#ffc107' : '#dc3545',
                                                  border: '3px solid white',
                                                  zIndex: 1
                                             }}
                                        />

                                        {/* Record Card */}
                                        <div className={screens.panel}>
                                             <div className="d-flex justify-content-between align-items-start mb-2">
                                                  <div>
                                                       <h6 className="mb-1 fw-bold d-flex align-items-center">
                                                            <IconComponent size={18} style={{ color: group.operation_type === 'INSERT' ? '#28a745' : group.operation_type === 'UPDATE' ? '#ffc107' : '#dc3545' }} />
                                                            {getOperationTitle(group.operation_type)}
                                                       </h6>
                                                       <small className="text-muted">
                                                            {new Date(group.timestamp).toLocaleString('en-US', {
                                                                 day: 'numeric', month: 'short', year: 'numeric',
                                                                 hour: '2-digit', minute: '2-digit'
                                                            })}
                                                            {group.operation_user_name && ` by ${group.operation_user_name}`}
                                                       </small>
                                                  </div>
                                                  <Button
                                                       variant="link"
                                                       size="sm"
                                                       className="text-decoration-none p-0"
                                                       onClick={() => toggleRecord(group.timestamp)}
                                                       aria-expanded={isExpanded}
                                                       aria-controls={`collapse-${group.timestamp}`}
                                                  >
                                                       {isExpanded ? 'Show Less' : 'Show More'}
                                                  </Button>
                                             </div>

                                             <p className="mb-3 small text-muted">
                                                  {group.changes.length > 0
                                                       ? `Updated ${group.changes.length} field(s).`
                                                       : `Initial snapshot of the configuration.`}
                                             </p>

                                             <Collapse in={isExpanded}>
                                                  <div id={`collapse-${group.timestamp}`}>
                                                       {group.changes.length > 0 ? (
                                                            <div className={screens.tableWrap}>
                                                                 <table className={screens.table} style={{ fontSize: '0.85rem' }}>
                                                                      <thead className="table-light">
                                                                           <tr>
                                                                                <th style={{ width: '33%' }}>Attribute</th>
                                                                                <th style={{ width: '33%' }}>New Value</th>
                                                                                <th style={{ width: '33%' }}>Old Value</th>
                                                                           </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                           {group.changes.map((change, idx) => (
                                                                                <tr key={idx}>
                                                                                     <td className="fw-semibold">{formatFieldName(change.field)}</td>
                                                                                     <td style={{ backgroundColor: 'rgba(144, 238, 144, 0.3)' }}>
                                                                                          {formatFieldValue(change.field, change.newValue)}
                                                                                     </td>
                                                                                     <td style={{ backgroundColor: 'rgba(255, 182, 193, 0.3)' }}>
                                                                                          {formatFieldValue(change.field, change.oldValue)}
                                                                                     </td>
                                                                                </tr>
                                                                           ))}
                                                                      </tbody>
                                                                 </table>
                                                            </div>
                                                       ) : (
                                                            <div className={screens.tableWrap}>
                                                                 <table className={screens.table} style={{ fontSize: '0.85rem' }}>
                                                                      <thead className="table-light">
                                                                           <tr>
                                                                                <th>Attribute</th>
                                                                                <th>Value</th>
                                                                           </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                           {Object.entries(group.records[0]).filter(([key]) =>
                                                                                !['audit_id', 'tax_config_id', 'operation_type', 'operation_timestamp', 'operation_user', 'operation_user_name'].includes(key)
                                                                           ).map(([field, value]) => (
                                                                                <tr key={field}>
                                                                                     <td className="fw-semibold">{formatFieldName(field)}</td>
                                                                                     <td>{formatFieldValue(field, value)}</td>
                                                                                </tr>
                                                                           ))}
                                                                      </tbody>
                                                                 </table>
                                                            </div>
                                                       )}
                                                  </div>
                                             </Collapse>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>
               ) : (
                    <div className="text-center py-5 text-muted">
                         <RiHistoryLine size={48} className="mb-3 opacity-50" />
                         <p className="mb-0">No audit history found for this tax configuration.</p>
                    </div>
               )}
          </div>
     );
}