'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Alert } from 'react-bootstrap';
import { customFetch } from '../../../components/Auth/customFetch';
import Loader from '../../../components/isLoading';
import dayjs from 'dayjs';

interface TrendAnalysis {
     title: string;
     description: string;
     frequency: number;
     impact: string;
}

interface MonthlyTrend {
     month: string;
     total: number;
     byType: Record<string, number>;
     trend: string;
}

interface Incident {
     id: number;
     type: 'patient-safety' | 'quality' | 'security' | 'compliance';
     title: string;
     description: string;
     severity: 'low' | 'medium' | 'high' | 'critical';
     status: 'reported' | 'investigating' | 'root-cause-analysis' | 'corrective-actions' | 'resolved' | 'closed';
     employeeId: number;
     reportedByUsername?: string;
     reportedByEmail?: string;
     reportedByRole?: string;
     reportedAt: string;
     affectedParties?: string;
     location?: string;
     immediateActions?: string;
     rootCause?: string;
     rootCauseAnalysis?: {
          what: string;
          why: string;
          when: string;
          where: string;
          who: string;
          how: string;
     };
     correctiveActions?: string;
     correctiveActionPlan?: {
          actions: string[];
          responsible: string[];
          deadlines: string[];
          status: string[];
     };
     regulatoryReporting?: boolean;
     regulatoryBodies?: string[];
     escalatedTo?: string[];
     followUpDate?: string;
     resolutionDate?: string;
     attachments?: string[];
     investigationNotes?: string[];
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
     const [incidents, setIncidents] = useState<Incident[]>([]);
     const [loading, setLoading] = useState(true);

     // Fetch incidents from API
     useEffect(() => {
          const fetchIncidents = async () => {
               try {
                    setLoading(true);
                    const response = await customFetch('compliance/incidents?page=1&count=1000'); // Get more data for analytics
                    if (Array.isArray(response)) {
                         setIncidents(response);
                    } else {
                         setIncidents([]);
                    }
               } catch (error) {
                    setIncidents([]);
                    console.error('Failed to load incidents for analytics');
               } finally {
                    setLoading(false);
               }
          };
          fetchIncidents();
     }, []);

     const getTrendAnalysis = (): TrendAnalysis[] => {
          const trends: TrendAnalysis[] = [];
          const totalIncidents = incidents.length;

          // Analyze incident types for patterns
          const typeCounts = incidentTypes.map(type => ({
               type: type.value,
               count: incidents.filter(i => i.type === type.value).length,
               percentage: totalIncidents > 0 ? (incidents.filter(i => i.type === type.value).length / totalIncidents) * 100 : 0
          }));

          // Check for dominant incident types (>30% of total)
          const dominantTypes = typeCounts.filter(t => t.percentage > 30);
          if (dominantTypes.length > 0) {
               dominantTypes.forEach(type => {
                    const typeInfo = incidentTypes.find(t => t.value === type.type);
                    trends.push({
                         title: `High Frequency: ${typeInfo?.label} Incidents`,
                         description: `${type.percentage.toFixed(1)}% of all incidents are ${typeInfo?.label.toLowerCase()}. This may indicate systemic issues in ${typeInfo?.description.toLowerCase()}.`,
                         frequency: type.count,
                         impact: 'High'
                    });
               });
          }

          // Analyze severity patterns
          const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
          const criticalPercentage = totalIncidents > 0 ? (criticalIncidents / totalIncidents) * 100 : 0;

          if (criticalPercentage > 20) {
               trends.push({
                    title: 'High Critical Incident Rate',
                    description: `${criticalPercentage.toFixed(1)}% of incidents are classified as critical. This suggests potential safety or quality control issues requiring immediate attention.`,
                    frequency: criticalIncidents,
                    impact: 'Critical'
               });
          }

          // Analyze locations for patterns
          const locationCounts = incidents.reduce((acc, incident) => {
               if (incident.location) {
                    acc[incident.location] = (acc[incident.location] || 0) + 1;
               }
               return acc;
          }, {} as Record<string, number>);

          const highRiskLocations: [string, number][] = Object.entries(locationCounts)
               .filter(([location, count]: [string, number]) => count >= 3)
               .sort(([, a]: [string, number], [, b]: [string, number]) => b - a);

          if (highRiskLocations.length > 0) {
               highRiskLocations.forEach(([location, count]: [string, number]) => {
                    trends.push({
                         title: `Location Concentration: ${location}`,
                         description: `${count} incidents have occurred in ${location}. This location may require additional training, equipment upgrades, or process improvements.`,
                         frequency: count,
                         impact: 'Medium'
                    });
               });
          }

          // Analyze recurring issues (similar titles/descriptions)
          const titlePatterns = incidents.reduce((acc, incident) => {
               const words = incident.title.toLowerCase().split(' ');
               words.forEach(word => {
                    if (word.length > 3) { // Only consider meaningful words
                         acc[word] = (acc[word] || 0) + 1;
                    }
               });
               return acc;
          }, {} as Record<string, number>);

          const recurringWords: [string, number][] = Object.entries(titlePatterns)
               .filter(([word, count]: [string, number]) => count >= 3 && !['test', 'results', 'patient', 'sample', 'error'].includes(word))
               .sort(([, a]: [string, number], [, b]: [string, number]) => b - a);

          if (recurringWords.length > 0) {
               recurringWords.slice(0, 2).forEach(([word, count]: [string, number]) => {
                    trends.push({
                         title: `Recurring Issue: "${word}"`,
                         description: `The term "${word}" appears in ${count} incident titles. This may indicate a recurring problem requiring systemic solutions.`,
                         frequency: count,
                         impact: 'Medium'
                    });
               });
          }

          return trends;
     };

