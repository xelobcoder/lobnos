'use client';

import React, { useEffect, useState, useRef } from 'react';
import ui from "../../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { RiAddLine, RiDeleteBinLine, RiRefreshLine, RiSaveLine, RiTestTubeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { EmailProvider, callGet, callMutate, defaultProviderForm, mapProviderFromApi, parseList } from '../_lib';
import styles from '../email-standard.module.css';
import EmailPageHero from '../_components/EmailPageHero';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../components/accessories/PrimeToast';
import { useApplication } from '../../../components/Auth/useApplicationContext';

export default function EmailProvidersPage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(false);
     const [loadError,setLoadError]=useState('');
     const [providers, setProviders] = useState<EmailProvider[]>([]);

     const [providerModalOpen, setProviderModalOpen] = useState(false);
     const [providerModalMode, setProviderModalMode] = useState<'create' | 'edit'>('create');
     const [providerForm, setProviderForm] = useState<EmailProvider>(defaultProviderForm);
     const [showProviderPassword, setShowProviderPassword] = useState(false);
     const [savingProvider,setSavingProvider]=useState(false);
     const [saveError,setSaveError]=useState('');
     const saveLock=useRef(false);

     const loadProviders = async () => {
          setLoading(true);setLoadError('');
          try {
               const response = await callGet('email/providers');
               setProviders(parseList<EmailProvider>(response).map(mapProviderFromApi));
          } catch (err: any) {
               setLoadError(err?.message || 'Failed to load providers');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadProviders();
     }, []);

     const saveProvider = async () => {
          if(saveLock.current)return;
          setSaveError('');
          if (!providerForm.name?.trim() || !providerForm.host?.trim() || !providerForm.username?.trim() || !providerForm.fromEmail?.trim() || !providerForm.fromName?.trim()) {
               toast.error('Name, host, username, from email and from name are required');
               return;
          }

          if (!providerForm.port || Number(providerForm.port) <= 0) {
               toast.error('Port must be a positive number');
               return;
          }

          if (!providerForm.password?.trim() && providerModalMode === 'create') {
               toast.error('Password is required for new provider');
               return;
          }

          const payload = {
               name: providerForm.name.trim(),
               providerType: 'smtp',
               host: providerForm.host.trim(),
               port: Number(providerForm.port),
               secure: Boolean(providerForm.secure),
               username: providerForm.username.trim(),
               password: providerForm.password?.trim() ? providerForm.password : undefined,
               fromEmail: providerForm.fromEmail,
               fromName: providerForm.fromName,
               isDefault: Boolean(providerForm.isDefault),
               isActive: Boolean(providerForm.isActive),
               createdBy: employeeid || undefined,
               updatedBy: employeeid || undefined,
          };

          saveLock.current=true;setSavingProvider(true);
          try {
               if (providerModalMode === 'create') {
                    await callMutate('email/providers', 'POST', payload);
                    toast.success('Provider created');
               } else if (providerForm.id) {
                    await callMutate(`email/providers/${providerForm.id}`, 'PUT', payload);
                    toast.success('Provider updated');
               }
               setProviderModalOpen(false);
               await loadProviders();
          } catch (err: any) {
               setSaveError(err?.message || 'Unable to save provider. Your entries have been kept.');
          } finally {saveLock.current=false;setSavingProvider(false);}
     };

     const deleteProvider = async (item: EmailProvider) => {
          if (!item.id) return;
          if (!window.confirm(`Delete provider "${item.name}"?`)) return;
          try {
               await callMutate(`email/providers/${item.id}`, 'DELETE', {});
               toast.success('Provider deleted');
               await loadProviders();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to delete provider');
          }
     };

     const testProvider = async (item: EmailProvider) => {
          if (!item.id) return;
          try {
               const response = await callMutate(`email/providers/${item.id}/test`, 'POST', {});
               if (response?.connected === true || response?.result?.connected === true) {
                    toast.success('Connection successful');
               } else {
                    toast.info('Connection test finished');
               }
          } catch (err: any) {
               toast.error(err?.message || 'Connection test failed');
          }
     };

     const sendTestEmail = async (item: EmailProvider) => {
          if (!item.id) return;
          const to = window.prompt('Send a test email to which address?', item.fromEmail || '');
          if (!to?.trim()) return;
          try {
               const response = await callMutate(`email/providers/${item.id}/test-email`, 'POST', { to: to.trim() });
               if (response?.delivered === true) toast.success('Test email sent');
               else toast.error(response?.message || 'Test email failed');
          } catch (err: any) {
               toast.error(err?.message || 'Test email failed');
          }
     };

     const providerColumns = [
          { Header: 'Name', accessor: 'name' },
          { Header: 'Type', accessor: 'providerType', Cell: ({ row }: any) => <span className="text-uppercase">{row.original.providerType}</span> },
          { Header: 'Host', accessor: 'host' },
          { Header: 'Port', accessor: 'port' },
          { Header: 'From Email', accessor: 'fromEmail' },
          { Header: 'Default', accessor: 'isDefault', Cell: ({ row }: any) => <Badge bg={row.original.isDefault ? 'success' : 'secondary'}>{row.original.isDefault ? 'Yes' : 'No'}</Badge> },
          { Header: 'Active', accessor: 'isActive', Cell: ({ row }: any) => <Badge bg={row.original.isActive ? 'success' : 'secondary'}>{row.original.isActive ? 'Yes' : 'No'}</Badge> },
          {
               Header: 'Actions',
               accessor: 'providerActions',
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1 flex-wrap">
                         <Button size="sm" variant="outline-primary" onClick={() => { setProviderModalMode('edit'); setProviderForm({ ...row.original, password: '' }); setSaveError('');setShowProviderPassword(false);setProviderModalOpen(true); }}>Edit</Button>
                         <Button size="sm" variant="outline-success" onClick={() => testProvider(row.original)}><RiTestTubeLine size={14} className="me-1"/>Test connection</Button>
                         <Button size="sm" variant="outline-secondary" onClick={() => sendTestEmail(row.original)}>Send test</Button>
                         <Button size="sm" variant="outline-danger" onClick={() => deleteProvider(row.original)}><RiDeleteBinLine size={14} className="me-1"/>Delete</Button>
                    </div>
               ),
          },
     ];

     return (
          <div className={`${ui.workspace} ${styles.pageRoot}`}>
               <PrimeToast />
               <EmailPageHero
                    title="Email providers"
                    subtitle="Manage sending accounts, connection settings and the default email provider."
                    icon={<RiTestTubeLine size={16} />}
                    badge="Provider Control"
                    stats={[
                         { label: 'Providers', value: providers.length },

                    ]}
               />
               <Card className={styles.surfaceCard}>
                    <Card.Header className={`${styles.surfaceHeader} d-flex justify-content-between align-items-center`}>
                         <strong className={styles.surfaceTitle}>Email Providers</strong>
                         <div className={styles.headerActions}>
                              <Button size="sm" variant="outline-secondary" onClick={() => loadProviders()}><RiRefreshLine size={14} className="me-1"/>Refresh providers</Button>
                              <Button size="sm" variant="success" onClick={() => { setProviderModalMode('create'); setProviderForm(defaultProviderForm); setProviderModalOpen(true); }}><RiAddLine size={14} className="me-1" />New Provider</Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loadError ? <div role="alert" className="alert alert-danger">{loadError}<Button variant="outline-secondary" className="ms-3" onClick={loadProviders}>Retry providers</Button></div> : loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading providers...</div>
                         ) : (
                              <PrimeTable column={providerColumns} data={providers} filtering={true} handleSeverSideProcessing={() => { }} />
                         )}
                    </Card.Body>
               </Card>

               <Modal className={styles.dialog} show={providerModalOpen} onHide={() => {if(!savingProvider)setProviderModalOpen(false)}} backdrop={savingProvider?'static':true} keyboard={!savingProvider} centered>
                    <Modal.Header closeButton>
                         <Modal.Title className="text-capitalize">{providerModalMode} Provider</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{saveError&&<div role="alert" className="alert alert-danger">{saveError}</div>}<fieldset disabled={savingProvider}>
                         <Row className="g-2">
                              <Col md={12}><Form.Group><Form.Label htmlFor="providers-setting-name">Name</Form.Label><Form.Control id="providers-setting-name" value={providerForm.name || ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, name: e.target.value }))} /></Form.Group></Col>
                              <Col md={8}><Form.Group><Form.Label htmlFor="providers-setting-host">Host</Form.Label><Form.Control id="providers-setting-host" value={providerForm.host || ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, host: e.target.value }))} /></Form.Group></Col>
                              <Col md={4}><Form.Group><Form.Label htmlFor="providers-setting-port">Port</Form.Label><Form.Control id="providers-setting-port" type="number" value={providerForm.port || 587} onChange={(e) => setProviderForm((prev) => ({ ...prev, port: Number(e.target.value) }))} /></Form.Group></Col>
                              <Col md={6}><Form.Group><Form.Label htmlFor="providers-setting-username">Username</Form.Label><Form.Control id="providers-setting-username" value={providerForm.username || ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, username: e.target.value }))} /></Form.Group></Col>
                              <Col md={6}>
                                   <Form.Group>
                                        <Form.Label htmlFor="providers-setting-password">Password</Form.Label>
                                        <div className="d-flex gap-1">
                                             <Form.Control id="providers-setting-password" type={showProviderPassword ? 'text' : 'password'} value={providerForm.password || ''} placeholder={providerModalMode === 'edit' && providerForm.hasPassword ? 'Saved - leave blank to keep' : ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, password: e.target.value }))} />
                                             <Button variant="outline-secondary" onClick={() => setShowProviderPassword((prev) => !prev)}>{showProviderPassword ? 'Hide' : 'Show'}</Button>
                                        </div>
                                   </Form.Group>
                              </Col>
                              <Col md={6}><Form.Group><Form.Label htmlFor="providers-setting-from-email">From Email</Form.Label><Form.Control id="providers-setting-from-email" type="email" value={providerForm.fromEmail || ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, fromEmail: e.target.value }))} /></Form.Group></Col>
                              <Col md={6}><Form.Group><Form.Label htmlFor="providers-setting-from-name">From Name</Form.Label><Form.Control id="providers-setting-from-name" value={providerForm.fromName || ''} onChange={(e) => setProviderForm((prev) => ({ ...prev, fromName: e.target.value }))} /></Form.Group></Col>
                              <Col md={12}>
                                   <div className="d-flex gap-3">
                                        <Form.Check type="switch" id="provider-secure" label="Secure (TLS)" checked={Boolean(providerForm.secure)} onChange={(e) => setProviderForm((prev) => ({ ...prev, secure: e.target.checked }))} />
                                        <Form.Check type="switch" id="provider-default" label="Default" checked={Boolean(providerForm.isDefault)} onChange={(e) => setProviderForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />
                                        <Form.Check type="switch" id="provider-active" label="Active" checked={Boolean(providerForm.isActive)} onChange={(e) => setProviderForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                                   </div>
                              </Col>
                         </Row>
                    </fieldset></Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" disabled={savingProvider} onClick={() => setProviderModalOpen(false)}>Close</Button>
                         <Button variant="success" disabled={savingProvider} onClick={saveProvider}><RiSaveLine size={14} className="me-1" />{savingProvider?'Saving…':'Save'}</Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
