'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
     RiMoneyDollarCircleLine,
     RiSearchLine,
     RiFilterLine,
     RiAddLine,
     RiEyeLine,
     RiEditLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiCheckboxCircleLine,
     RiCloseCircleLine,
     RiEyeOffLine
} from '@remixicon/react';

interface TaxBand {
     min: number;
     max: number | null;
     rate: number;
}

interface TaxConfiguration {
     id: number;
     tax_year: string;
     country: string;
     tax_bands: TaxBand[];
     is_active: boolean;
     created_by: number;
     created_by_name?: string | null;
     created_at: string;
     updated_at: string;
}

interface TaxConfigurationSummary {
     total_configs: number;
     active_configs: number;
     inactive_configs: number;
     countries_count: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';

export default function TaxConfigurationsPage() {
     const [configs, setConfigs] = useState<TaxConfiguration[]>([]);
     const [filteredConfigs, setFilteredConfigs] = useState<TaxConfiguration[]>([]);
     const [summary, setSummary] = useState<TaxConfigurationSummary | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
     const [countryFilter, setCountryFilter] = useState<string>('all');
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     useEffect(() => {
          fetchTaxConfigurations();
     }, []);

     useEffect(() => {
          filterConfigurations();
     }, [configs, searchTerm, statusFilter, countryFilter]);

     const fetchTaxConfigurations = async () => {
          try {
               setLoading(true);
               const response = await customFetch('payroll/tax-configurations');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const data = response.result || [];
                    setConfigs(data);
                    calculateSummary(data);
               } else {
                    setError('Failed to load tax configurations');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching tax configurations');
          } finally {
               setLoading(false);
          }
     };

     const calculateSummary = (data: TaxConfiguration[]) => {
          const total_configs = data.length;
          const active_configs = data.filter(c => c.is_active).length;
          const inactive_configs = total_configs - active_configs;
          const countries = new Set(data.map(c => c.country));
          const countries_count = countries.size;

          setSummary({
               total_configs,
               active_configs,
               inactive_configs,
               countries_count
          });
     };

     const filterConfigurations = () => {
          let filtered = configs;

          // Search filter
          if (searchTerm) {
               filtered = filtered.filter(config =>
                    config.tax_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    config.country.toLowerCase().includes(searchTerm.toLowerCase())
               );
          }

          // Status filter
          if (statusFilter !== 'all') {
               filtered = filtered.filter(config =>
                    statusFilter === 'active' ? config.is_active : !config.is_active
               );
          }

          // Country filter
          if (countryFilter !== 'all') {
               filtered = filtered.filter(config => config.country === countryFilter);
          }

          setFilteredConfigs(filtered);
     };

     const getUniqueCountries = () => {
          const countries = configs.map(config => config.country);
          return [...new Set(countries)];
     };

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading tax configurations...</p>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error}</p>
                         <button className="btn btn-primary mt-3" onClick={fetchTaxConfigurations}>
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
                    <div className="mb-3 mb-lg-0">
                         <h1 className="h3 fw-bold mb-1 d-flex align-items-center">
                              <RiMoneyDollarCircleLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                              Tax Configurations
                         </h1>
                         <p className="text-muted mb-0">Manage tax rates, brackets, and statutory deductions</p>
                    </div>
                    <Link href="/human-resource/payroll/tax-configurations/create" className="btn btn-primary d-flex align-items-center">
                         <RiAddLine size={18} className="me-1" />
                         Add Tax Configuration
                    </Link>
               </div>

