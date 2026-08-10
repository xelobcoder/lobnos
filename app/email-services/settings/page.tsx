'use client';

import React, { useEffect, useState } from 'react';
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

     const [loading, setLoading] = useState(false);
     const [providers, setProviders] = useState<EmailProvider[]>([]);
     const [settingsForm, setSettingsForm] = useState<EmailSettings>(defaultSettingsForm);

     const loadProviders = async () => {
          const response = await callGet('email/providers');
          setProviders(parseList<EmailProvider>(response).map(mapProviderFromApi));
     };

     const loadSettings = async () => {
          const response = await callGet('email/settings');
          const source = response?.result || {};
          setSettingsForm({
               defaultProviderId: source.default_provider_id ?? null,
               maxAttachmentSizeMb: Number(source.max_attachment_size_mb ?? 10),
               maxRetries: Number(source.max_retries ?? 3),
               retryBackoffMinutes: parseJsonArray(source.retry_backoff_minutes_json).map((x) => Number(x)).filter((x) => !Number.isNaN(x)),
               allowMarketingEmails: Boolean(source.allow_marketing_emails ?? true),
          });
     };

     const loadAll = async () => {
          setLoading(true);
          try {
               await Promise.all([loadProviders(), loadSettings()]);
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load settings');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadAll();
     }, []);

     const saveSettings = async () => {
          const retries = Number(settingsForm.maxRetries);
          if (retries < 0 || retries > 10) {
               toast.error('maxRetries must be between 0 and 10');
               return;
          }

          const invalidBackoff = settingsForm.retryBackoffMinutes.some((x) => x < 1 || x > 1440 || Number.isNaN(x));
          if (invalidBackoff) {
               toast.error('retryBackoffMinutes values must be between 1 and 1440');
               return;
          }

          try {
               await callMutate('email/settings', 'PUT', {
                    defaultProviderId: settingsForm.defaultProviderId,
                    maxAttachmentSizeMb: Number(settingsForm.maxAttachmentSizeMb),
                    maxRetries: retries,
                    retryBackoffMinutes: settingsForm.retryBackoffMinutes,
                    allowMarketingEmails: settingsForm.allowMarketingEmails,
                    updatedBy: employeeid || undefined,
               });
               toast.success('Settings updated');
               await loadSettings();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to update settings');
          }
     };

     return (
          <div className={`container-fluid ${styles.pageRoot}`}>
               <PrimeToast />
               <EmailPageHero
                    title="Delivery Settings"
                    subtitle="Control default provider behavior, attachment constraints, and retry windows in one standard control plane."
                    icon={<RiSettings4Line size={16} />}
                    badge="Email Core"
                    stats={[
                         { label: 'Providers', value: providers.length },
                         { label: 'Retries', value: settingsForm.maxRetries },
                         { label: 'Backoff Steps', value: settingsForm.retryBackoffMinutes.length },
                    ]}
               />
               <Card className={styles.surfaceCard}>
                    <Card.Header className={`${styles.surfaceHeader} d-flex align-items-center gap-2`}>
                         <RiSettings4Line size={18} /> <strong className={styles.surfaceTitle}>Email Settings</strong>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading settings...</div>
                         ) : (
                              <Row className="g-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Default Provider</Form.Label>
                                             <Form.Select value={settingsForm.defaultProviderId ?? ''} onChange={(e) => setSettingsForm((prev) => ({ ...prev, defaultProviderId: e.target.value ? Number(e.target.value) : null }))}>
                                                  <option value="">Select provider</option>
                                                  {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                        <Form.Group>
                                             <Form.Label>Max Attachment Size (MB)</Form.Label>
                                             <Form.Control type="number" min={1} value={settingsForm.maxAttachmentSizeMb} onChange={(e) => setSettingsForm((prev) => ({ ...prev, maxAttachmentSizeMb: Number(e.target.value) }))} />
                                        </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                        <Form.Group>
                                             <Form.Label>Max Retries</Form.Label>
                                             <Form.Control type="number" min={0} max={10} value={settingsForm.maxRetries} onChange={(e) => setSettingsForm((prev) => ({ ...prev, maxRetries: Number(e.target.value) }))} />
                                        </Form.Group>
                                   </Col>
                                   <Col md={12}>
                                        <Form.Group>
                                             <Form.Label>Retry Backoff Minutes</Form.Label>
                                             <div className="d-flex flex-wrap gap-2">
                                                  {settingsForm.retryBackoffMinutes.map((value, idx) => (
                                                       <div className="d-flex align-items-center gap-1" key={`backoff-${idx}`}>
                                                            <Form.Control
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
                                                            <Button size="sm" variant="outline-danger" onClick={() => setSettingsForm((prev) => ({ ...prev, retryBackoffMinutes: prev.retryBackoffMinutes.filter((_, i) => i !== idx) }))}>
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
                                        <Button variant="success" onClick={saveSettings}><RiSaveLine size={14} className="me-1" />Save Settings</Button>
                                   </Col>
                              </Row>
                         )}
                    </Card.Body>
               </Card>
          </div>
     );
}
