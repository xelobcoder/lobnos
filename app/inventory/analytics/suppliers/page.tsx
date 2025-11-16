'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface Supplier {
     id: string;
     name: string;
     contact: string;
     email: string;
     phone: string;
     address: string | null;
     is_active: number;
     created_at: string;
     updated_at: string;
}

interface SupplierResponse {
     data: Supplier[];
     pagination: {
          page: number;
          count: number;
          total: number;
          totalPages: number;
          sortby: string;
     };
}

export default function SupplierAnalyticsPage() {
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [pagination, setPagination] = useState<SupplierResponse['pagination'] | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadSupplierAnalytics();
     }, []);

     const loadSupplierAnalytics = async () => {
          try {
               const response = await customFetch('inventory/suppliers?page=1&count=10');
               if (response.success) {
                    setSuppliers(response.data);
                    setPagination(response.pagination);
               } else {
                    toast.error('Failed to load suppliers');
               }
          } catch (error) {
               console.error('Error loading suppliers:', error);
               toast.error('Error loading suppliers');
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async (pagination: { page: number, count: number }) => {
          try {
               const { page, count } = pagination;
               const response = await customFetch(`inventory/suppliers?page=${page}&count=${count}`);
               if (response.success && response.data) {
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: false };
               }
          } catch (error) {
               console.error('Error loading suppliers:', error);
               setSuppliers([]);
               setPagination(null);
               return { result: [], error: true };
          }
     };

     const columns = [
          {
               Header: 'Supplier Name',
               accessor: 'name',
               style: { minWidth: '200px' }
          },
          {
               Header: 'Contact Person',
               accessor: 'contact',
               style: { minWidth: '150px' }
          },
          {
               Header: 'Email',
               accessor: 'email',
               style: { minWidth: '200px' }
          },
          {
               Header: 'Phone',
               accessor: 'phone',
               style: { minWidth: '150px' }
          },
          {
               Header: 'Status',
               accessor: 'is_active',
               Cell: ({ value }) => (
                    <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                         {value ? 'Active' : 'Inactive'}
                    </span>
               ),
               style: { minWidth: '100px' }
          },
          {
               Header: 'Created',
               accessor: 'created_at',
               Cell: ({ value }) => new Date(value).toLocaleDateString(),
               style: { minWidth: '120px' }
          },
          {
               Header: 'Actions',
               accessor: '',
               Cell: ({ row }) => (
                    <Link
                         href={`/inventory/analytics/suppliers/${row.original.id}`}
                         className="btn btn-primary btn-sm"
                    >
                         View Details
                    </Link>
               ),
               style: { minWidth: '120px', textAlign: 'center' }
          }
     ];

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none">
                              <span className="text-muted">← Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">🏢 Suppliers</h2>
                         <p className="text-muted mb-0">Select a supplier to view detailed analytics</p>
                    </div>
                    <button
                         className="btn btn-outline-primary btn-sm"
                         onClick={loadSupplierAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Suppliers List */}
               <div className="row g-3">
                    <div className="col-12">
                         <h5 className="mb-3">Supplier List ({pagination?.total || 0} total)</h5>
                         {suppliers.length > 0 ? (
                              <PrimeTable
                                   column={columns}
                                   data={suppliers}
                                   filtering={true}
                                   serverSideFiltering={true}
                                   handleSeverSideProcessing={handleServerSideProcessing}
                              />
                         ) : (
                              <div className="text-center py-4">
                                   <p className="text-muted">No suppliers found</p>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}