     const getMonthlyTrends = (): MonthlyTrend[] => {
          const monthlyData: MonthlyTrend[] = [];
          const now = new Date();

          // Generate last 6 months
          for (let i = 5; i >= 0; i--) {
               const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
               const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
               const monthIncidents = incidents.filter(incident => {
                    const incidentDate = new Date(incident.reportedAt);
                    return incidentDate.getMonth() === date.getMonth() && incidentDate.getFullYear() === date.getFullYear();
               });

               const byType = monthIncidents.reduce((acc, incident) => {
                    acc[incident.type] = (acc[incident.type] || 0) + 1;
                    return acc;
               }, {} as Record<string, number>);

               // Simple trend calculation (compare with previous month)
               let trend = 'stable';
               if (i < 5) {
                    const prevMonth = monthlyData[monthlyData.length - 1];
                    if (prevMonth && monthIncidents.length > prevMonth.total * 1.2) {
                         trend = 'increasing';
                    } else if (prevMonth && monthIncidents.length < prevMonth.total * 0.8) {
                         trend = 'decreasing';
                    }
               }

               monthlyData.push({
                    month: monthName,
                    total: monthIncidents.length,
                    byType,
                    trend
               });
          }

          return monthlyData;
     };

     if (loading) return <Loader />;

     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="card-title fs-5 fw-bold text-dark">Compliance Analytics Dashboard</h2>
                                   </div>
                                   <div className="flex-grow-1">
                                        <Row className="mb-4">
                                             <Col md={4}>
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Total Incidents</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <h2 className="mb-0">{incidents.length}</h2>
                                                       </Card.Body>
                                                  </Card>
                                             </Col>
                                             <Col md={4}>
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Open Investigations</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <h2 className="mb-0">
                                                                 {incidents.filter(i => i.status === 'investigating').length}
                                                            </h2>
                                                       </Card.Body>
                                                  </Card>
                                             </Col>
                                             <Col md={4}>
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Critical Incidents</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <h2 className="mb-0">
                                                                 {incidents.filter(i => i.severity === 'critical').length}
                                                            </h2>
                                                       </Card.Body>
                                                  </Card>
                                             </Col>
                                        </Row>

