'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { RiLockPasswordLine, RiRefreshLine, RiSaveLine, RiTimeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

type BackupPolicyFrequency = 'hourly' | 'every_3_hours' | 'daily' | 'weekly' | 'monthly';

interface BackupPolicyResponse {
     id: number;
     frequency: BackupPolicyFrequency;
     backup_time: string;
     retention_file_count: number;
     is_active: boolean;
     created_by?: number | null;
     updated_by?: number | null;
     created_at?: string;
     updated_at?: string;
}

interface UpdateBackupPolicyPayload {
     encryption_password?: string;
     frequency?: BackupPolicyFrequency;
     backup_time?: string;
     retention_file_count?: number;
     is_active?: boolean;
     updated_by?: number;
}

type ValidationErrors = {
     frequency?: string;
     backup_time?: string;
     retention_file_count?: string;
     encryption_password?: string;
     confirm_password?: string;
};

const DEFAULT_POLICY: BackupPolicyResponse = {
     id: 0,
     frequency: 'daily',
     backup_time: '00:00',
     retention_file_count: 50,
     is_active: true,
};

const FREQUENCY_OPTIONS: Array<{ value: BackupPolicyFrequency; label: string; hint: string }> = [
     { value: 'hourly', label: 'Hourly', hint: 'Runs every hour.' },
     { value: 'every_3_hours', label: 'Every 3 Hours', hint: 'Runs every 3 hours.' },
     { value: 'daily', label: 'Daily', hint: 'Runs daily at selected time.' },
     { value: 'weekly', label: 'Weekly', hint: 'Runs weekly at selected time.' },
     { value: 'monthly', label: 'Monthly', hint: 'Runs monthly at selected time.' },
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizePolicy(data: BackupPolicyResponse | null | undefined): BackupPolicyResponse {
     if (!data) {
          return { ...DEFAULT_POLICY };
     }

     return {
          id: data.id || 0,
          frequency: data.frequency || 'daily',
          backup_time: data.backup_time || '00:00',
          retention_file_count: Number(data.retention_file_count) >= 1 ? Number(data.retention_file_count) : 50,
          is_active: data.is_active ?? true,
          created_by: data.created_by,
          updated_by: data.updated_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
     };
}

export default function RecordsSettingsPage() {
     const appContext = useApplicationSettings();
     const user = appContext?.applicationsettings?.user;

     const [policy, setPolicy] = useState<BackupPolicyResponse>({ ...DEFAULT_POLICY });
     const [initialPolicy, setInitialPolicy] = useState<BackupPolicyResponse>({ ...DEFAULT_POLICY });
     const [useEncryptionPassword, setUseEncryptionPassword] = useState(false);
     const [encryptionPassword, setEncryptionPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [errors, setErrors] = useState<ValidationErrors>({});
     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);

     const selectedFrequencyHint = useMemo(() => {
          return FREQUENCY_OPTIONS.find((option) => option.value === policy.frequency)?.hint || '';
     }, [policy.frequency]);

     const clearSensitiveFields = () => {
          setEncryptionPassword('');
          setConfirmPassword('');
          setUseEncryptionPassword(false);
     };

     const validate = (): boolean => {
          const validationErrors: ValidationErrors = {};
          const validFrequencyValues = FREQUENCY_OPTIONS.map((item) => item.value);

          if (!validFrequencyValues.includes(policy.frequency)) {
               validationErrors.frequency = 'Please select a valid backup frequency.';
          }

          if (!TIME_REGEX.test(policy.backup_time)) {
               validationErrors.backup_time = 'Backup time must be in HH:MM (24-hour) format.';
          }

          if (!Number.isInteger(policy.retention_file_count) || policy.retention_file_count < 1) {
               validationErrors.retention_file_count = 'Retention file count must be an integer of at least 1.';
          }

          if (useEncryptionPassword) {
               if (encryptionPassword.length === 0) {
                    validationErrors.encryption_password = 'Enter a backup encryption password.';
               } else if (encryptionPassword.length < 8) {
                    validationErrors.encryption_password = 'Password must be at least 8 characters.';
               }

               if (confirmPassword.length === 0) {
                    validationErrors.confirm_password = 'Confirm your encryption password.';
               } else if (encryptionPassword !== confirmPassword) {
                    validationErrors.confirm_password = 'Password and confirm password do not match.';
               }
          }

          setErrors(validationErrors);
          return Object.keys(validationErrors).length === 0;
     };

     const loadPolicy = async () => {
          try {
               setLoading(true);
               const response = await customFetch('security-features/backup/policy');
               const incoming = normalizePolicy(response?.data);
               setPolicy(incoming);
               setInitialPolicy(incoming);
          } catch (_error) {
               toast.error('Failed to load backup policy.');
               const fallback = { ...DEFAULT_POLICY };
               setPolicy(fallback);
               setInitialPolicy(fallback);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadPolicy();
     }, []);

     // Clear plaintext password fields when leaving this route.
     useEffect(() => {
          return () => {
               clearSensitiveFields();
          };
     }, []);

     const handleSave = async () => {
          if (!validate()) {
               return;
          }

          try {
               setSaving(true);

               const payload: UpdateBackupPolicyPayload = {
                    frequency: policy.frequency,
                    backup_time: policy.backup_time,
                    retention_file_count: policy.retention_file_count,
                    is_active: policy.is_active,
                    updated_by: Number(user?.employeeid) || undefined,
               };

               if (useEncryptionPassword && encryptionPassword) {
                    payload.encryption_password = encryptionPassword;
               }

               const response = await customPost('security-features/backup/policy', 'PUT', payload);

               if (response?.status === true) {
                    const updatedPolicy = normalizePolicy(response?.data || policy);
                    setPolicy(updatedPolicy);
                    setInitialPolicy(updatedPolicy);
                    clearSensitiveFields();
                    setErrors({});
                    toast.success(response?.message || 'Backup policy updated successfully.');
                    return;
               }

               toast.error(response?.error || response?.message || 'Failed to update backup policy.');
          } catch (_error) {
               toast.error('Failed to update backup policy.');
          } finally {
               setSaving(false);
          }
     };

     const handleReset = () => {
          setPolicy({ ...initialPolicy });
          setErrors({});
          clearSensitiveFields();
     };

     if (!appContext?.applicationsettings) {
          return (
               <div className="container-fluid p-4">
                    <div className="text-center py-5">
                         <Spinner animation="border" role="status" className="text-primary">
                              <span className="visually-hidden">Loading...</span>
                         </Spinner>
                    </div>
               </div>
          );
     }

     if (user?.role !== 'admin') {
          return (
               <div className="container-fluid p-4">
                    <Alert variant="danger" className="mb-0">
                         You do not have permission to manage backup policy settings.
                    </Alert>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
                    <div>
                         <h2 className="mb-1">Backup Policy Settings</h2>
                         <p className="text-muted mb-0">Configure backup encryption, schedule, and retention policy.</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-secondary" onClick={handleReset} disabled={loading || saving}>
                              <RiRefreshLine size={16} className="me-1" />
                              Reset
                         </Button>
                         <Button variant="primary" onClick={handleSave} disabled={loading || saving}>
                              <RiSaveLine size={16} className="me-1" />
                              {saving ? 'Saving...' : 'Save Policy'}
                         </Button>
                    </div>
               </div>

               {loading ? (
                    <div className="text-center py-5">
                         <Spinner animation="border" role="status" className="text-primary">
                              <span className="visually-hidden">Loading...</span>
                         </Spinner>
                         <div className="mt-2 text-muted">Loading backup policy...</div>
                    </div>
               ) : (
                    <Row className="g-4">
                         <Col lg={8}>
                              <Card className="shadow-sm mb-4">
                                   <Card.Header className="bg-white">
                                        <div className="d-flex align-items-center gap-2">
                                             <RiLockPasswordLine size={20} className="text-primary" />
                                             <h5 className="mb-0">Encryption</h5>
                                        </div>
                                   </Card.Header>
                                   <Card.Body>
                                        <Form.Group className="mb-3">
                                             <Form.Check
                                                  type="switch"
                                                  id="use-encryption-password"
                                                  label="Use encryption password"
                                                  checked={useEncryptionPassword}
                                                  onChange={(e) => {
                                                       const checked = e.target.checked;
                                                       setUseEncryptionPassword(checked);
                                                       if (!checked) {
                                                            setEncryptionPassword('');
                                                            setConfirmPassword('');
                                                            setErrors((prev) => ({
                                                                 ...prev,
                                                                 encryption_password: undefined,
                                                                 confirm_password: undefined,
                                                            }));
                                                       }
                                                  }}
                                             />
                                             <Form.Text className="text-muted">
                                                  Password is hashed and never shown again.
                                             </Form.Text>
                                        </Form.Group>

                                        {useEncryptionPassword && (
                                             <Row className="g-3">
                                                  <Col md={6}>
                                                       <Form.Group>
                                                            <Form.Label>Encryption Password</Form.Label>
                                                            <Form.Control
                                                                 type="password"
                                                                 autoComplete="new-password"
                                                                 value={encryptionPassword}
                                                                 onChange={(e) => setEncryptionPassword(e.target.value)}
                                                                 isInvalid={Boolean(errors.encryption_password)}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                 {errors.encryption_password}
                                                            </Form.Control.Feedback>
                                                       </Form.Group>
                                                  </Col>
                                                  <Col md={6}>
                                                       <Form.Group>
                                                            <Form.Label>Confirm Password</Form.Label>
                                                            <Form.Control
                                                                 type="password"
                                                                 autoComplete="new-password"
                                                                 value={confirmPassword}
                                                                 onChange={(e) => setConfirmPassword(e.target.value)}
                                                                 isInvalid={Boolean(errors.confirm_password)}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                 {errors.confirm_password}
                                                            </Form.Control.Feedback>
                                                       </Form.Group>
                                                  </Col>
                                             </Row>
                                        )}
                                   </Card.Body>
                              </Card>

                              <Card className="shadow-sm mb-4">
                                   <Card.Header className="bg-white">
                                        <div className="d-flex align-items-center gap-2">
                                             <RiTimeLine size={20} className="text-success" />
                                             <h5 className="mb-0">Schedule</h5>
                                        </div>
                                   </Card.Header>
                                   <Card.Body>
                                        <Row className="g-3">
                                             <Col md={6}>
                                                  <Form.Group>
                                                       <Form.Label>Frequency</Form.Label>
                                                       <Form.Select
                                                            value={policy.frequency}
                                                            onChange={(e) =>
                                                                 setPolicy((prev) => ({
                                                                      ...prev,
                                                                      frequency: e.target.value as BackupPolicyFrequency,
                                                                 }))
                                                            }
                                                            isInvalid={Boolean(errors.frequency)}
                                                       >
                                                            {FREQUENCY_OPTIONS.map((option) => (
                                                                 <option key={option.value} value={option.value}>
                                                                      {option.label}
                                                                 </option>
                                                            ))}
                                                       </Form.Select>
                                                       <Form.Control.Feedback type="invalid">{errors.frequency}</Form.Control.Feedback>
                                                  </Form.Group>
                                             </Col>
                                             <Col md={6}>
                                                  <Form.Group>
                                                       <Form.Label>Backup Time (HH:MM)</Form.Label>
                                                       <Form.Control
                                                            type="time"
                                                            value={policy.backup_time}
                                                            onChange={(e) =>
                                                                 setPolicy((prev) => ({
                                                                      ...prev,
                                                                      backup_time: e.target.value,
                                                                 }))
                                                            }
                                                            isInvalid={Boolean(errors.backup_time)}
                                                       />
                                                       <Form.Control.Feedback type="invalid">{errors.backup_time}</Form.Control.Feedback>
                                                  </Form.Group>
                                             </Col>
                                        </Row>
                                        <div className="small text-muted mt-3">{selectedFrequencyHint}</div>
                                   </Card.Body>
                              </Card>

                              <Card className="shadow-sm">
                                   <Card.Header className="bg-white">
                                        <h5 className="mb-0">Retention</h5>
                                   </Card.Header>
                                   <Card.Body>
                                        <Form.Group>
                                             <Form.Label>Max backup files to keep</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  min={1}
                                                  step={1}
                                                  value={policy.retention_file_count}
                                                  onChange={(e) =>
                                                       setPolicy((prev) => ({
                                                            ...prev,
                                                            retention_file_count: Number(e.target.value),
                                                       }))
                                                  }
                                                  isInvalid={Boolean(errors.retention_file_count)}
                                             />
                                             <Form.Control.Feedback type="invalid">
                                                  {errors.retention_file_count}
                                             </Form.Control.Feedback>
                                             <Form.Text className="text-muted">
                                                  Older files are deleted after successful backups when above this count.
                                             </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mt-3">
                                             <Form.Check
                                                  type="switch"
                                                  id="backup-policy-active"
                                                  label="Backup policy is active"
                                                  checked={policy.is_active}
                                                  onChange={(e) =>
                                                       setPolicy((prev) => ({
                                                            ...prev,
                                                            is_active: e.target.checked,
                                                       }))
                                                  }
                                             />
                                        </Form.Group>
                                   </Card.Body>
                              </Card>
                         </Col>

                         <Col lg={4}>
                              <Card className="shadow-sm">
                                   <Card.Header className="bg-white">
                                        <h6 className="mb-0">Policy Notes</h6>
                                   </Card.Header>
                                   <Card.Body className="small">
                                        <p className="mb-2">1. Passwords are never returned by the API after save.</p>
                                        <p className="mb-2">2. Use a strong password with at least 8 characters.</p>
                                        <p className="mb-2">3. Keep backup windows outside peak operational hours.</p>
                                        <p className="mb-0">4. Use HTTPS in production environments.</p>
                                   </Card.Body>
                              </Card>
                         </Col>
                    </Row>
               )}
          </div>
     );
}