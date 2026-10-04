"use client";

import { useEffect, useState } from 'react';
import { Alert, Button, Form, Table } from 'react-bootstrap';
import { RiFileCopyLine } from '@remixicon/react';
import { customFetch } from '../Auth/customFetch';

type ReferralCode = {
     referral_id: number;
     entity_id: number;
     referral_type: 'organization' | 'clinician';
     referral_code: string;
     name: string | null;
     location: string | null;
     email: string | null;
};

type ReferralCodeResult = {
     items: ReferralCode[];
     total: number;
     page: number;
     count: number;
};

export default function ReferralCodesManager() {
     const [items, setItems] = useState<ReferralCode[]>([]);
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(25);
     const [searchInput, setSearchInput] = useState('');
     const [search, setSearch] = useState('');
     const [total, setTotal] = useState(0);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [copiedCode, setCopiedCode] = useState('');

     useEffect(() => {
          let current = true;
          const loadCodes = async () => {
               setLoading(true);
               setError('');
               const params = new URLSearchParams({ page: String(page), count: String(count) });
               if (search) params.set('search', search);
               try {
                    const response = await customFetch(`organization/referral-codes?${params.toString()}`);
                    if (!current) return;
                    if (response?.status !== 'success' || !response?.result) {
                         setError(response?.message || 'Unable to load referral codes.');
                         setItems([]);
                         setTotal(0);
                         return;
                    }
                    const result = response.result as ReferralCodeResult;
                    setItems(result.items || []);
                    setTotal(Number(result.total || 0));
               } catch {
                    if (current) setError('Unable to load referral codes. Check your connection and try again.');
               } finally {
                    if (current) setLoading(false);
               }
          };

          void loadCodes();
          return () => { current = false; };
     }, [page, count, search]);

     const copyCode = async (code: string) => {
          try {
               await navigator.clipboard.writeText(code);
               setCopiedCode(code);
               window.setTimeout(() => setCopiedCode((value) => value === code ? '' : value), 1800);
          } catch {
               setError('Could not copy the code. Select and copy it manually.');
          }
     };

     const totalPages = Math.max(1, Math.ceil(total / count));

     return (
          <main className="container-fluid py-4">
               <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h1 className="h3 mb-1">Referral Codes</h1>
                         <p className="text-muted mb-0">Clinician and organization referral codes</p>
                    </div>
                    <Form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="d-flex gap-2">
                         <Form.Control
                              aria-label="Search referral codes"
                              placeholder="Search name, email, or code"
                              value={searchInput}
                              onChange={(event) => setSearchInput(event.target.value)}
                         />
                         <Button type="submit" variant="primary">Search</Button>
                    </Form>
               </div>

               {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

               <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                    <span className="text-muted small">{total} referral codes</span>
                    <Form.Select
                         aria-label="Rows per page"
                         value={count}
                         onChange={(event) => { setCount(Number(event.target.value)); setPage(1); }}
                         style={{ width: 'auto' }}
                    >
                         <option value={10}>10 rows</option>
                         <option value={25}>25 rows</option>
                         <option value={50}>50 rows</option>
                    </Form.Select>
               </div>

               <div className="table-responsive">
                    <Table hover bordered className="align-middle mb-0">
                         <thead className="table-light">
                              <tr>
                                   <th scope="col">Type</th>
                                   <th scope="col">Name</th>
                                   <th scope="col">Referral code</th>
                                   <th scope="col">Location</th>
                                   <th scope="col">Email</th>
                                   <th scope="col" className="text-center">Share</th>
                              </tr>
                         </thead>
                         <tbody>
                              {loading ? (
                                   <tr><td colSpan={6} className="text-center py-4">Loading referral codes...</td></tr>
                              ) : items.length === 0 ? (
                                   <tr><td colSpan={6} className="text-center py-4 text-muted">No referral codes found.</td></tr>
                              ) : items.map((item) => (
                                   <tr key={item.referral_id}>
                                        <td className="text-capitalize">{item.referral_type}</td>
                                        <td>{item.name || `${item.referral_type} #${item.entity_id}`}</td>
                                        <td><code className="fs-6">{item.referral_code}</code></td>
                                        <td>{item.location || '-'}</td>
                                        <td>{item.email || '-'}</td>
                                        <td className="text-center">
                                             <Button
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  title="Copy referral code"
                                                  aria-label={`Copy referral code ${item.referral_code}`}
                                                  onClick={() => void copyCode(item.referral_code)}
                                             >
                                                  <RiFileCopyLine className="me-1" aria-hidden="true" />
                                                  {copiedCode === item.referral_code ? 'Copied' : 'Copy'}
                                             </Button>
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </Table>
               </div>

               <div className="d-flex justify-content-end align-items-center gap-3 mt-3">
                    <span className="small text-muted">Page {page} of {totalPages}</span>
                    <Button variant="outline-secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                    <Button variant="outline-secondary" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</Button>
               </div>
          </main>
     );
}