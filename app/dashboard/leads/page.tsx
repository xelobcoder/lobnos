"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     Cell,
     LineChart,
     Line,
     PieChart,
     Pie,
     Area,
     AreaChart,
} from "recharts";
import { customFetch } from "../../../components/Auth/customFetch";
import {
     RiUserAddLine,
     RiErrorWarningLine,
     RiCalendarEventLine,
     RiInbox2Line,
     RiLoader4Line,
     RiRefreshLine,
     RiFileList3Line,
     RiMoneyDollarCircleLine,
     RiCheckboxCircleLine,
     RiLineChartLine,
     RiPercentLine,
     RiAlertLine,
     RiUserLine,
     RiBuildingLine,
     RiPhoneLine,
     RiMailLine,
     RiTimeLine,
     RiBarChartLine,
     RiPieChartLine,
     RiCalendarLine,
     RiCheckLine,
     RiEyeLine,
     RiEditLine,
     RiDeleteBinLine
} from '@remixicon/react';

interface LeadDashboardData {
     totalLeads: number;
     newLeads: number;
     qualifiedLeads: number;
     convertedLeads: number;
     lostLeads: number;
     conversionRate: number;
     averageLeadValue: number;
     leadsByStatus: Array<{
          status: string;
          count: number;
          percentage: number;
     }>;
     leadsBySource: Array<{
          source: string;
          count: number;
          conversionRate: number;
     }>;
     recentLeads: Array<{
          id: string;
          name: string;
          company: string;
          status: string;
          priority: string;
          created_at: string;
          value: number;
     }>;
     upcomingFollowUps: Array<{
          id: string;
          name: string;
          company: string;
          next_followup: string;
          type: string;
          priority: string;
     }>;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const CHART_COLORS = [
     'oklch(0.646 0.222 41.116)', // Primary
     'oklch(0.6 0.118 184.704)',  // Blue
     'oklch(0.828 0.189 84.429)', // Green
     'oklch(0.769 0.188 70.08)',   // Orange
     'oklch(0.398 0.07 227.392)',  // Purple
     'oklch(0.7 0.2 20)',          // Red
     'oklch(0.5 0.15 280)',        // Pink
     'oklch(0.8 0.1 120)',         // Teal
];

const STATUS_COLORS = {
     new: 'oklch(0.6 0.118 184.704)',
     contacted: 'oklch(0.769 0.188 70.08)',
     qualified: 'oklch(0.828 0.189 84.429)',
     proposal: 'oklch(0.5 0.15 280)',
     negotiation: 'oklch(0.398 0.07 227.392)',
     closed_won: 'oklch(0.646 0.222 41.116)',
     closed_lost: 'oklch(0.7 0.2 20)',
};

export default function LeadsDashboard() {
     const [data, setData] = useState<LeadDashboardData | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     const fetchData = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               // Simulate API call - replace with actual endpoint
               const mockData: LeadDashboardData = {
                    totalLeads: 245,
                    newLeads: 45,
                    qualifiedLeads: 89,
                    convertedLeads: 67,
                    lostLeads: 23,
                    conversionRate: 27.3,
                    averageLeadValue: 12500,
                    leadsByStatus: [
                         { status: 'new', count: 45, percentage: 18.4 },
                         { status: 'contacted', count: 52, percentage: 21.2 },
                         { status: 'qualified', count: 89, percentage: 36.3 },
                         { status: 'proposal', count: 34, percentage: 13.9 },
                         { status: 'negotiation', count: 15, percentage: 6.1 },
                         { status: 'closed_won', count: 67, percentage: 27.3 },
                         { status: 'closed_lost', count: 23, percentage: 9.4 },
                    ],
                    leadsBySource: [
                         { source: 'website', count: 85, conversionRate: 32.9 },
                         { source: 'referral', count: 62, conversionRate: 41.9 },
                         { source: 'trade_show', count: 38, conversionRate: 18.4 },
                         { source: 'social_media', count: 29, conversionRate: 13.8 },
                         { source: 'cold_call', count: 31, conversionRate: 9.7 },
                    ],
                    recentLeads: [
                         {
                              id: '1',
                              name: 'John Smith',
                              company: 'Tech Solutions Inc',
                              status: 'qualified',
                              priority: 'high',
                              created_at: '2025-11-01',
                              value: 25000
                         },
                         {
                              id: '2',
                              name: 'Sarah Johnson',
                              company: 'BioTech Research',
                              status: 'contacted',
                              priority: 'medium',
                              created_at: '2025-10-30',
                              value: 18000
                         },
                         {
                              id: '3',
                              name: 'Mike Davis',
                              company: 'Pharma Corp',
                              status: 'new',
                              priority: 'low',
                              created_at: '2025-10-29',
                              value: 15000
                         },
                         {
                              id: '4',
                              name: 'Lisa Chen',
                              company: 'MedTech Solutions',
                              status: 'proposal',
                              priority: 'high',
                              created_at: '2025-10-28',
                              value: 35000
                         },
                         {
                              id: '5',
                              name: 'David Wilson',
                              company: 'Health Systems Ltd',
                              status: 'qualified',
                              priority: 'medium',
                              created_at: '2025-10-27',
                              value: 22000
                         },
                    ],
                    upcomingFollowUps: [
                         {
                              id: '1',
                              name: 'John Smith',
                              company: 'Tech Solutions Inc',
                              next_followup: '2025-11-03',
                              type: 'call',
                              priority: 'high'
                         },
                         {
                              id: '2',
                              name: 'Sarah Johnson',
                              company: 'BioTech Research',
                              next_followup: '2025-11-02',
                              type: 'email',
                              priority: 'medium'
                         },
                         {
                              id: '4',
                              name: 'Lisa Chen',
                              company: 'MedTech Solutions',
                              next_followup: '2025-11-05',
                              type: 'meeting',
                              priority: 'high'
                         },
                    ],
               };

               // Simulate API delay
               await new Promise(resolve => setTimeout(resolve, 1000));
               setData(mockData);
          } catch (err) {
               setData(null);
               setError(err instanceof Error ? err.message : "An unknown error occurred");
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          fetchData();
     }, [fetchData]);

     const formatCurrency = (value: number) => {
          return new Intl.NumberFormat('en-US', {
               style: 'currency',
               currency: 'USD',
               minimumFractionDigits: 0,
               maximumFractionDigits: 0,
          }).format(value);
     };

     const getStatusBadge = (status: string) => {
          const statusClasses = {
               new: 'badge bg-primary',
               contacted: 'badge bg-info',
               qualified: 'badge bg-warning',
               proposal: 'badge bg-secondary',
               negotiation: 'badge bg-info',
               closed_won: 'badge bg-success',
               closed_lost: 'badge bg-danger'
          };
          return statusClasses[status as keyof typeof statusClasses] || 'badge bg-secondary';
     };

     const getPriorityBadge = (priority: string) => {
          const priorityClasses = {
               low: 'badge bg-light text-dark',
               medium: 'badge bg-warning',
               high: 'badge bg-danger',
               urgent: 'badge bg-dark'
          };
          return priorityClasses[priority as keyof typeof priorityClasses] || 'badge bg-light text-dark';
     };

     const isOverdue = (nextFollowupDate: string) => {
          const today = new Date();
          const followupDate = new Date(nextFollowupDate);
          return followupDate < today;
     };

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading leads dashboard...</p>
               </div>
          );
     }

     if (error || !data) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                    <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                    <h5 className="fw-medium mb-1">Error Loading Dashboard</h5>
                    <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error || "No data available"}</p>
                    <button className="btn btn-primary mt-3" onClick={fetchData}>
                         <RiRefreshLine size={16} className="me-2" />
                         Try Again
                    </button>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="text-dark fw-medium mb-0">Leads Dashboard</h2>
                         <small className="text-muted">Quick overview of your lead management performance</small>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary" onClick={fetchData}>
                              <RiRefreshLine size={16} className="me-1" />
                              Refresh
                         </button>
                         <a href="/crm/leads/list" className="btn btn-primary">
                              <RiUserLine size={16} className="me-1" />
                              View All Leads
                         </a>
                    </div>
               </div>

               {/* Key Metrics Row */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body text-center">
                                   <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                        <RiUserLine size={32} className="text-primary" />
                                   </div>
                                   <h3 className="mb-1">{data.totalLeads}</h3>
                                   <p className="text-muted mb-0 small">Total Leads</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body text-center">
                                   <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                        <RiBarChartLine size={32} className="text-success" />
                                   </div>
                                   <h3 className="mb-1">{data.conversionRate}%</h3>
                                   <p className="text-muted mb-0 small">Conversion Rate</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body text-center">
                                   <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                        <RiUserAddLine size={32} className="text-warning" />
                                   </div>
                                   <h3 className="mb-1">{data.qualifiedLeads}</h3>
                                   <p className="text-muted mb-0 small">Qualified Leads</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body text-center">
                                   <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                        <RiMoneyDollarCircleLine size={32} className="text-info" />
                                   </div>
                                   <h3 className="mb-1">{formatCurrency(data.averageLeadValue)}</h3>
                                   <p className="text-muted mb-0 small">Avg Lead Value</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Charts and Tables Row */}
               <div className="row g-4 mb-4">
                    {/* Lead Status Overview */}
                    <div className="col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light border-0">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiPieChartLine size={18} className="me-2 text-primary" />
                                        Lead Status Distribution
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                             <Pie
                                                  data={data.leadsByStatus}
                                                  cx="50%"
                                                  cy="50%"
                                                  outerRadius={70}
                                                  dataKey="count"
                                                  label={({ status, percentage }) => `${status.replace('_', ' ')} (${percentage}%)`}
                                             >
                                                  {data.leadsByStatus.map((entry, index) => (
                                                       <Cell
                                                            key={`cell-${index}`}
                                                            fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || CHART_COLORS[index % CHART_COLORS.length]}
                                                       />
                                                  ))}
                                             </Pie>
                                             <Tooltip />
                                        </PieChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>

                    {/* Source Performance */}
                    <div className="col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light border-0">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiBarChartLine size={18} className="me-2 text-success" />
                                        Leads by Source
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={data.leadsBySource} layout="horizontal">
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis type="number" />
                                             <YAxis dataKey="source" type="category" width={100} />
                                             <Tooltip />
                                             <Bar dataKey="count" fill={CHART_COLORS[1]} />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Recent Activity Row */}
               <div className="row g-4">
                    {/* Recent Leads */}
                    <div className="col-lg-8">
                         <div className="card border-0 shadow-sm">
                              <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiFileList3Line size={18} className="me-2 text-info" />
                                        Recent Leads
                                   </h6>
                                   <a href="/crm/leads/list" className="btn btn-sm btn-outline-primary">
                                        View All
                                   </a>
                              </div>
                              <div className="card-body p-0">
                                   <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th>Name</th>
                                                       <th>Company</th>
                                                       <th>Status</th>
                                                       <th>Priority</th>
                                                       <th>Value</th>
                                                       <th>Created</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.recentLeads.map((lead) => (
                                                       <tr key={lead.id}>
                                                            <td className="fw-medium">{lead.name}</td>
                                                            <td>{lead.company}</td>
                                                            <td>
                                                                 <span className={`badge ${getStatusBadge(lead.status)}`}>
                                                                      {lead.status.replace('_', ' ')}
                                                                 </span>
                                                            </td>
                                                            <td>
                                                                 <span className={`badge ${getPriorityBadge(lead.priority)}`}>
                                                                      {lead.priority}
                                                                 </span>
                                                            </td>
                                                            <td className="fw-medium">{formatCurrency(lead.value)}</td>
                                                            <td className="text-muted small">
                                                                 {new Date(lead.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                 <div className="btn-group btn-group-sm">
                                                                      <button className="btn btn-outline-primary btn-sm" title="View">
                                                                           <RiEyeLine size={14} />
                                                                      </button>
                                                                      <button className="btn btn-outline-secondary btn-sm" title="Edit">
                                                                           <RiEditLine size={14} />
                                                                      </button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Upcoming Follow-ups */}
                    <div className="col-lg-4">
                         <div className="card border-0 shadow-sm">
                              <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiCalendarLine size={18} className="me-2 text-warning" />
                                        Upcoming Follow-ups
                                   </h6>
                                   <a href="/crm/leads/follow-up" className="btn btn-sm btn-outline-primary">
                                        View All
                                   </a>
                              </div>
                              <div className="card-body">
                                   {data.upcomingFollowUps.length === 0 ? (
                                        <div className="text-center py-4">
                                             <RiInbox2Line size={32} className="text-muted mb-2" />
                                             <p className="text-muted small mb-0">No upcoming follow-ups</p>
                                        </div>
                                   ) : (
                                        <div className="space-y-3">
                                             {data.upcomingFollowUps.map((followup) => (
                                                  <div key={followup.id} className="d-flex align-items-start p-3 border rounded">
                                                       <div className="flex-shrink-0 me-3">
                                                            <div className={`p-2 rounded-circle ${followup.type === 'call' ? 'bg-primary bg-opacity-10' :
                                                                      followup.type === 'email' ? 'bg-info bg-opacity-10' :
                                                                           'bg-success bg-opacity-10'
                                                                 }`}>
                                                                 {followup.type === 'call' ? <RiPhoneLine size={16} className="text-primary" /> :
                                                                      followup.type === 'email' ? <RiMailLine size={16} className="text-info" /> :
                                                                           <RiCalendarLine size={16} className="text-success" />}
                                                            </div>
                                                       </div>
                                                       <div className="flex-grow-1">
                                                            <h6 className="mb-1 small fw-medium">{followup.name}</h6>
                                                            <p className="mb-1 small text-muted">{followup.company}</p>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                 <small className={`text-muted ${isOverdue(followup.next_followup) ? 'text-danger fw-medium' : ''
                                                                      }`}>
                                                                      {new Date(followup.next_followup).toLocaleDateString()}
                                                                      {isOverdue(followup.next_followup) && ' (Overdue)'}
                                                                 </small>
                                                                 <span className={`badge ${getPriorityBadge(followup.priority)}`}>
                                                                      {followup.priority}
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
          </div>
     );
}