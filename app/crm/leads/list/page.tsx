"use client"
import React, { useState, useEffect } from 'react';
import {
     RiAddLine,
     RiEyeLine,
     RiEditLine,
     RiDeleteBinLine,
     RiMailLine,
     RiPhoneLine,
     RiMapPinLine
} from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface Lead {
     id: string;
     name: string;
     contact_person: string;
     contact_email: string;
     contact_phone: string;
     company_name: string;
     location: string;
     industry_type: string;
     lead_source: string;
     status: string;
     priority: string;
     created_at: string;
}

export default function LeadsList() {
     const [leads, setLeads] = useState<Lead[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');

     // Sample data - in real app this would come from API
     useEffect(() => {
          const sampleLeads: Lead[] = [
               {
                    id: '1',
                    name: 'John Smith',
                    contact_person: 'John Smith',
                    contact_email: 'john.smith@company.com',
                    contact_phone: '+1-555-0123',
                    company_name: 'Tech Solutions Inc',
                    location: 'New York, NY',
                    industry_type: 'healthcare',
                    lead_source: 'website',
                    status: 'qualified',
                    priority: 'high',
                    created_at: '2025-01-15'
               },
               {
                    id: '2',
                    name: 'Sarah Johnson',
                    contact_person: 'Sarah Johnson',
                    contact_email: 'sarah.j@biotech.com',
                    contact_phone: '+1-555-0456',
                    company_name: 'BioTech Research',
                    location: 'Boston, MA',
                    industry_type: 'biotech',
                    lead_source: 'referral',
                    status: 'contacted',
                    priority: 'medium',
                    created_at: '2025-01-20'
               },
               {
                    id: '3',
                    name: 'Mike Davis',
                    contact_person: 'Mike Davis',
                    contact_email: 'mike.davis@pharma.com',
                    contact_phone: '+1-555-0789',
                    company_name: 'Pharma Corp',
                    location: 'San Francisco, CA',
                    industry_type: 'pharmaceutical',
                    lead_source: 'trade_show',
                    status: 'new',
                    priority: 'low',
                    created_at: '2025-01-25'
               }
          ];

          setTimeout(() => {
               setLeads(sampleLeads);
               setLoading(false);
          }, 1000);
     }, []);

     const filteredLeads = leads.filter(lead =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
     );

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

     const columns = [
          {
               Header: 'Contact Info',
               accessor: 'contact_info',
               Cell: ({ row }: any) => (
                    <div className="d-flex flex-column">
                         <strong className="text-dark">{row.original.name}</strong>
                         <small className="text-muted d-flex align-items-center">
                              <RiMailLine size={12} className="me-1" />
                              {row.original.contact_email}
                         </small>
                         <small className="text-muted d-flex align-items-center">
                              <RiPhoneLine size={12} className="me-1" />
                              {row.original.contact_phone}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Company',
               accessor: 'company',
               Cell: ({ row }: any) => (
                    <div className="d-flex flex-column">
                         <strong>{row.original.company_name}</strong>
                         <small className="text-muted d-flex align-items-center">
                              <RiMapPinLine size={12} className="me-1" />
                              {row.original.location}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Industry',
               accessor: 'industry_type',
               Cell: ({ value }: any) => <span className="text-capitalize">{value}</span>
          },
          {
               Header: 'Source',
               accessor: 'lead_source',
               Cell: ({ value }: any) => <span className="text-capitalize">{value.replace('_', ' ')}</span>
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: any) => (
                    <span className={`badge ${getStatusBadge(value)}`}>
                         {value.replace('_', ' ')}
                    </span>
               )
          },
          {
               Header: 'Priority',
               accessor: 'priority',
               Cell: ({ value }: any) => (
                    <span className={`badge ${getPriorityBadge(value)}`}>
                         {value}
                    </span>
               )
          },
          {
               Header: 'Created',
               accessor: 'created_at',
               Cell: ({ value }: any) => (
                    <small className="text-muted">
                         {new Date(value).toLocaleDateString()}
                    </small>
               )
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: any) => (
                    <div className="btn-group btn-group-sm">
                         <button className="btn btn-outline-primary btn-sm" title="View">
                              <RiEyeLine size={14} />
                         </button>
                         <button className="btn btn-outline-secondary btn-sm" title="Edit">
                              <RiEditLine size={14} />
                         </button>
                         <button className="btn btn-outline-danger btn-sm" title="Delete">
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <p className="mt-2">Loading leads...</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-dark fw-medium mb-0">Leads Management</h3>
                    <a href="/crm/leads/create-customers-lead" className="btn btn-primary btn-sm">
                         <RiAddLine size={16} className="me-1" />
                         New Lead
                    </a>
               </div>

               <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                         <div className="p-3 border-bottom">
                              <div className="row align-items-center">
                                   <div className="col-12">
                                        <h6 className="mb-0">All Leads ({leads.length})</h6>
                                   </div>
                              </div>
                         </div>

                         <PrimeTable
                              column={columns}
                              data={filteredLeads}
                              filtering={true}
                              handleSeverSideProcessing={() => { }}
                         />
                    </div>
               </div>
          </div>
     );
}