               {/* Summary Cards */}
               {summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                                        <span className="fw-medium text-muted small">Total Configurations</span>
                                   </div>
                                   <div className="fs-4 fw-bold">{summary.total_configs}</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCheckboxCircleLine size={20} className="me-2 text-success" />
                                        <span className="fw-medium text-muted small">Active</span>
                                   </div>
                                   <div className="fs-4 fw-bold">{summary.active_configs}</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCloseCircleLine size={20} className="me-2 text-danger" />
                                        <span className="fw-medium text-muted small">Inactive</span>
                                   </div>
                                   <div className="fs-4 fw-bold">{summary.inactive_configs}</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiEyeLine size={20} className="me-2 text-info" />
                                        <span className="fw-medium text-muted small">Countries</span>
                                   </div>
                                   <div className="fs-4 fw-bold">{summary.countries_count}</div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3">
                         <div className="col-md-4">
                              <div className="input-group">
                                   <span className="input-group-text bg-transparent border-end-0">
                                        <RiSearchLine size={16} className="text-muted" />
                                   </span>
                                   <input
                                        type="text"
                                        className="form-control border-start-0 shadow-none"
                                        placeholder="Search by tax year or country..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                              </div>
                         </div>
                         <div className="col-md-4">
                              <select
                                   className="form-select"
                                   value={statusFilter}
                                   onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                              >
                                   <option value="all">All Status</option>
                                   <option value="active">Active Only</option>
                                   <option value="inactive">Inactive Only</option>
                              </select>
                         </div>
                         <div className="col-md-4">
                              <select
                                   className="form-select"
                                   value={countryFilter}
                                   onChange={(e) => setCountryFilter(e.target.value)}
                              >
                                   <option value="all">All Countries</option>
                                   {getUniqueCountries().map(country => (
                                        <option key={country} value={country}>{country}</option>
                                   ))}
                              </select>
                         </div>
                    </div>
               </div>

               {/* Table */}
               <div className="border rounded" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="table-responsive">
                         <table className="table table-hover table-sm mb-0">
                              <thead className="table-light">
                                   <tr>
                                        <th className="text-start">Tax Year</th>
                                        <th className="text-start">Country</th>
                                        <th className="text-start">Tax Bands</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-start">Created By</th>
                                        <th className="text-center">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {filteredConfigs.length === 0 ? (
                                        <tr>
                                             <td colSpan={6} className="text-center py-5">
                                                  <div className="d-flex flex-column align-items-center">
                                                       <RiEyeOffLine size={48} className="text-muted mb-3" />
                                                       <p className="text-muted mb-0">No tax configurations found</p>
                                                       {searchTerm || statusFilter !== 'all' || countryFilter !== 'all' ? (
                                                            <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => {
                                                                 setSearchTerm('');
                                                                 setStatusFilter('all');
                                                                 setCountryFilter('all');
                                                            }}>
                                                                 Clear Filters
                                                            </button>
                                                       ) : (
                                                            <Link href="/human-resource/payroll/tax-configurations/create" className="btn btn-primary mt-2">
                                                                 Create First Configuration
                                                            </Link>
                                                       )}
                                                  </div>
                                             </td>
                                        </tr>
                                   ) : (
                                        filteredConfigs.map((config) => (
                                             <tr key={config.id}>
                                                  <td className="fw-medium">{config.tax_year}</td>
                                                  <td>{config.country}</td>
                                                  <td>{config.tax_bands.length} bands</td>
                                                  <td className="text-center">
                                                       <span className={`badge ${config.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                            {config.is_active ? 'Active' : 'Inactive'}
                                                       </span>
                                                  </td>
                                                  <td>{config.created_by_name || `User ID: ${config.created_by}`}</td>
                                                  <td className="text-center">
                                                       <div className="btn-group btn-group-sm">
                                                            <Link
                                                                 href={`/human-resource/payroll/tax-configurations/${config.id}`}
                                                                 className="btn btn-outline-primary"
                                                                 title="View Details"
                                                            >
                                                                 <RiEyeLine size={16} />
                                                            </Link>
                                                            <Link
                                                                 href={`/human-resource/payroll/tax-configurations/${config.id}/edit`}
                                                                 className="btn btn-outline-secondary"
                                                                 title="Edit"
                                                            >
                                                                 <RiEditLine size={16} />
                                                            </Link>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))
                                   )}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}