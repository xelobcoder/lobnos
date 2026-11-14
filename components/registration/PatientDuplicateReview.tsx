'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { customFetch, customPost } from '../Auth/customFetch';

type Side = 'registered' | 'candidate';
type IdentityField = 'patientid' | 'fullpatientid' | 'firstname' | 'middlename' | 'lastname' | 'dob';
type Candidate = { id: number; evidence: string } & Record<`${Side}_${IdentityField}`, string | number | null>;

export type RegistrationMatch = {
     patientid: number;
     fullpatientid: string;
     firstname: string;
     middlename?: string;
     lastname: string;
     dob?: string;
     age?: number;
     agetype?: string;
     evidence: string;
};

export function RegistrationMatchDrawer({ matches, onClose, onSelect }: {
     matches: RegistrationMatch[];
     onClose: () => void;
     onSelect: (match: RegistrationMatch) => void;
}) {
     return <Offcanvas show={matches.length > 0} onHide={onClose} placement="end" aria-labelledby="registration-match-title">
          <Offcanvas.Header closeButton>
               <Offcanvas.Title id="registration-match-title">Possible duplicate patients</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
               <p>Review these records before registering. Select the patient to continue with their existing record.</p>
               {matches.map(match => <article className="border rounded p-3 mb-2" key={match.patientid}>
                    <h3 className="h6">{[match.firstname, match.middlename, match.lastname].filter(Boolean).join(' ')}</h3>
                    <p className="mb-2">{match.fullpatientid} · {match.dob ? `Born ${match.dob}` : match.age ? `Age ${match.age} ${match.agetype || ''}` : 'Birth date unavailable'}</p>
                    <p className="small mb-2">{match.evidence}</p>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => onSelect(match)}>Use existing patient</button>
               </article>)}
          </Offcanvas.Body>
     </Offcanvas>;
}

export default function PatientDuplicateReview({ patientId }: { patientId?: number | null }) {
     const [open, setOpen] = useState(false);
     const [rows, setRows] = useState<Candidate[]>([]);
     const [cursor, setCursor] = useState<number | null>(null);
     const [next, setNext] = useState<number | null>(null);
     const [refresh, setRefresh] = useState(0);
     const [loading, setLoading] = useState(false);
     const [dismissing, setDismissing] = useState<number | null>(null);
     const [error, setError] = useState('');

     useEffect(() => {
          if (!open) return;
          let active = true;
          setLoading(true);
          setError('');
          const query = new URLSearchParams();
          if (patientId) query.set('patientid', String(patientId));
          if (cursor) query.set('before', String(cursor));
          customFetch(`register/duplicate-candidates?${query}`).then(result => {
               if (!active) return;
               if (result?.status !== 'success' || !Array.isArray(result.data)) throw new Error(result?.message || 'Unable to load possible duplicates.');
               setRows(result.data);
               setNext(result.next);
          }).catch(reason => {
               if (active) setError(reason.message);
          }).finally(() => {
               if (active) setLoading(false);
          });
          return () => { active = false; };
     }, [open, cursor, patientId, refresh]);

     async function dismiss(id: number) {
          setDismissing(id);
          setError('');
          try {
               const response = await customPost(`register/duplicate-candidates/${id}/dismiss`, 'POST', {});
               if (response?.status !== 'success') throw new Error(response?.message || 'Unable to dismiss this match.');
               setRows(current => current.filter(row => row.id !== id));
          } catch (reason) {
               setError(reason instanceof Error ? reason.message : 'Unable to dismiss this match.');
          } finally {
               setDismissing(null);
          }
     }

     return <section className="border rounded p-3 mb-3" aria-label="Duplicate patient review">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
               <div>
                    <h2 className="h6 mb-1">Possible duplicate patients</h2>
               </div>
               <button type="button" className="btn btn-sm btn-outline-primary" aria-expanded={open} onClick={() => setOpen(value => !value)}>
                    {open ? 'Hide matches' : 'Review matches'}
               </button>
          </div>
          <Offcanvas show={open} onHide={() => setOpen(false)} placement="end" style={{ width: "min(100%, 38rem)" }} aria-labelledby="duplicate-history-title">
               <Offcanvas.Header closeButton><Offcanvas.Title id="duplicate-history-title">Possible duplicate patients</Offcanvas.Title></Offcanvas.Header>
               <Offcanvas.Body>
               {error && <p role="alert">{error} <button type="button" className="btn btn-link p-0" onClick={() => setRefresh(value => value + 1)}>Refresh</button></p>}
               {loading ? <p role="status">Loading matchesâ€¦</p> : !rows.length && !error ? <p>No pending matches.</p> : null}
               {!loading && rows.map(row => <article className="border rounded p-3 mb-2" key={row.id}>
                    <div className="row g-3">
                         {(['registered', 'candidate'] as const).map(side => <div className="col-sm-6" key={side}>
                              <h3 className="h6">{side === 'registered' ? 'New registration' : 'Existing record'}</h3>
                              <Link target="_blank" rel="noopener noreferrer" href={`/crm/registration/${row[`${side}_patientid`]}/personal-information`}>
                                   {['firstname', 'middlename', 'lastname'].map(field => row[`${side}_${field as IdentityField}`]).filter(Boolean).join(' ')}
                              </Link>
                              <div>{row[`${side}_fullpatientid`]} Â· Born {String(row[`${side}_dob`] ?? '').slice(0, 10) || 'not recorded'}</div>
                         </div>)}
                    </div>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
                         <span>Matching evidence: {row.evidence}</span>
                         <button type="button" className="btn btn-sm btn-outline-secondary" disabled={dismissing !== null} onClick={() => void dismiss(row.id)}>
                              {dismissing === row.id ? 'Dismissingâ€¦' : 'Dismiss match'}
                         </button>
                    </div>
               </article>)}
               {!loading && <div className="d-flex gap-2">
                    {cursor && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setCursor(null)}>Newest matches</button>}
                    {next && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setCursor(next)}>Older matches</button>}
               </div>}
               </Offcanvas.Body>
          </Offcanvas>
     </section>;
}