                                        <Row className="mb-4">
                                             <Col md={6}>
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Incidents by Type</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <div className="list-group list-group-flush">
                                                                 {incidentTypes.map(type => {
                                                                      const count = incidents.filter(i => i.type === type.value).length;
                                                                      const percentage = incidents.length > 0 ? ((count / incidents.length) * 100).toFixed(1) : '0';
                                                                      return (
                                                                           <div key={type.value} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                {type.label}
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                     <Badge bg="primary">{count}</Badge>
                                                                                     <small className="text-muted">{percentage}%</small>
                                                                                </div>
                                                                           </div>
                                                                      );
                                                                 })}
                                                            </div>
                                                       </Card.Body>
                                                  </Card>
                                             </Col>
                                             <Col md={6}>
                                                  <Card>
                                                       <Card.Header>
                                                            <Card.Title>Incidents by Severity</Card.Title>
                                                       </Card.Header>
                                                       <Card.Body>
                                                            <div className="list-group list-group-flush">
                                                                 {severityLevels.map(level => {
                                                                      const count = incidents.filter(i => i.severity === level.value).length;
                                                                      const percentage = incidents.length > 0 ? ((count / incidents.length) * 100).toFixed(1) : '0';
                                                                      return (
                                                                           <div key={level.value} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                {level.label}
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                     <Badge bg={level.value === 'low' ? 'primary' : level.value === 'medium' ? 'warning' : level.value === 'high' ? 'danger' : 'dark'}>{count}</Badge>
                                                                                     <small className="text-muted">{percentage}%</small>
                                                                                </div>
                                                                           </div>
                                                                      );
                                                                 })}
                                                            </div>
                                                       </Card.Body>
                                                  </Card>
                                             </Col>
                                        </Row>

                                        <Card className="mb-4">
                                             <Card.Header>
                                                  <Card.Title>Trend Analysis - Systemic Issues</Card.Title>
                                             </Card.Header>
                                             <Card.Body>
                                                  {getTrendAnalysis().length > 0 ? (
                                                       <div className="space-y-3">
                                                            <Alert variant="warning">
                                                                 <strong>⚠️ Potential Systemic Issues Detected</strong>
                                                                 <p className="mb-0 mt-2">The following patterns may indicate recurring problems requiring attention:</p>
                                                            </Alert>
                                                            {getTrendAnalysis().map((trend, index) => (
                                                                 <Card key={index} className="mb-3 border-warning">
                                                                      <Card.Body>
                                                                           <Row>
                                                                                <Col md={8}>
                                                                                     <h6 className="text-warning mb-2">{trend.title}</h6>
                                                                                     <p className="mb-2">{trend.description}</p>
                                                                                     <div className="d-flex gap-3 text-sm">
                                                                                          <span><strong>Frequency:</strong> {trend.frequency} incidents</span>
                                                                                          <span><strong>Impact:</strong> {trend.impact}</span>
                                                                                     </div>
                                                                                </Col>
                                                                                <Col md={4} className="text-end">
                                                                                     <Badge bg="warning" className="mb-2">High Priority</Badge>
                                                                                     <br />
                                                                                     <Button variant="outline-warning" size="sm">
                                                                                          Create CAPA
                                                                                     </Button>
                                                                                </Col>
                                                                           </Row>
                                                                      </Card.Body>
                                                                 </Card>
                                                            ))}
                                                       </div>
                                                  ) : (
                                                       <div className="text-center py-4">
                                                            <div className="text-success mb-2">✓</div>
                                                            <p className="text-muted">No systemic issues detected. All incident patterns are within normal ranges.</p>
                                                       </div>
                                                  )}
                                             </Card.Body>
                                        </Card>

                                        <Card>
                                             <Card.Header>
                                                  <Card.Title>Monthly Incident Trends</Card.Title>
                                             </Card.Header>
                                             <Card.Body>
                                                  <div className="table-responsive">
                                                       <table className="table table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Month</th>
                                                                      <th>Total Incidents</th>
                                                                      <th>Patient Safety</th>
                                                                      <th>Quality</th>
                                                                      <th>Security</th>
                                                                      <th>Compliance</th>
                                                                      <th>Trend</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {getMonthlyTrends().map((month, index) => (
                                                                      <tr key={index}>
                                                                           <td>{month.month}</td>
                                                                           <td>{month.total}</td>
                                                                           <td>{month.byType['patient-safety'] || 0}</td>
                                                                           <td>{month.byType.quality || 0}</td>
                                                                           <td>{month.byType.security || 0}</td>
                                                                           <td>{month.byType.compliance || 0}</td>
                                                                           <td>
                                                                                {month.trend === 'increasing' && <Badge bg="danger">↗️ Increasing</Badge>}
                                                                                {month.trend === 'decreasing' && <Badge bg="success">↘️ Decreasing</Badge>}
                                                                                {month.trend === 'stable' && <Badge bg="secondary">→ Stable</Badge>}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </Card.Body>
                                        </Card>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}