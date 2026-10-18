'use client';

import { FormEvent, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { RiSearchLine, RiUserHeartLine } from '@remixicon/react';
import { customFetch } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../components/Auth/roles';
import PatientPortalAccessPanel from '../../../components/PatientPortal/PatientPortalAccessPanel';

interface CustomerRow {
     patientid: number;
     fullpatientid?: string;
     fullname?: string;
     contact?: string;
}

const PORTAL_STAFF_ROLES = ['admin', 'manager', 'scientist'];

/** CRM entry point for patient portal access: find a patient, then invite, enable/disable or release results. */
export default function CrmPatientPortalPage() {
     const { applicationsettings } = useApplicationSettings();
     const allowed = roleAllowed(applicationsettings?.user?.role, PORTAL_STAFF_ROLES);
     const [query, setQuery] = useState('');
     const [rows, setRows] = useState<CustomerRow[]>([]);
     const [searched, setSearched] = useState(false);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [selected, setSelected] = useState<CustomerRow | null>(null);

     const search = async (event: FormEvent) => {
          event.preventDefault();
          const term = query.trim();
          if (!term) return setError('Enter a patient number, name or phone number.');
          setLoading(true);
          setError('');
          setSelected(null);
          try {
               const params = new URLSearchParams({ page: '1', count: '20', sortby: 'DESC', q: term });
               const response: any = await customFetch(`customers?${params.toString()}`);
               const list = Array.isArray(response) ? response
                    : Array.isArray(response?.result) ? response.result
                         : Array.isArray(response?.data) ? response.data
                              : Array.isArray(response?.rows) ? response.rows : [];
               setRows(list.filter((row: CustomerRow) => Number(row?.patientid) > 0));
               setSearched(true);
          } catch {
               setError('Patients could not be searched. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     if (!allowed) {
          return <Alert variant="warning" className="m-3">Patient portal access is available to administrators, managers and scientists.</Alert>;
     }

     return (
          <div className="p-3">
               <h1 className="h4 d-flex align-items-center gap-2 mb-1"><RiUserHeartLine size={22} />Patient Portal</h1>
               <p className="text-muted mb-3">Find a patient to send a portal invitation, enable or disable their access, or release results to the portal.</p>

               <Form onSubmit={search} className="d-flex flex-wrap gap-2 mb-3" role="search">
                    <Form.Label htmlFor="portal-patient-search" visuallyHidden>Search patients</Form.Label>
                    <Form.Control id="portal-patient-search" style={{ maxWidth: 420 }} placeholder="Patient number, name or phone"
                         value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Button type="submit" disabled={loading}>
                         {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <RiSearchLine size={16} className="me-1" />}Search
                    </Button>
               </Form>

               {error && <Alert variant="danger">{error}</Alert>}
               {searched && !loading && rows.length === 0 && <Alert variant="info">No patients match that search.</Alert>}

               {rows.length > 0 && !selected && (
                    <Table responsive hover size="sm" className="align-middle">
                         <thead><tr><th>Patient number</th><th>Name</th><th>Contact</th><th aria-label="Action" /></tr></thead>
                         <tbody>
                              {rows.map((row) => (
                                   <tr key={row.patientid}>
                                        <td>{row.fullpatientid || row.patientid}</td>
                                        <td className="text-uppercase">{row.fullname || 'N/A'}</td>
                                        <td>{row.contact || 'N/A'}</td>
                                        <td className="text-end"><Button size="sm" variant="outline-primary" onClick={() => setSelected(row)}>Manage portal access</Button></td>
                                   </tr>
                              ))}
                         </tbody>
                    </Table>
               )}

               {selected && (
                    <div>
                         <div className="d-flex flex-wrap align-items-center gap-2">
                              <strong className="text-uppercase">{selected.fullname || 'Patient'}</strong>
                              <span className="text-muted">{selected.fullpatientid}</span>
                              <Button size="sm" variant="link" onClick={() => setSelected(null)}>Back to results</Button>
                         </div>
                         <PatientPortalAccessPanel key={selected.patientid} patientid={Number(selected.patientid)} />
                    </div>
               )}
          </div>
     );
}
