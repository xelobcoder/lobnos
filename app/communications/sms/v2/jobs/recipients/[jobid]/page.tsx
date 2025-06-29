'use client';
import React, { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import PrimeTable from '../../../../../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../../../../../components/Auth/customFetch';
import { handleServerRecipientSmsJobs } from '../../../../../../../components/serverActions/ActionFiltering';

const statusColors: Record<string, string> = {
     sent: 'success',
     pending: 'warning',
     failed: 'danger',
};

function formatDate(dateStr: string) {
     if (!dateStr) return '';
     const d = new Date(dateStr);
     return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const SmsJobRecipientsPage: React.FC<{ params: { jobid: string } }> = ({ params }) => {
     const jobid = params.jobid;
     const [recipients, setRecipients] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     useEffect(() => {
          setLoading(true);
          customFetch(`prime/sms-job-recipients/by-job/${jobid}`)
               .then((data) => {
                    if (Array.isArray(data)) {
                         setRecipients(data);
                    } else {
                         setError('No recipients found.');
                    }
               })
               .catch(() => setError('Failed to fetch recipients.'))
               .finally(() => setLoading(false));
     }, [jobid]);

     const columns = [
          { Header: 'Recipient ID', accessor: 'recid' },
          { Header: 'Phone', accessor: 'phonee164' },
          {
               Header: 'Personalized Body', accessor: 'personalizedbody',
               Cell: ({ cell: { value } }) => (
                    <span style={{ maxWidth: 300, whiteSpace: 'pre-line', wordBreak: 'break-word', display: 'inline-block' }}>{value}</span>
               )
          },
          {
               Header: 'Delivery Status', accessor: 'deliverystatus',
               Cell: ({ cell: { value } }) => <span className={`badge bg-${statusColors[value] || 'secondary'}`}>{value}</span>
          },
          {
               Header: 'Sent At', accessor: 'sentat',
               Cell: ({ cell: { value } }) => value ? formatDate(value) : '-'
          },
          { Header: 'Message ID', accessor: 'messageid' },
          {
               Header: 'Error Code', accessor: 'errorcode',
               Cell: ({ cell: { value } }) => value || '-'
          },
     ];

     if (loading) {
          return (
               <div className="container mt-4">
                    <h4 className="fw-semibold mb-3" style={{ fontSize: '1.1rem' }}>Recipients for Job #{jobid}</h4>
                    <div className="d-flex align-items-center justify-content-center py-5">
                         <Spinner animation="border" variant="primary" />
                         <span className="ms-3">Loading recipients...</span>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container mt-4">
                    <h4 className="fw-semibold mb-3" style={{ fontSize: '1.1rem' }}>Recipients for Job #{jobid}</h4>
                    <Alert variant="danger">
                         {error}
                    </Alert>
               </div>
          );
     }

     if (recipients.length === 0) {
          return (
               <div className="container mt-4">
                    <h4 className="fw-semibold mb-3" style={{ fontSize: '1.1rem' }}>Recipients for Job #{jobid}</h4>
                    <Alert variant="info">
                         No recipients found for this job.
                    </Alert>
               </div>
          );
     }

     return (
          <div>
               <h4 className="fw-semibold mb-3" style={{ fontSize: '1.1rem' }}>Recipients for Job #{jobid}</h4>
               <PrimeTable
                    data={recipients}
                    column={columns}
                    urlparams={{ jobid }}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleServerRecipientSmsJobs}
               />
          </div>
     );
};

export default SmsJobRecipientsPage;
