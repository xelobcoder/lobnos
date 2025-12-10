'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge, Alert } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';
import Loader from '../../../components/isLoading';
import dayjs from 'dayjs';

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
                    const response = await customFetch('compliance/incidents/analytics?startDate=2020-01-01&endDate=2025-12-31&tenantId=1');
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
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="text-dark fw-medium mb-0">Compliance Analytics Dashboard</h2>
                         <small className="text-muted">Comprehensive insights into compliance incident management</small>
                    </div>
               </div>

               {/* Key Metrics Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Total Incidents</p>
                                             <h3 className="mb-0">{analyticsData.totalIncidents}</h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Open Incidents</p>
                                             <h3 className="mb-0">{analyticsData.openIncidents}</h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Avg Resolution Time</p>
                                             <h3 className="mb-0">{parseFloat(analyticsData.averageResolutionTime).toFixed(1)} days</h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Escalation Rate</p>
                                             <h3 className="mb-0">{analyticsData.escalationRate}%</h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Incident Breakdown */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <h6 className="mb-3 fw-bold">Incidents by Type</h6>
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
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <h6 className="mb-3 fw-bold">Incidents by Severity</h6>
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
               </div>

               {/* Additional Analytics */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <h6 className="mb-3 fw-bold">Incidents by Status</h6>
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
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <h6 className="mb-3 fw-bold">Incidents by Location</h6>
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
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <h6 className="mb-3 fw-bold">Incidents by Employee</h6>
                                   <div className="list-group list-group-flush">
                                        {analyticsData.incidentsByEmployee.map(employee => (
                                             <div key={employee.employee_id} className="list-group-item d-flex justify-content-between align-items-center">
                                                  Employee ID: {employee.employee_id}
                                                  <Badge bg="success">{employee.count}</Badge>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Regulatory Reporting Incidents</p>
                                             <h3 className="mb-0">{analyticsData.regulatoryReportingIncidents}</h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Trend Analysis */}
               <div className="border rounded p-3 mb-4">
                    <h5 className="mb-3">Trend Analysis - Systemic Issues</h5>
                    <div className="text-center py-4">
                         <div className="text-muted mb-2">📊</div>
                         <p className="text-muted">Systemic issues analysis not available from current API endpoint.</p>
                    </div>
               </div>

               {/* Monthly Incident Trends */}
               <div className="border rounded p-3">
                    <h5 className="mb-3">Monthly Incident Trends</h5>
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