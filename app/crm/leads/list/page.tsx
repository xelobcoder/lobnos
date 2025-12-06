"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';

interface Lead {
     id: number;
     firstname: string;
     lastname: string;
     middlename?: string;
     contact_person: string;
     contact_email: string;
     contact_phone: string;
     company_name?: string;
     location: string;
     industry_type: string;
     lead_source: string;
     status: string;
     priority: string;
     created_at: string;
     updated_at: string;
}

export default function LeadsList() {
     const [leads, setLeads] = useState<Lead[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const emploeyeeid = useApplication()?.user?.employeeid;

     const fetchLeads = async (pagination: { page: number, count: number, sortby: 'DESC' | 'ASC' }) => {
          try {
               const { page, count, sortby } = pagination;
               const response = await customFetch('leads?employeeid=' + emploeyeeid + '&page=' + page + '&count=' + count + '&sortby=' + sortby);
               if (response.success && response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    setLeads(response.data.data);
                    return { result: response.data.data, error: false };
               } else {
                    setLeads([]);
                    return { result: [], error: false };
               }
          } catch (error) {
               console.error('Error fetching leads:', error);
               setLeads([]);
               return { result: [], error: true };
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchLeads({ page: 1, count: 10, sortby: 'DESC' });
     }, []);

     const filteredLeads = leads.filter(lead =>
          `${lead.firstname} ${lead.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

     const handleView = (lead: Lead) => {
          window.location.href = `/crm/leads/followups/${lead.id}`;
     };

     const handleEdit = (lead: Lead) => {
          window.location.href = `/crm/leads/create-customers-lead?id=${lead.id}`;
     };

     const handleDelete = async (lead: Lead) => {
          if (window.confirm(`Are you sure you want to delete the lead for ${lead.firstname} ${lead.lastname}?`)) {
               try {
                    const response = await customPost(`leads/${lead.id}`, 'DELETE', { id: lead.id });
                    if (response.success) {
                         toast.success(response.message || 'Lead deleted successfully');
                         fetchLeads({ page: 1, count: 10, sortby: 'DESC' });
                    } else {
                         toast.error(response.message || 'Failed to delete lead');
                    }
               } catch (error) {
                    console.error('Error deleting lead:', error);
                    toast.error('Error deleting lead');
               }
          }
     };

     const columns = [
          {
               Header: 'Contact Info',
               accessor: 'contact_info',
               Cell: ({ row }: any) => (
                    <div className="d-flex flex-column">
                         <strong className="text-dark">{`${row.original.firstname} ${row.original.lastname}`}</strong>
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
                         <button className="btn btn-outline-primary btn-sm" title="View Follow-ups" onClick={() => handleView(row.original)}>
                              <RiEyeLine size={14} />
                         </button>
                         <button className="btn btn-outline-secondary btn-sm" title="Edit" onClick={() => handleEdit(row.original)}>
                              <RiEditLine size={14} />
                         </button>
                         <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={() => handleDelete(row.original)}>
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
          <div className="px-4 py-3">
               <div className='d-flex justify-content-end'>
                    <button className="btn-outline-primary btn btn-sm mb-3 d-flex align-items-center gap-2" onClick={() => window.location.href = '/crm/leads/create-customers-lead'}>
                         <RiAddLine size={16} />
                         Add New Lead
                    </button>
               </div>
               <PrimeTable
                    column={columns}
                    data={filteredLeads}
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={fetchLeads}
               />
          </div>
     );
}