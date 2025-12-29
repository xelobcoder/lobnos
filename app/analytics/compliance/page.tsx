'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge, Alert } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';
import Loader from '../../../components/isLoading';
import dayjs from 'dayjs';
import { RiBarChartBoxLine, RiAlertLine, RiCheckLine, RiTimeLine, RiUserLine, RiMapPinLine, RiShieldLine, RiRefreshLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface ComplianceAnalyticsData {
     totalIncidents: number;
     incidentsByType: Array<{
          type: string;
          count: number;
          percentage: string;
     }>;
     incidentsBySeverity: Array<{
          severity: string;
          count: number;
          percentage: string;
     }>;
     incidentsByStatus: Array<{
          status: string;
          count: number;
          percentage: string;
     }>;
     monthlyIncidentTrend: Array<{
          month: string;
          incidents: number;
     }>;
     averageResolutionTime: string;
     openIncidents: number;
     incidentsByLocation: Array<{
          location: string;
          count: number;
     }>;
     incidentsByEmployee: Array<{
          employee_id: number;
          employee_name: string;
          employee_email: string;
          count: number;
     }>;
     regulatoryReportingIncidents: number;
     escalationRate: string;
     averageTimeToResolution: string;
}

const incidentTypes = [
     { value: 'patient-safety', label: 'Patient Safety', description: 'Wrong results, delayed reporting, misidentified samples' },
     { value: 'quality', label: 'Quality', description: 'Equipment failures, reagent issues, procedural errors' },
     { value: 'security', label: 'Security', description: 'Data breaches, unauthorized access, system failures' },
     { value: 'compliance', label: 'Compliance', description: 'Regulatory violations, documentation errors' }
];

const severityLevels = [
     { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
     { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
     { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
     { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export default function ComplianceAnalyticsPage() {
     const [analyticsData, setAnalyticsData] = useState<ComplianceAnalyticsData | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchAnalyticsData = async () => {
               try {
                    setLoading(true);
                    const currentYear = new Date().getFullYear();
                    const response = await customFetch(`compliance/incidents/analytics?startDate=${currentYear}-01-01&endDate=${currentYear}-12-31&tenantId=1`);
                    setAnalyticsData(response);
               } catch (error) {
                    setAnalyticsData(null);
                    console.error('Failed to load compliance analytics');
               } finally {
                    setLoading(false);
               }
          };
          fetchAnalyticsData();
     }, []);

     if (loading) return <Loader />;

     if (!analyticsData) {
          return (
               <div className="container-fluid p-3">
                    <div className="text-center py-5">
                         <p className="text-muted">No analytics data available</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiShieldLine className="me-2" />
                              Compliance Analytics Dashboard
                         </h2>
                         <p className="text-muted mb-0">Comprehensive insights into compliance incident management</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => window.location.reload()}
                         >
                              <RiRefreshLine className="me-1" />
                              Refresh Data
                         </button>
                    </div>
               </div>

               {/* Key Metrics Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiShieldLine size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Total Incidents</span>
                              </div>
                              <div className="fs-4 fw-bold text-primary">{analyticsData.totalIncidents}</div>
                              <div className="small text-muted">Reported incidents</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiAlertLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Open Incidents</span>
                              </div>
                              <div className="fs-4 fw-bold text-warning">{analyticsData.openIncidents}</div>
                              <div className="small text-muted">Under investigation</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiTimeLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Avg Resolution Time</span>
                              </div>
                              <div className="fs-4 fw-bold text-info">{parseFloat(analyticsData.averageResolutionTime).toFixed(1)} days</div>
                              <div className="small text-muted">Time to resolve</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiBarChartBoxLine size={20} className="me-2 text-danger" />
                                   <span className="fw-medium text-muted small">Escalation Rate</span>
                              </div>
                              <div className="fs-4 fw-bold text-danger">{analyticsData.escalationRate}%</div>
                              <div className="small text-muted">Incidents escalated</div>
                         </div>
                    </div>
               </div>

               {/* Incident Breakdown */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiShieldLine size={20} className="me-2 text-primary" />
                                   Incidents by Type
                              </h6>
                              <div className="list-group list-group-flush">
                                   {analyticsData.incidentsByType.map(type => (
                                        <div key={type.type} className="list-group-item d-flex justify-content-between align-items-center">
                                             {type.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                             <div className="d-flex align-items-center gap-2">
                                                  <Badge bg="primary">{type.count}</Badge>
                                                  <small className="text-muted">{type.percentage}%</small>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiAlertLine size={20} className="me-2 text-warning" />
                                   Incidents by Severity
                              </h6>
                              <div className="list-group list-group-flush">
                                   {analyticsData.incidentsBySeverity.map(severity => (
                                        <div key={severity.severity} className="list-group-item d-flex justify-content-between align-items-center">
                                             {severity.severity.charAt(0).toUpperCase() + severity.severity.slice(1)}
                                             <div className="d-flex align-items-center gap-2">
                                                  <Badge bg={severity.severity === 'low' ? 'primary' : severity.severity === 'medium' ? 'warning' : severity.severity === 'high' ? 'danger' : 'dark'}>{severity.count}</Badge>
                                                  <small className="text-muted">{severity.percentage}%</small>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Additional Analytics */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiCheckLine size={20} className="me-2 text-success" />
                                   Incidents by Status
                              </h6>
                              <div className="list-group list-group-flush">
                                   {analyticsData.incidentsByStatus.map(status => (
                                        <div key={status.status} className="list-group-item d-flex justify-content-between align-items-center">
                                             {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                             <div className="d-flex align-items-center gap-2">
                                                  <Badge bg="secondary">{status.count}</Badge>
                                                  <small className="text-muted">{status.percentage}%</small>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiMapPinLine size={20} className="me-2 text-info" />
                                   Incidents by Location
                              </h6>
                              <div className="list-group list-group-flush">
                                   {analyticsData.incidentsByLocation.map(location => (
                                        <div key={location.location} className="list-group-item d-flex justify-content-between align-items-center">
                                             <span className="text-truncate" style={{ maxWidth: '200px' }} title={location.location}>
                                                  {location.location}
                                             </span>
                                             <Badge bg="info">{location.count}</Badge>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiUserLine size={20} className="me-2 text-primary" />
                                   Incidents by Employee
                              </h6>
                              <div className="list-group list-group-flush">
                                   {analyticsData.incidentsByEmployee.map(employee => (
                                        <div key={employee.employee_id} className="list-group-item d-flex justify-content-between align-items-center">
                                             <div>
                                                  <div className="fw-medium">{employee.employee_name}</div>
                                                  <small className="text-muted">{employee.employee_email}</small>
                                             </div>
                                             <Badge bg="success">{employee.count}</Badge>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiShieldLine size={20} className="me-2 text-danger" />
                                   Regulatory Compliance
                              </h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                   <span className="small">Regulatory Reporting Incidents</span>
                                   <span className="badge bg-danger">{analyticsData.regulatoryReportingIncidents}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                   <span className="small">Average Time to Resolution</span>
                                   <span className="badge bg-info">{parseFloat(analyticsData.averageTimeToResolution).toFixed(1)} days</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                   <span className="small">Compliance Health</span>
                                   <span className="badge bg-success">Good</span>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Trend Analysis */}
               <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <h5 className="mb-3 d-flex align-items-center">
                         <RiBarChartBoxLine size={20} className="me-2 text-primary" />
                         Trend Analysis - Systemic Issues
                    </h5>
                    <div className="text-center py-4">
                         <div className="text-muted mb-2">📊</div>
                         <p className="text-muted">Systemic issues analysis not available from current API endpoint.</p>
                    </div>
               </div>

               {/* Monthly Incident Trends */}
               <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <h5 className="mb-3 d-flex align-items-center">
                         <RiTimeLine size={20} className="me-2 text-info" />
                         Monthly Incident Trends
                    </h5>
                    <div className="table-responsive">
                         <table className="table table-striped">
                              <thead>
                                   <tr>
                                        <th>Month</th>
                                        <th>Total Incidents</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {analyticsData?.monthlyIncidentTrend && analyticsData.monthlyIncidentTrend.map((month, index) => (
                                        <tr key={index}>
                                             <td>{month.month}</td>
                                             <td>{month.incidents}</td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}