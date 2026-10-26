'use client';

import React, { useEffect, useState, useRef } from 'react';
import ui from "../../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { RiAddLine, RiDeleteBinLine, RiSaveLine, RiSettings4Line } from '@remixicon/react';
import styles from '../email-standard.module.css';
import { toast } from 'react-toastify';
import PrimeToast from '../../../components/accessories/PrimeToast';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import EmailPageHero from '../_components/EmailPageHero';
import { EmailProvider, EmailSettings, defaultSettingsForm, callGet, parseList, mapProviderFromApi, parseJsonArray, callMutate } from '../_lib';

export default function EmailSettingsPage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(true);
     const [saving,setSaving]=useState(false);
     const [error,setError]=useState("");
     const [loadError,setLoadError]=useState("");
     const [notice,setNotice]=useState("");
     const saveLock=useRef(false);
     const [providers, setProviders] = useState<EmailProvider[]>([]);
     const [settingsForm, setSettingsForm] = useState<EmailSettings>(defaultSettingsForm);

     const loadProviders = async () => {
          const response = await callGet('email/providers');
          setProviders(parseList<EmailProvider>(response).map(mapProviderFromApi));
     };

     const loadSettings = async () => {
          const response = await callGet('email/settings');
          if(!response?.result || response.error || response.status===false)throw new Error(response?.message || response?.error || 'Email settings unavailable');
          const source = response.result;
          setSettingsForm({
               defaultProviderId: source.default_provider_id ?? null,
               maxAttachmentSizeMb: Number(source.max_attachment_size_mb ?? 10),
               maxRetries: Number(source.max_retries ?? 3),
               retryBackoffMinutes: parseJsonArray(source.retry_backoff_minutes_json).map((x) => Number(x)).filter((x) => !Number.isNaN(x)),
               allowMarketingEmails: Number(source.allow_marketing_emails ?? 1) === 1,
          });
     };

     const loadAll = async () => {
          setLoading(true);setLoadError("");
          try {
               await Promise.all([loadProviders(), loadSettings()]);
          } catch (err: any) {
               setLoadError(err?.message || 'Failed to load settings');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadAll();
     }, []);

     const saveSettings = async () => {
          if(saveLock.current||loading||loadError)return;
          setError("");setNotice("");
          if(!Number.isFinite(settingsForm.maxAttachmentSizeMb)||settingsForm.maxAttachmentSizeMb<1){setError("Attachment size must be at least 1 MB.");return;}
          const retries = Number(settingsForm.maxRetries);
          if (!Number.isInteger(retries) || retries < 0 || retries > 10) {
               setError('Max retries must be a whole number between 0 and 10.');
               return;
          }

          const invalidBackoff = settingsForm.retryBackoffMinutes.some((x) => x < 1 || x > 1440 || Number.isNaN(x));
          if (invalidBackoff) {
               setError('Retry intervals must be between 1 and 1440 minutes.');
               return;
          }

          try {
               saveLock.current=true;setSaving(true);
               const response=await callMutate('email/settings', 'PUT', {
                    defaultProviderId: settingsForm.defaultProviderId,
                    maxAttachmentSizeMb: Number(settingsForm.maxAttachmentSizeMb),
                    maxRetries: retries,
                    retryBackoffMinutes: settingsForm.retryBackoffMinutes,
                    allowMarketingEmails: settingsForm.allowMarketingEmails,
                    updatedBy: employeeid || undefined,
               });
               if(response?.status===false || response?.success===false || response?.error)throw new Error(response?.message || response?.error || 'Email settings were not saved');
               setNotice('Email settings saved.');
          } catch (err: any) {
               setError(err?.message || 'Unable to update settings. Your edits have been kept.');
          } finally {saveLock.current=false;setSaving(false);}
     };

     return (
          <div className={`${ui.workspace} ${styles.pageRoot}`}>
               <PrimeToast />
               <EmailPageHero
                    title="Delivery Settings"
                    subtitle="Choose the sending provider, attachment limits and retry schedule."
                    icon={<RiSettings4Line size={16} />}
                    badge="Email Core"
                    stats={[
                         { label: 'Providers', value: providers.length },
                         { label: 'Retries', value: settingsForm.maxRetries },
                         { label: 'Backoff Steps', value: settingsForm.retryBackoffMinutes.length },
                    ]}
               />
               {error&&<div role="alert" className="alert alert-danger">{error}</div>}{notice&&<div role="status" className="alert alert-success">{notice}</div>}
               <Card className={styles.surfaceCard}>
                    <Card.Header className={`${styles.surfaceHeader} d-flex align-items-center gap-2`}>
                         <RiSettings4Line size={18} /> <strong className={styles.surfaceTitle}>Email Settings</strong>
                    </Card.Header>
                    <Card.Body>
                         {loadError ? <div role="alert" className="alert alert-danger">{loadError}<Button variant="outline-secondary" className="ms-3" onClick={loadAll}>Retry email settings</Button></div> : loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading settings...</div>
                         ) : (
                              <fieldset disabled={saving}><Row className="g-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label htmlFor="settings-setting-default-provider">Default Provider</Form.Label>
                                             <Form.Select id="settings-setting-default-provider" aria-label="Default provider" value={settingsForm.defaultProviderId ?? ''} onChange={(e) => setSettingsForm((prev) => ({ ...prev, defaultProviderId: e.target.value ? Number(e.target.value) : null }))}>
                                                  <option value="">Select provider</option>
                                                  {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                        <Form.Group>
                                             <Form.Label htmlFor="settings-setting-max-attachment-size-mb-">Max Attachment Size (MB)</Form.Label>
                                             <Form.Control id="settings-setting-max-attachment-size-mb-" aria-label="Maximum attachment size" type="number" min={1} value={settingsForm.maxAttachmentSizeMb} onChange={(e) => setSettingsForm((prev) => ({ ...prev, maxAttachmentSizeMb: Number(e.target.value) }))} />
                                        </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                        <Form.Group>
                                             <Form.Label htmlFor="settings-setting-max-retries">Max Retries</Form.Label>
                                             <Form.Control id="settings-setting-max-retries" aria-label="Maximum retries" type="number" min={0} max={10} value={settingsForm.maxRetries} onChange={(e) => setSettingsForm((prev) => ({ ...prev, maxRetries: Number(e.target.value) }))} />
                                        </Form.Group>
                                   </Col>
                                   <Col md={12}>
                                        <Form.Group>
                                             <Form.Label htmlFor="settings-setting-retry-backoff-minutes">Retry Backoff Minutes</Form.Label>
                                             <div className="d-flex flex-wrap gap-2">
                                                  {settingsForm.retryBackoffMinutes.map((value, idx) => (
                                                       <div className="d-flex align-items-center gap-1" key={`backoff-${idx}`}>
                                                            <Form.Control id="settings-setting-retry-backoff-minutes"
                                                                 aria-label={`Retry interval ${idx+1}`}
                                                                 style={{ width: 90 }}
                                                                 type="number"
                                                                 min={1}
                                                                 max={1440}
                                                                 value={value}
                                                                 onChange={(e) => {
                                                                      const next = [...settingsForm.retryBackoffMinutes];
                                                                      next[idx] = Number(e.target.value);
                                                                      setSettingsForm((prev) => ({ ...prev, retryBackoffMinutes: next }));
                                                                 }}
                                                            />
                                                            <Button aria-label={`Remove retry interval ${idx+1}`} size="sm" variant="outline-danger" onClick={() => setSettingsForm((prev) => ({ ...prev, retryBackoffMinutes: prev.retryBackoffMinutes.filter((_, i) => i !== idx) }))}>
                                                                 <RiDeleteBinLine size={12} />
                                                            </Button>
                                                       </div>
                                                  ))}
                                                  <Button size="sm" variant="outline-secondary" onClick={() => setSettingsForm((prev) => ({ ...prev, retryBackoffMinutes: [...prev.retryBackoffMinutes, 5] }))}>
                                                       <RiAddLine size={14} className="me-1" />Add
                                                  </Button>
                                             </div>
                                        </Form.Group>
                                   </Col>
                                   <Col md={12}>
                                        <Form.Check type="switch" id="allowMarketingEmails" label="Allow marketing emails" checked={settingsForm.allowMarketingEmails} onChange={(e) => setSettingsForm((prev) => ({ ...prev, allowMarketingEmails: e.target.checked }))} />
                                   </Col>
                                   <Col md={12}>
                                        <Button variant="success" onClick={saveSettings}><RiSaveLine size={14} className="me-1" />{saving?"Saving…":"Save settings"}</Button>
                                   </Col>
                              </Row></fieldset>
                         )}
                    </Card.Body>
               </Card>
          </div>
     );
}
