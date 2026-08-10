import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import { plsDecryption } from '../../lib/encryption';

export default function PreviousConsulation({ patientid }: { patientid: number }) {
     const [consulationRecords, setConsulationRecords] = useState<any[]>([]);
     const [loading, setLoading] = useState<boolean>(true);

     const getConsultationText = (record: any) =>
          record.progress_report || record.consultation_notes || record.complaints || "No consultation notes recorded";

     const formatCreatedAt = (createdAt: string) =>
          new Date(createdAt).toLocaleDateString(undefined, {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });

     useEffect(() => {
          if (patientid) {
               setLoading(true);
               const patid = typeof patientid === 'string' ?
                    plsDecryption(patientid) : patientid;
               customFetch(`records/consulations/records?patientid=${patid}&&page=1&&count=10`)
                    .then((data) => {
                         const records = Array.isArray(data)
                              ? data
                              : Array.isArray(data?.result)
                                   ? data.result
                                   : [];
                         setConsulationRecords(records);
                    })
                    .catch((err) => console.log(err))
                    .finally(() => setLoading(false));
          }
     }, [patientid]);

     if (loading) return <div className="alert alert-info mb-0">Loading previous consultations...</div>;

     if (consulationRecords.length === 0)
          return <div className="alert alert-secondary mb-0">No previous consultation records were found for this patient.</div>;

     return (
          <div className="d-grid gap-3">
               {consulationRecords.map((record, index) => (
                    <div key={index} className="border rounded-4 bg-body shadow-sm overflow-hidden">
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 p-3 p-md-4 border-bottom bg-body-tertiary">
                              <div>
                                   <div className="text-uppercase text-muted small fw-semibold mb-1">Consultation Date</div>
                                   <h6 className="mb-1 fw-bold text-body-emphasis">{formatCreatedAt(record.created_at)}</h6>
                                   <div className="text-muted small">Recorded by <span className="fw-semibold text-body-emphasis">{record.consultationby || record.consulationby || "Unknown"}</span></div>
                              </div>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                   <span className="badge rounded-pill text-bg-info px-3 py-2">{record.record_type || 'Consultation'}</span>
                              </div>
                         </div>
                         <div className="p-3 p-md-4">
                              <div className="text-uppercase text-muted small fw-semibold mb-2">Progress Report</div>
                              <div className="rounded-4 border bg-body-tertiary p-3 p-md-4" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.7' }}>
                                   {getConsultationText(record)}
                              </div>
                         </div>
                    </div>
               ))}
          </div>
     );
}
