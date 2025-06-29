'use client';
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import PrimeTable from '../../../../../../components/accessories/Datatables/PrimeTable';
import { handleServerProcessingSmsJobs } from '../../../../../../components/serverActions/ActionFiltering';


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

const SmsJobsListPage: React.FC = () => {
     const [jobs, setJobs] = useState<any[]>([]);
     const [total, setTotal] = useState<number>(0);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     useEffect(() => {
          setLoading(true);
          customFetch('prime/sms-jobs-paginated')
               .then((data) => {
                    if (data && Array.isArray(data.jobs)) {
                         setJobs(data.jobs);
                         setTotal(data.total || data.jobs.length);
                    } else {
                         setError('No jobs found.');
                    }
               })
               .catch(() => setError('Failed to fetch jobs.'))
               .finally(() => setLoading(false));
     }, []);


     const columns = [
          { Header: 'Job ID', accessor: 'jobid' },
          {
               Header: 'Category', accessor: 'category', Cell: ({ cell: { value } }) => <span className="text-capitalize">{value}</span>
          },
          {
               Header: 'Recipient Scope', accessor: 'recipientscope', Cell: ({ cell: { value } }) => <span className="text-capitalize">{value}</span>
          },
          {
               Header: 'Send Type', accessor: 'sendtype', Cell: ({ cell: { value } }) => <span className="text-capitalize">{value}</span>
          },
          {
               Header: ' username', accessor: 'createdbyusername', Cell: ({ cell: { value } }) => <span className="text-capitalize">{value}</span>
          },
          {
               Header: 'Status', accessor: 'status', Cell: ({ cell: { value } }) => <span className={`badge bg-${statusColors[value] || 'secondary'}`}>{value}</span>
          },
          {
               Header: 'Created At', accessor: 'createdat', Cell: ({ cell: { value } }) => formatDate(value)
          },
          {
               Header: 'Scheduled At', accessor: 'scheduledat', Cell: ({ cell: { value } }) => value ? formatDate(value) : '-'
          },
{
     Header: 'Recipients',
     id: 'recipients',
     Cell: ({ row }) => {
          const job = row.original;
          const jobid = job.jobid;
          const [show, setShow] = React.useState(false);
          const handleShow = () => setShow(true);
          const handleClose = () => setShow(false);
          if (job.recipientscope === 'all') {
               return <>
                    <button
                         className="btn btn-sm btn-outline-primary"
                         type="button"
                         style={{ minWidth: 110 }}
                         onClick={handleShow}
                    >
                         View Recipients
                    </button>
                    <Modal show={show} onHide={handleClose} centered>
                         <Modal.Header closeButton>
                              <Modal.Title>Recipients Info</Modal.Title>
                         </Modal.Header>
                         <Modal.Body>
                              <div className="mb-2">This message was sent to <b>all</b> of the <b>{job.category}</b> category.</div>
                              <div>Status: <span className={`badge bg-${statusColors[job.status] || 'secondary'}`}>{job.status}</span></div>
                         </Modal.Body>
                         <Modal.Footer>
                              <Button variant="secondary" onClick={handleClose}>Close</Button>
                         </Modal.Footer>
                    </Modal>
               </>;
          }
          return (
               <a
                    className="btn btn-sm btn-outline-primary"
                    href={`/communications/sms/v2/jobs/recipients/${jobid}`}
                    style={{ minWidth: 110 }}
               >
                    View Recipients
               </a>
          );
     }
},
     ]


     if (loading) {
          return (
               <div className="d-flex align-items-center justify-content-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3">Loading jobs...</span>
               </div>
          )
     }

     if (error) {
          return (
               <Alert variant="danger" className="mt-4">
                    {error}
               </Alert>
          );
     }

     return (
          <div className="mt-4">
               <h3 className="fw-semibold mb-2" style={{ fontSize: '1.25rem' }}>SMS Jobs</h3>
               <div className="mb-2 text-muted small" style={{ fontSize: '0.95rem' }}>Total: {total}</div>
               <PrimeTable
                    data={jobs}
                    column={columns}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleServerProcessingSmsJobs}
               />
          </div>
     );
};

export default SmsJobsListPage;
