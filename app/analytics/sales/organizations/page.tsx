"use client";

import React, { useEffect, useState, useCallback } from "react";
import { currencyFormatter ,customFetch} from "../../../../components/Auth/customFetch";

const IconOrganization = () => <span style={{ fontSize: '1.2rem', color: '#3B82F6', marginRight: '0.5rem' }}>🏢</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: '#3B82F6' }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconActive = () => <span style={{ fontSize: '0.8rem', color: '#10B981' }}>●</span>;
const IconInactive = () => <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>●</span>;
const IconView = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>👁️</span>;

// --- Color Palette ---
const COLOR_ACCENT = '#3B82F6'; // Blue accent
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_SUCCESS = '#10B981';
const COLOR_DANGER = '#EF4444';

interface OrganizationEntry {
     organizationId: number;
     name: string;
     status: string;
     totalCost: string;
     actual_revenue: string;
     accrued_revenue: string;
     total_discount: string;
     total_amount_refunded: string;
     created_date?: string;
     contact_info?: string;
     address?: string;
}

interface OrganizationStats {
     totalOrganizations: number;
     activeOrganizations: number;
     inactiveOrganizations: number;
     totalRevenue: number;
     totalCost: number;
     averageRevenue: number;
}

export default function OrganizationsAnalytics() {
     const [organizations, setOrganizations] = useState<OrganizationEntry[]>([]);
     const [stats, setStats] = useState<OrganizationStats | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState<string>('');
     const [statusFilter, setStatusFilter] = useState<string>('all');

     const fetchOrganizations = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               // Using the same API endpoint as the sales page for now
               const url = `financials/billing/summary?key=totalSalesByOrganization&startDate=2024-01-01&endDate=2024-12-31`;
               const response: OrganizationEntry[] = await customFetch(url);

               if (response && Array.isArray(response)) {
                    setOrganizations(response);

                    // Calculate stats
                    const totalRevenue = response.reduce((sum, org) => sum + parseFloat(org.actual_revenue || '0'), 0);
                    const totalCost = response.reduce((sum, org) => sum + parseFloat(org.totalCost || '0'), 0);
                    const activeOrgs = response.filter(org => org.status === 'active').length;

                    setStats({
                         totalOrganizations: response.length,
                         activeOrganizations: activeOrgs,
                         inactiveOrganizations: response.length - activeOrgs,
                         totalRevenue,
                         totalCost,
                         averageRevenue: response.length > 0 ? totalRevenue / response.length : 0
                    });
               } else {
                    setOrganizations([]);
                    setError((response as any)?.message || "Failed to fetch organizations data.");
               }
          } catch (err) {
               setOrganizations([]);
               setError(err instanceof Error ? err.message : "An unknown error occurred");
               console.error("Error fetching organizations:", err);
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          fetchOrganizations();
     }, [fetchOrganizations]);

     const handleViewDetails = (organization: OrganizationEntry) => {
          alert(`Organization Details for ${organization.name}:\n\nStatus: ${organization.status}\nTotal Cost: ${currencyFormatter.format(parseFloat(organization.totalCost))}\nActual Revenue: ${currencyFormatter.format(parseFloat(organization.actual_revenue))}\nAccrued Revenue: ${currencyFormatter.format(parseFloat(organization.accrued_revenue))}\nDiscount: ${currencyFormatter.format(parseFloat(organization.total_discount))}\nRefunded: ${currencyFormatter.format(parseFloat(organization.total_amount_refunded))}`);
     };

     const filteredOrganizations = organizations.filter(org => {
          const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
          return matchesSearch && matchesStatus;
     });

     const renderStatsCards = () => {
          if (!stats) return null;

          return (
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <h3 className="card-title text-primary">{stats.totalOrganizations}</h3>
                                   <p className="card-text text-muted">Total Organizations</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <h3 className="card-title text-success">{stats.activeOrganizations}</h3>
                                   <p className="card-text text-muted">Active Organizations</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <h3 className="card-title text-info">{currencyFormatter.format(stats.totalRevenue)}</h3>
                                   <p className="card-text text-muted">Total Revenue</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <h3 className="card-title text-warning">{currencyFormatter.format(stats.averageRevenue)}</h3>
                                   <p className="card-text text-muted">Average Revenue</p>
                              </div>
                         </div>
                    </div>
               </div>
          );
     };

     if (loading) {
          return (
               <div className="container-fluid py-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <IconLoader />
                         <span className="ms-3">Loading organizations...</span>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid py-4">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                         <IconError />
                         <div className="ms-3">
                              <h5 className="alert-heading mb-1">Error Loading Data</h5>
                              <p className="mb-0">{error}</p>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid py-4">
               <div className="d-flex align-items-center mb-4">
                    <IconOrganization />
                    <h1 className="h3 mb-0">Organizations Analytics</h1>
               </div>

               {renderStatsCards()}

               <div className="card">
                    <div className="card-header">
                         <div className="d-flex justify-content-between align-items-center">
                              <h5 className="card-title mb-0">Organization Directory</h5>
                              <div className="d-flex gap-2">
                                   <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search organizations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '200px' }}
                                   />
                                   <select
                                        className="form-select form-select-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ width: '120px' }}
                                   >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                   </select>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-0">
                         {filteredOrganizations.length === 0 ? (
                              <div className="text-center py-5">
                                   <IconEmpty />
                                   <h5 className="mt-3 text-muted">No organizations found</h5>
                                   <p className="text-muted">Try adjusting your search or filter criteria.</p>
                              </div>
                         ) : (
                              <div className="table-responsive">
                                   <table className="table table-hover table-striped mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="py-3 px-4">Organization</th>
                                                  <th className="py-3 px-4">Status</th>
                                                  <th className="py-3 px-4 text-end">Total Cost</th>
                                                  <th className="py-3 px-4 text-end">Actual Revenue</th>
                                                  <th className="py-3 px-4 text-end">Accrued Revenue</th>
                                                  <th className="py-3 px-4 text-end">Discount</th>
                                                  <th className="py-3 px-4 text-end">Refunded</th>
                                                  <th className="py-3 px-4">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {filteredOrganizations.map((org) => (
                                                  <tr key={org.organizationId}>
                                                       <td className="py-3 px-4">
                                                            <div className="d-flex align-items-center">
                                                                 <div>
                                                                      <div className="fw-medium">{org.name}</div>
                                                                      <small className="text-muted">ID: {org.organizationId}</small>
                                                                 </div>
                                                            </div>
                                                       </td>
                                                       <td className="py-3 px-4">
                                                            <span className={`badge ${org.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                                 {org.status === 'active' ? <><IconActive /> Active</> : <><IconInactive /> Inactive</>}
                                                            </span>
                                                       </td>
                                                       <td className="py-3 px-4 text-end">{currencyFormatter.format(parseFloat(org.totalCost))}</td>
                                                       <td className="py-3 px-4 text-end">{currencyFormatter.format(parseFloat(org.actual_revenue))}</td>
                                                       <td className="py-3 px-4 text-end fw-medium">{currencyFormatter.format(parseFloat(org.accrued_revenue))}</td>
                                                       <td className="py-3 px-4 text-end">{currencyFormatter.format(parseFloat(org.total_discount))}</td>
                                                       <td className="py-3 px-4 text-end">{currencyFormatter.format(parseFloat(org.total_amount_refunded))}</td>
                                                       <td className="py-3 px-4">
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={() => handleViewDetails(org)}
                                                                 title={`View details for ${org.name}`}
                                                            >
                                                                 <IconView /> View
                                                            </button>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
                    <div className="card-footer text-muted">
                         <small>Showing {filteredOrganizations.length} of {organizations.length} organizations</small>
                    </div>
               </div>
          </div>
     );
}