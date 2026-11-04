'use client'
import {errorMessage} from '../../../lib/errorMessage';

import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { customFetch } from "../../../components/Auth/customFetch";
import { Cell } from "recharts";


const getClinicianId = (clinician: Clinician) => clinician.id || clinician.clinician_id || 0;


type Clinician = {
     id?: number;
     clinician_id?: number;
     name: string;
     email?: string | null;
     location: string;
     commission?: number | null;
     phone: string;
     occupation: string;
     address: string;
     identifier?: string;
     organization?: number;
     module?: string;
     momo?: string | null;
     momoname?: string | null;
     bankname?: string | null;
     bankbranch?: string | null;
     accountnumber?: string | null;
     accountname?: string | null;
     payment_id?: number;
     clinician_updated_on?: string | null;
     clinician_created_on?: string;
     payment_updated_on?: string | null;
     payment_created_on?: string;
     _showFinancialModal?: (row: any) => void;
};

const FinancialInfoModal = ({ show, onHide, data }: {show: boolean; onHide: () => void; data: Clinician | null}) => (
     <Modal show={show} onHide={onHide}>
          <Modal.Header closeButton>
               <Modal.Title>Financial Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
               {data ? (
                    <div className="d-flex flex-column gap-2 text-sm">
                         <div className="border px-3 py-2"><strong>Identifier:</strong> {data.identifier || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Module:</strong> {data.module || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Momo Number:</strong> {data.momo || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Momo Name:</strong> {data.momoname || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Bank Name:</strong> {data.bankname || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Bank Branch:</strong> {data.bankbranch || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Account Number:</strong> {data.accountnumber || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Account Name:</strong> {data.accountname || 'N/A'}</div>
                         <div className="border px-3 py-2"><strong>Commission Rate:</strong> {data.commission != null ? `${data.commission}%` : 'N/A'}</div>
                    </div>
               ) : <div>No data</div>}
          </Modal.Body>
          <Modal.Footer>
               <Button variant="outline-secondary" onClick={onHide} size="sm">Close</Button>
          </Modal.Footer>
     </Modal>
);

export default function ClinicianList() {
     const [clinicianList, setClinician] = useState<Clinician[]>([]);
     const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
     const [loading, setLoading] = useState(false);



     const getClinicianData = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`clinicians?count=${pagination.count}&page=${pagination.page}&&role=admin`)
               const { result, statusCode } = response;
               if (statusCode == 200 && result && Array.isArray(result)) {
                    setClinician(result);
               } else {
                    toast.error('Failed to fetch clinicians', {
                         position: 'top-right',
                         autoClose: 2000,
                    });
               }
          } catch (err) {
               toast.error(errorMessage(err) || 'Error connecting to server', {
                    position: 'top-right',
                    autoClose: 2000,
               });
          } finally {
               setLoading(false);
          }
     }

     useEffect(() => {
          getClinicianData();
     }, []);


     const columnsMini = [
          { Header: 'Name', accessor: 'name' },
          { Header: 'Email', accessor: 'email' },
          { Header: 'Location', accessor: 'location' },
          {
               Header: 'Commission Rate',
               accessor: 'commission',
               Cell: ({ row }: {row: {original: Clinician; index: number}}) => (
                    <div className="d-flex align-items-center gap-2">
                         <span className="badge bg-success-subtle text-success-emphasis px-2 py-1">
                              {row.original?.commission ?? 'N/A'}%
                         </span>
                    </div>
               ),
          },
          { Header: 'Phone', accessor: 'phone' },
          {
               Header: 'Occupation', accessor: 'occupation', Cell: ({ row }: {row: {original: Clinician; index: number}}) => (
                    <span className="text-capitalize">{`${row.original.occupation}/HEALTHCARE PRACTITIONER`}</span>
               )
          },
          { Header: 'Address', accessor: 'address' },
          {
               Header: 'Actions',
               Cell: ({ row }: {row: {original: Clinician; index: number}}) => (
                    <button
                         className="btn btn-sm btn-outline-primary"
                         onClick={(ev) => { window.open(`/clinicians-analytics/${row.original.clinician_id}/overall`) }}
                    >
                         VIEW DEATILS
                    </button>
               ),
               disableSortBy: true,
               disableFilters: true,
          }
     ];



     const extendAdminView = [
          { Header: 'Name', accessor: 'name' },
          { Header: 'Email', accessor: 'email' },
          { Header: 'Phone', accessor: 'phone' },
          { Header: 'Location', accessor: 'location' },
          { Header: 'Address', accessor: 'address' },
          {
               Header: 'Occupation', accessor: 'occupation', Cell: ({ row }: {row: {original: Clinician}}) => (
                    <span className="text-capitalize">{`${row.original.occupation}/HEALTHCARE PRACTITIONER`}</span>
               )
          },
     ];

     return (
          <>
               <PrimeTable
                    column={columnsMini}
                    data={clinicianList}
                    filtering={false}
                    serverSideFiltering={false}
                    handleSeverSideProcessing={null}

               />

          </>
     );
}