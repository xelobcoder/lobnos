'use client';
import screens from '../PayrollScreens.module.css';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
     RiAddLine,
     RiArrowRightLine,
     RiErrorWarningLine,
     RiLoader4Line,
     RiShieldCheckLine,
     RiSettings3Line,
     RiFileListLine,
     RiCheckboxCircleLine,
     RiCloseCircleLine
} from '@remixicon/react';
import { customFetch } from '../../../../components/Auth/customFetch';

interface TaxConfiguration {
     id: number;
     tax_year: string;
     country: string;
     is_active: boolean;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function TaxReliefsPage() {
     const [configs, setConfigs] = useState<TaxConfiguration[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const fetchData = async () => {
               setLoading(true);
               setError(null);

               try {
                    const response = await customFetch('payroll/tax-configurations');
                    if (response?.status === 'success' && response?.statusCode === 200) {
                         setConfigs(response.result || []);
                    } else {
                         setError(response?.message || 'Failed to load tax configurations');
                    }
               } catch (fetchError: any) {
                    setError(fetchError?.message || 'Error loading tax reliefs');
               } finally {
                    setLoading(false);
               }
          };

          fetchData();
     }, []);

     if (loading) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading tax reliefs...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Tax Reliefs</h5>
                         <p className="text-muted px-3">{error}</p>
                         <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className={screens.page}>
               <div className={screens.header}>
                    <div>
                         <span className={screens.eyebrow}>Payroll / Statutory configuration</span>
<h1 className={screens.title}>
                              <RiShieldCheckLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                              Tax Reliefs
                         </h1>
                         <p className="text-muted mb-0">Choose a tax configuration, then create or manage reliefs for it.</p>
                    </div>
                    <Link href="/human-resource/payroll/tax-configurations/create" className="btn btn-outline-primary d-flex align-items-center">
                         <RiSettings3Line size={18} className="me-2" />
                         Create Tax Configuration
                    </Link>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-md-4">
                         <div className={screens.metric}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiShieldCheckLine size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Configurations Available</span>
                              </div>
                              <div className="fs-4 fw-bold">{configs.length}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className={screens.metric}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Active Configs</span>
                              </div>
                              <div className="fs-4 fw-bold">{configs.filter((config) => config.is_active).length}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className={screens.metric}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCloseCircleLine size={20} className="me-2 text-danger" />
                                   <span className="fw-medium text-muted small">Inactive Configs</span>
                              </div>
                              <div className="fs-4 fw-bold">{configs.filter((config) => !config.is_active).length}</div>
                         </div>
                    </div>
               </div>

               <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                         <div>
                              <h5 className="mb-1">Select a Tax Configuration</h5>
                              <p className="text-muted small mb-0">Tax reliefs are created under a tax configuration, so choose the year/country you want to manage.</p>
                         </div>
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-primary btn-sm d-flex align-items-center">
                              <RiFileListLine size={16} className="me-1" />
                              View Configurations
                         </Link>
                    </div>

                    <div className={screens.tableWrap}>
                         <table className={screens.table}>
                              <thead>
                                   <tr>
                                        <th className="text-start">Tax Year</th>
                                        <th className="text-start">Country</th>
                                        <th className="text-start">Status</th>
                                        <th className="text-start">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {configs.length > 0 ? (
                                        configs.map((config) => (
                                             <tr key={config.id}>
                                                  <td className="text-start fw-medium">{config.tax_year}</td>
                                                  <td className="text-start">{config.country}</td>
                                                  <td className="text-start">
                                                       {config.is_active ? (
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle">Active</span>
                                                       ) : (
                                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Inactive</span>
                                                       )}
                                                  </td>
                                                  <td className="text-start">
                                                       <div className="d-flex flex-wrap gap-2">
                                                            <Link href={`/human-resource/payroll/tax-configurations/${config.id}`} className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                                                                 <RiArrowRightLine size={14} className="me-1" />
                                                                 Open
                                                            </Link>
                                                            <Link href={`/human-resource/payroll/tax-configurations/${config.id}/reliefs/create`} className="btn btn-outline-primary btn-sm d-flex align-items-center">
                                                                 <RiAddLine size={14} className="me-1" />
                                                                 Add Relief
                                                            </Link>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))
                                   ) : (
                                        <tr>
                                             <td colSpan={4} className="text-center py-4 text-muted">
                                                  No tax configurations found.
                                             </td>
                                        </tr>
                                   )}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}
