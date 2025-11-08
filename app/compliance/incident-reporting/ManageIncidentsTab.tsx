import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customPost } from '../../../components/Auth/customFetch';

interface Incident {
     id: string;
     type: 'patient-safety' | 'quality' | 'security' | 'compliance';
     title: string;
     description: string;
     severity: 'low' | 'medium' | 'high' | 'critical';
     status: 'reported' | 'investigating' | 'root-cause-analysis' | 'corrective-actions' | 'resolved' | 'closed';
     employeeId: number;
     reportedAt: string;
     reportedByUsername?: string;
     reportedByEmail?: string;
     reportedByRole?: string;
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
     escalatedTo?: string[];
     followUpDate?: string;
     resolutionDate?: string;
     attachments?: string[];
     investigationNotes?: string[];
     createdAt?: string;
     updatedAt?: string;
}

interface ManageIncidentsTabProps {
     incidents: Incident[];
     onIncidentsUpdate: (incidents: Incident[]) => void;
     onStartInvestigation: (incident: Incident) => void;
     onViewIncident: (incident: Incident) => void;
}

const incidentTypes = [
     { value: 'patient-safety', label: 'Patient Safety', description: 'Wrong results, delayed reporting, misidentified samples' },
     { value: 'quality', label: 'Quality', description: 'Equipment failures, reagent issues, procedural errors' },
     { value: 'security', label: 'Security', description: 'Data breaches, unauthorized access, system failures' },
     { value: 'compliance', label: 'Compliance', description: 'Documentation errors, procedural violations' }
];

const statusOptions = [
     { value: 'reported', label: 'Reported' },
     { value: 'investigating', label: 'Investigating' },
     { value: 'root-cause-analysis', label: 'Root Cause Analysis' },
     { value: 'corrective-actions', label: 'Corrective Actions' },
     { value: 'resolved', label: 'Resolved' },
     { value: 'closed', label: 'Closed' }
];

const severityLevels = [
     { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
     { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
     { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
     { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export default function ManageIncidentsTab({ incidents, onIncidentsUpdate, onStartInvestigation, onViewIncident }: ManageIncidentsTabProps) {
     const updateIncidentStatus = async (incidentId: string, newStatus: Incident['status']) => {
          try {
               const updateData = { status: newStatus };
               const response = await customPost(`compliance/incidents/${incidentId}`, 'PUT', updateData);

               if (response && response.success && response.data) {
                    // Update the incident in the local state
                    onIncidentsUpdate(
                         incidents.map(inc =>
                              inc.id === incidentId ? { ...inc, ...response.data } : inc
                         )
                    );
                    toast.success(`Incident status updated to ${newStatus}`);
               } else {
                    throw new Error('Invalid response from server');
               }
          } catch (error) {
               console.error('Error updating incident status:', error);
               toast.error('Error updating incident status. Please try again.');
          }
     };

     const handleSeverSideProcessing = async ({ page, count, sortby = 'DESC' }: { page: number, count: number, sortby: 'ASC' | 'DESC' }): Promise<{ result?: any[], error: boolean }> => {
          try {
               // Try API first
               const { customFetch } = await import('../../../components/Auth/customFetch');
               const response = await customFetch(`compliance/incidents?page=${page}&count=${count}&sortby=${sortby}`);
               if (response && response.data && Array.isArray(response.data)) {
                    // Ensure employee information is included in the response
                    const incidentsWithEmployeeInfo = response.data.map((incident: any) => ({
                         ...incident,
                         reportedByUsername: incident.reportedByUsername || 'N/A',
                         reportedByEmail: incident.reportedByEmail || 'N/A',
                         reportedByRole: incident.reportedByRole || 'N/A'
                    }));
                    return { result: incidentsWithEmployeeInfo, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.log('API call failed:', error);
               return { result: [], error: true };
          }
     };

     const getSeverityBadge = (severity: string) => {
          const level = severityLevels.find(l => l.value === severity);
          return level ? (
               <span className={
                    `fw-bold ${level.value === 'low' ? 'text-primary' :
                         level.value === 'medium' ? 'text-warning' :
                              level.value === 'high' ? 'text-danger' : 'text-dark'}`

               }>{level.label}</span>
          ) : null;
     };

     const incidentColumns = [
          { Header: 'ID', accessor: 'id' },
          { Header: 'Title', accessor: 'title' },
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ value }: { value: string }) => incidentTypes.find(t => t.value === value)?.label
          },
          {
               Header: 'Severity',
               accessor: 'severity',
               Cell: ({ value }: { value: string }) => getSeverityBadge(value)
          },
          {
               Header: 'Reported By',
               accessor: 'reportedByUsername',
               Cell: ({ row }: any) => `${row.original.reportedByUsername || row.original.employeeId || 'N/A'} ${row.original.reportedByRole ? `(${row.original.reportedByRole})` : ''}`
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => (
                    <span className={
                         `fw-bold ${value === 'reported' ? 'text-secondary' :
                              value === 'investigating' ? 'text-warning' :
                                   value === 'resolved' ? 'text-success' : 'text-dark'}`
                    }>
                         {statusOptions.find(o => o.value === value)?.label}
                    </span>
               )
          },
          {
               Header: 'Reported Date',
               accessor: 'reportedAt',
               Cell: ({ value }: { value: string }) => dayjs(value).format('DD MMM YYYY')
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               disableSortBy: true,
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-2 flex-wrap">
                         <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => onViewIncident(row.original)}
                         >
                              View
                         </button>
                         {row.original.status === 'reported' && (
                              <button
                                   className="btn btn-outline-warning btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'investigating')}
                              >
                                   Start Investigation
                              </button>
                         )}
                         {row.original.status === 'investigating' && (
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => onStartInvestigation(row.original)}
                              >
                                   Root Cause Analysis
                              </button>
                         )}
                         {row.original.status === 'root-cause-analysis' && (
                              <button
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => onStartInvestigation(row.original)}
                              >
                                   Update Investigation
                              </button>
                         )}
                         {row.original.status === 'corrective-actions' && (
                              <button
                                   className="btn btn-outline-success btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'resolved')}
                              >
                                   Mark Resolved
                              </button>
                         )}
                         {row.original.status === 'resolved' && (
                              <button
                                   className="btn btn-outline-dark btn-sm"
                                   onClick={() => updateIncidentStatus(row.original.id, 'closed')}
                              >
                                   Close Incident
                              </button>
                         )}
                    </div>
               )
          }
     ];

     return (
          <PrimeTable
               column={incidentColumns}
               data={incidents}
               filtering={true}
               serverSideFiltering={true}
               handleSeverSideProcessing={handleSeverSideProcessing}
          />
     );
}