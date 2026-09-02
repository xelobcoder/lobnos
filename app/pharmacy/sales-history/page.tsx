'use client';

import { useEffect, useState } from 'react';
import { RiFileListLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../components/Auth/customFetch';

type Sale = { id: string; receiptNumber: string; customerName: string; paymentMethod: string; total: number; status: string; completedAt: string | null; cashierId: number };
const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

export default function PharmacySalesHistoryPage() {
     const [sales, setSales] = useState<Sale[]>([]);
     const [error, setError] = useState<string | null>(null);

     const loadSales = async (page = 1, count = 20) => {
          try {
               setError(null);
               const response = await customFetch(`pharmacy/sales-history?page=${page}&count=${count}`);
               if (response?.success) {
                    const currentSales = response.data.sales || [];
                    setSales(currentSales);
                    return { result: currentSales, error: false };
               }
               setError(response?.error?.message || 'Unable to load pharmacy sales history.');
          } catch {
               setError('Unable to load pharmacy sales history.');
          }
          return { result: [], error: true };
     };

     useEffect(() => { loadSales(); }, []);

     const columns = [
          { Header: 'Receipt', accessor: 'receiptNumber' },
          { Header: 'Customer', accessor: 'customerName' },
          { Header: 'Payment', accessor: 'paymentMethod', Cell: ({ value }: { value: string }) => value.replace('_', ' ') },
          { Header: 'Total', accessor: 'total', Cell: ({ value }: { value: number }) => <span className="fw-bold">{currency.format(value)}</span> },
          { Header: 'Completed', accessor: 'completedAt', Cell: ({ value }: { value: string | null }) => value ? new Date(value).toLocaleString() : '-' },
          { Header: 'Status', accessor: 'status', Cell: ({ value }: { value: string }) => <span className="badge text-bg-success text-capitalize">{value}</span> }
     ];

     return <div className="container-fluid p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
               <div><h2 className="mb-1"><RiFileListLine className="me-2" />Pharmacy Sales History</h2><p className="text-muted mb-0">Completed pharmacy sales and receipts</p></div>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <PrimeTable column={columns} data={sales} filtering={true} serverSideFiltering={true} handleSeverSideProcessing={({ page, count }: { page: number; count: number }) => loadSales(page, count)} />
     </div>;
}