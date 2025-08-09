
'use client';
import React, { useEffect, useState } from 'react';
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import { customFetch } from "../../../../../../components/Auth/customFetch";
import { RiEyeLine, RiPrinterLine } from '@remixicon/react';

type TrackingRow = {
     trackid: number;
     ascensionid: number;
     employeeid: number;
     action: string;
     actionon: string;
     count: number;
     employee_name: string;
     employee_role: string;
};

export default function Page({ params }: { params: { ascensionid: string } }) {
     const ascensionid = params.ascensionid;
     const [data, setData] = useState<TrackingRow[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          setLoading(true);
          customFetch(`result/printingtracking/ascension/${ascensionid}`)
               .then((res: TrackingRow[]) => setData(res))
               .finally(() => setLoading(false));
     }, [ascensionid]);


     const handleSeverSideProcessing = async (filters: { count: number, page: number, sortby: 'ASC' | 'DESC'  }) => {
          try {
               const {page,count, sortby='DESC'} = filters;
               const response = await customFetch(`result/printingtracking/ascension/${ascensionid}?page=${page}&count=${count}&sortby=${sortby}`)
               const result = Array.isArray(response) ? response : [];
               return { result, error: false }
          } catch (error) {
               console.error('Error fetching tracking data:', error);
               return { result: [], error: true };
          }
     };

     const columns = [
          {
               Header: "Employee",
               accessor: "employee_name",
          },
          {
               Header: "Role",
               accessor: "employee_role",
          },
          {
               Header: "Action",
               accessor: "action",
               Cell: ({ value }: { value: string }) => {
                    if (value === 'view') {
                         return <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RiEyeLine size={18} /> View</span>;
                    } else if (value === 'printed') {
                         return <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RiPrinterLine size={18} /> Printed</span>;
                    } else {
                         return value;
                    }
               },
          },
          {
               Header: "Date",
               accessor: "actionon",
               Cell: ({ value }: { value: string }) => new Date(value).toLocaleString(),
          },
     ];

     return (
          <div>
               <div style={{ marginTop: 16 }}>
                    <PrimeTable
                         column={columns}
                         data={data || []}
                         filtering={false}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleSeverSideProcessing}
                    />
                    {loading && <div style={{ marginTop: 12 }}>Loading...</div>}
               </div>
          </div>
     );
}
