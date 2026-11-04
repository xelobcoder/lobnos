'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Form, Alert, Card, Badge } from 'react-bootstrap';
import { RiShieldLine, RiLockLine, RiKeyLine, RiDeleteBinLine, RiRefreshLine, RiSaveLine, RiShieldCrossFill, RiHomeLine, RiFolderLine, RiArrowLeftLine } from '@remixicon/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import themeContrast from '../../../../styles/theme-contrast.module.css';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';
import { roleAllowed } from '../../../../components/Auth/roles';
import styles from './page.module.css';

type EncryptionAlgorithm = 'AES-128' | 'AES-256' | 'ChaCha20';

interface BackupSecuritySettingsResponse {
     id: number;
     encryption_enabled: boolean;
     encryption_required?: boolean;
     encryption_algorithm: string;
     encryption_password?: string | null;
     key_rotation_days: number;
     secure_deletion_enabled: boolean;
     deletion_passes: number;
     storage_path?: string | null;
     current_key_id?: string | null;
     key_last_rotated?: string | null;
     is_active?: boolean;
     created_at?: string;
     updated_at?: string;
}

type ValidationErrors = {
     encryption_password?: string;
     confirm_password?: string;
     key_rotation_days?: string;
};

const DEFAULT_STORAGE_PATH = 'C:\\Lobnos\\Backups';

function normalizeEncryptionAlgorithm(value?: string | null): EncryptionAlgorithm {
     if (value === 'AES-128' || value === 'aes-128-cbc') {
          return 'AES-128';
     }

     if (value === 'ChaCha20' || value === 'chacha20') {
          return 'ChaCha20';
     }

     return 'AES-256';
}

function formatRotationDate(value?: string | null): string {
     if (!value) {
          return 'Not yet rotated';
     }

     const parsed = new Date(value);
     if (Number.isNaN(parsed.getTime())) {
          return 'Not yet rotated';
     }

     return parsed.toISOString().split('T')[0];
}

export default function BackupSecurityPage() {
     const { user } = useApplicationSettings().applicationsettings;

     if (!user || !roleAllowed(user.role, ['admin'])) {
          return (
               <div className={`min-vh-100 d-flex flex-column ${themeContrast.controls}`}>
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-body-tertiary">
                         <div className="text-center p-4 bg-body rounded shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
                              <div className="text-danger mb-4">
                                   <RiShieldCrossFill size={64} className="mx-auto" />
                              </div>
                              <h1 className="display-4 fw-bold text-danger mb-4">401</h1>
                              <h2 className="h4 fw-semibold text-body mb-4">Unauthorized Access</h2>
                              <p className="text-muted mb-4">
                                   Sorry, you don&apos;t have permission to access this page. Please contact your administrator if you believe this is a mistake.
                              </p>
                              <Link
                                   href="/"
                                   className="btn btn-primary d-inline-flex align-items-center gap-2"
                              >
                                   <RiHomeLine />
                                   Return to Home
                              </Link>
                         </div>
                    </div>
               </div>
          );
     }

     return <BackupSecuritySettings key={user.employeeid} employeeId={user.employeeid} />;
}

function BackupSecuritySettings({ employeeId }: { employeeId?: number | string | null }) {

     // State variables
     const [encryptionEnabled, setEncryptionEnabled] = useState(true);
     const [encryptionRequired, setEncryptionRequired] = useState(false);
     const [encryptionAlgorithm, setEncryptionAlgorithm] = useState<EncryptionAlgorithm>('AES-256');
     const [encryptionPassword, setEncryptionPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [showEncryptionPassword, setShowEncryptionPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [keyRotationDays, setKeyRotationDays] = useState(90);
     const [secureDeletionEnabled, setSecureDeletionEnabled] = useState(true);
     const [deletionPasses, setDeletionPasses] = useState(3);
     const [currentKeyId, setCurrentKeyId] = useState('KEY-2025-001');
     const [keyLastRotated, setKeyLastRotated] = useState('Not yet rotated');
     const [storagePath, setStoragePath] = useState(DEFAULT_STORAGE_PATH);
     const [storagePathError, setStoragePathError] = useState('');
     const [isActive, setIsActive] = useState(true);
     const [errors, setErrors] = useState<ValidationErrors>({});
     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);
     const [rotating, setRotating] = useState(false);

     const validateStoragePath = (path: string) => {
          if (!path.trim()) {
               setStoragePathError('Storage path is required');
               return false;
          }

          // Basic path validation - check for absolute paths
          const isWindowsPath = /^[A-Za-z]:\\.*/.test(path);
          const isUnixPath = /^\/.*/.test(path);

          if (!isWindowsPath && !isUnixPath) {
               setStoragePathError('Please enter an absolute path (starting with drive letter on Windows or / on Unix/Linux)');
               return false;
          }

          setStoragePathError('');
          return true;
     };

     const validateForm = () => {
          const nextErrors: ValidationErrors = {};

          if (encryptionEnabled && (!encryptionRequired || encryptionPassword.trim() || confirmPassword.trim())) {
               if (!encryptionPassword.trim()) {
                    nextErrors.encryption_password = 'Encryption password is required when encryption is enabled';
               } else if (encryptionPassword.length < 8) {
                    nextErrors.encryption_password = 'Encryption password must be at least 8 characters';
               }

               if (!confirmPassword.trim()) {
                    nextErrors.confirm_password = 'Please confirm the encryption password';
               } else if (encryptionPassword !== confirmPassword) {
                    nextErrors.confirm_password = 'Password confirmation does not match';
               }
          }

          if (!Number.isInteger(keyRotationDays) || keyRotationDays < 30 || keyRotationDays > 365) {
               nextErrors.key_rotation_days = 'Key rotation period must be between 30 and 365 days';
          }

          setErrors(nextErrors);
          return Object.keys(nextErrors).length === 0;
     };

     const loadSecuritySettings = useCallback(() => {
          return customFetch(`security-features/backup/security-settings`).then((response) => {
               if (response.status && response.encryption_required) {
                    setEncryptionRequired(true);
                    setEncryptionEnabled(true);
               }
               if (response.status && response.data) {
                    const settings = response.data as BackupSecuritySettingsResponse;
                    setEncryptionEnabled(Boolean(settings.encryption_required || settings.encryption_enabled));
                    setEncryptionRequired(Boolean(settings.encryption_required));
                    setEncryptionAlgorithm(normalizeEncryptionAlgorithm(settings.encryption_algorithm));
                    setEncryptionPassword(settings.encryption_password || '');
                    setConfirmPassword(settings.encryption_password || '');
                    setKeyRotationDays(settings.key_rotation_days);
                    setSecureDeletionEnabled(settings.secure_deletion_enabled);
                    setDeletionPasses(settings.deletion_passes);
                    setCurrentKeyId(settings.current_key_id || 'Not assigned');
                    setKeyLastRotated(formatRotationDate(settings.key_last_rotated));
                    setStoragePath(settings.storage_path || DEFAULT_STORAGE_PATH);
                    setIsActive(settings.is_active ?? true);
                    setErrors({});
               } else if (response?.status && response?.data == null) {
                    toast.info('No security settings found. Using default values.');
               } else {
                    toast.error('Failed to load security settings');
               }
          }).catch(() => {
               toast.error('Failed to load security settings');
          }).finally(() => {
               setLoading(false);
          });
     }, []);

     useEffect(() => {
          loadSecuritySettings();
     }, [loadSecuritySettings]);

     const handleRotateKey = async () => {
          try {
               setRotating(true);
               const payload = {
                    createdBy: employeeId || 'admin'
               };

               const response = await customPost(`security-features/backup/rotate-key`, 'POST', payload);
               if (response.status && response.data) {
                    setCurrentKeyId(response.data.newKeyId);
                    setKeyLastRotated(new Date().toISOString().split('T')[0]);
                    toast.success('Encryption key rotated successfully!');
                    // Reload settings to get updated data
                    setLoading(true);
                    await loadSecuritySettings();
               } else {
                    toast.error(response.error || 'Failed to rotate encryption key');
               }
          } catch (_error) {
               toast.error('Failed to rotate encryption key');
          } finally {
               setRotating(false);
          }
     };

     const handleSaveSettings = async () => {
          // Validate storage path before saving
          if (!validateStoragePath(storagePath)) {
               toast.error('Please correct the storage path before saving');
               return;
          }

          if (!validateForm()) {
               toast.error('Please correct the highlighted fields before saving');
               return;
          }

          try {
               setSaving(true);
               const payload: Record<string, unknown> = {
                    encryption_enabled: encryptionEnabled,
                    encryption_algorithm: encryptionAlgorithm,
                    key_rotation_days: keyRotationDays,
                    secure_deletion_enabled: secureDeletionEnabled,
                    deletion_passes: deletionPasses,
                    storage_path: storagePath,
                    is_active: isActive,
               };

               if (encryptionEnabled && encryptionPassword.trim()) {
                    payload.encryption_password = encryptionPassword;
               }

               const response = await customPost(`security-features/backup/security-settings`, 'PUT', payload);
               if (response.status) {
                    const updatedSettings = response?.data as BackupSecuritySettingsResponse | undefined;
                    if (updatedSettings) {
                         setEncryptionAlgorithm(normalizeEncryptionAlgorithm(updatedSettings.encryption_algorithm));
                         setEncryptionPassword(updatedSettings.encryption_password || encryptionPassword);
                         setConfirmPassword(updatedSettings.encryption_password || encryptionPassword);
                         setCurrentKeyId(updatedSettings.current_key_id || currentKeyId);
                         setKeyLastRotated(formatRotationDate(updatedSettings.key_last_rotated));
                         setStoragePath(updatedSettings.storage_path || storagePath);
                         setIsActive(updatedSettings.is_active ?? isActive);
                    }
                    setErrors({});
                    toast.success('Security settings saved successfully!');
               } else {
                    toast.error(response.error || 'Failed to save security settings');
               }
          } catch (_error) {
               toast.error('Failed to save security settings');
          } finally {
               setSaving(false);
          }
     };

     return (
          <div className={`${styles.page} ${themeContrast.controls}`}>
               {loading && (
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <div className="mt-2">Loading security settings...</div>
                    </div>
               )}

               {!loading && (
                    <>
                         <Link href="/settings/records/data-backup-restore" className={styles.backLink}>
                              <RiArrowLeftLine size={16} aria-hidden="true" /> Backup &amp; restore
                         </Link>
                         <div className={styles.header}>
                              <div>
                                        <span className={styles.eyebrow}>Records &amp; recovery</span>
                                        <div className={styles.titleRow}>
                                             <h1>Backup security</h1>
                                             <Badge bg={isActive ? 'success' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                        <p className={styles.subtitle}>Protect your backups, manage encryption keys, and choose how files are stored and deleted.</p>
                              </div>
                              <Button variant="primary" className={styles.saveButton} onClick={handleSaveSettings} disabled={saving || rotating || loading}>
                                   <RiSaveLine size={18} className="me-2" aria-hidden="true" />
                                   {saving ? 'Saving...' : 'Save Settings'}
                              </Button>
                         </div>

                         <dl className={styles.overview} aria-label="Backup security configuration overview">
                              <div><dt>Backup encryption</dt><dd>{encryptionEnabled ? 'AES-256-GCM' : 'Off'}<small>{encryptionRequired ? 'Required by the server' : 'Optional encryption policy'}</small></dd></div>
                              <div><dt>Rotation policy</dt><dd>{keyRotationDays} <span>days</span><small>Configured key rotation interval</small></dd></div>
                              <div><dt>Last key rotation</dt><dd>{keyLastRotated}<small>Current encryption key history</small></dd></div>
                              <div><dt>Secure deletion</dt><dd>{secureDeletionEnabled ? `${deletionPasses} ${deletionPasses === 1 ? 'pass' : 'passes'}` : 'Off'}<small>{secureDeletionEnabled ? 'Overwrite policy enabled' : 'Overwrite policy disabled'}</small></dd></div>
                         </dl>
                         <div className={styles.notice} role="note">
                              <RiShieldLine size={20} aria-hidden="true" />
                              <p><strong>Before making changes</strong> Keep recovery keys available. Encryption and storage changes can affect access to your backup files.</p>
                         </div>
                         <fieldset className={styles.settings} disabled={saving || rotating}>
                         <div className={styles.grid}>
                                   {/* Encryption Configuration */}
                                   <section className={styles.panel} aria-labelledby="backup-encryption-heading">
                                        <div className={styles.panelHeading}>
                                             <span className={styles.sectionIcon}><RiLockLine size={20} aria-hidden="true" /></span>
                                             <div><h2 id="backup-encryption-heading">Encryption</h2><p>Protect the contents of new backup files.</p></div>
                                        </div>

                                        <Form>
                                             <Form.Group className="mb-3">
                                                  <Form.Check
                                                       type="switch"
                                                       id="encryption-enabled"
                                                       label="Enable Backup Encryption"
                                                       checked={encryptionEnabled}
                                                       disabled={encryptionRequired}
                                                       onChange={(e) => setEncryptionEnabled(e.target.checked)}
                                                  />
                                                  <Form.Text className="text-muted">
                                                       {encryptionRequired ? 'Required by the server. Keys are managed securely on the host; a settings password is optional.' : 'Encrypt backup files to protect sensitive medical data.'}
                                                  </Form.Text>
                                             </Form.Group>

                                             {encryptionEnabled && (
                                                  <>
                                                       <Row className="mb-3">
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label htmlFor="backup-encryption-algorithm">Encryption Algorithm</Form.Label>
                                                                      <Form.Control value="AES-256-GCM" readOnly id="backup-encryption-algorithm" />
                                                                      <Form.Text>Authenticated encryption for new backups. Existing backups remain readable.</Form.Text>
                                                                 </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label htmlFor="backup-key-rotation-days">Key Rotation Period (Days)</Form.Label>
                                                                      <Form.Control
                                                                           type="number"
                                                                           id="backup-key-rotation-days"
                                                                           value={keyRotationDays}
                                                                           onChange={(e) => setKeyRotationDays(Number(e.target.value))}
                                                                           min="30"
                                                                           max="365"
                                                                           isInvalid={Boolean(errors.key_rotation_days)}
                                                                      />
                                                                      <Form.Control.Feedback type="invalid">{errors.key_rotation_days}</Form.Control.Feedback>
                                                                 </Form.Group>
                                                            </Col>
                                                       </Row>
                                                       <details className={styles.passwordOptions} open={!encryptionRequired}>
                                                       <summary>{encryptionRequired ? 'Optional backup password' : 'Set a backup password'}<span>{encryptionRequired ? 'Host-managed keys do not require a settings password.' : 'A matching password is required when encryption is enabled.'}</span></summary>
                                                       <Row className="g-3">
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label htmlFor="backup-encryption-password">Encryption Password</Form.Label>
                                                                      <div className="input-group">
                                                                           <Form.Control
                                                                                type={showEncryptionPassword ? 'text' : 'password'}
                                                                                id="backup-encryption-password"
                                                                                autoComplete="new-password"
                                                                                value={encryptionPassword}
                                                                                onChange={(e) => setEncryptionPassword(e.target.value)}
                                                                                isInvalid={Boolean(errors.encryption_password)}
                                                                           />
                                                                           <Button
                                                                                variant="outline-secondary"
                                                                                aria-label={showEncryptionPassword ? 'Hide encryption password' : 'Show encryption password'}
                                                                                aria-pressed={showEncryptionPassword}
                                                                                onClick={() => setShowEncryptionPassword((prev) => !prev)}
                                                                           >
                                                                                {showEncryptionPassword ? 'Hide' : 'Show'}
                                                                           </Button>
                                                                           <Form.Control.Feedback type="invalid">{errors.encryption_password}</Form.Control.Feedback>
                                                                      </div>
                                                                 </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label htmlFor="backup-confirm-password">Confirm Encryption Password</Form.Label>
                                                                      <div className="input-group">
                                                                           <Form.Control
                                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                                id="backup-confirm-password"
                                                                                autoComplete="new-password"
                                                                                value={confirmPassword}
                                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                                isInvalid={Boolean(errors.confirm_password)}
                                                                           />
                                                                           <Button
                                                                                variant="outline-secondary"
                                                                                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                                                                                aria-pressed={showConfirmPassword}
                                                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                                           >
                                                                                {showConfirmPassword ? 'Hide' : 'Show'}
                                                                           </Button>
                                                                           <Form.Control.Feedback type="invalid">{errors.confirm_password}</Form.Control.Feedback>
                                                                      </div>
                                                                 </Form.Group>
                                                            </Col>
                                                       </Row>
                                                       </details>
                                                       <Form.Text className="text-muted">
                                                            Rotation policy: {keyRotationDays} days. Use key management to rotate the current key.
                                                       </Form.Text>
                                                  </>
                                             )}
                                        </Form>
                                   </section>

                                   {/* Key Management */}
                                   <section className={styles.panel} aria-labelledby="backup-key-heading">
                                        <div className={styles.panelHeading}>
                                             <span className={styles.sectionIcon}><RiKeyLine size={20} aria-hidden="true" /></span>
                                             <div><h2 id="backup-key-heading">Key management</h2><p>Review the current key and rotate when needed.</p></div>
                                        </div>

                                        <Card className={`bg-body-tertiary ${styles.keyDetails}`}>
                                             <Card.Body>
                                                  <Row className="mb-3">
                                                       <Col md={6}>
                                                            <strong>Current Key ID:</strong>
                                                            <div className="text-monospace font-monospace bg-body p-2 rounded border mt-1">{currentKeyId}</div>
                                                       </Col>
                                                       <Col md={6}>
                                                            <strong>Last Rotated:</strong>
                                                            <div className="bg-body p-2 rounded border mt-1">{keyLastRotated}</div>
                                                       </Col>
                                                  </Row>
                                                  <div className={styles.keyActions}>
                                                       <small className="text-muted">
                                                            Key rotation ensures ongoing security by regularly changing encryption keys
                                                       </small>
                                                       <Button variant="outline-primary" onClick={handleRotateKey} disabled={rotating || saving}>
                                                            <RiRefreshLine size={14} className="me-1" />
                                                            {rotating ? 'Rotating...' : 'Rotate Key Now'}
                                                       </Button>
                                                  </div>
                                             </Card.Body>
                                        </Card>
                                   </section>

                                   {/* Storage Configuration */}
                                   <section className={styles.panel} aria-labelledby="backup-storage-heading">
                                        <div className={styles.panelHeading}>
                                             <span className={styles.sectionIcon}><RiFolderLine size={20} aria-hidden="true" /></span>
                                             <div><h2 id="backup-storage-heading">Backup storage</h2><p>Choose where this server stores backup files.</p></div>
                                        </div>

                                        <Form.Group className="mb-3">
                                             <Form.Label htmlFor="backup-storage-path">Backup Storage Path</Form.Label>
                                             <div className={styles.pathControl}>
                                                  <div>
                                                       <Form.Control
                                                            type="text"
                                                            id="backup-storage-path"
                                                            value={storagePath}
                                                            onChange={(e) => {
                                                                 setStoragePath(e.target.value);
                                                                 if (storagePathError) validateStoragePath(e.target.value);
                                                            }}
                                                            onBlur={(e) => validateStoragePath(e.target.value)}
                                                            placeholder="Enter full path for backup storage (e.g., C:\PLS\Backups or /home/user/backups)"
                                                            isInvalid={!!storagePathError}
                                                       />
                                                       <Form.Control.Feedback type="invalid">
                                                            {storagePathError}
                                                       </Form.Control.Feedback>
                                                  </div>
                                                  <Button
                                                       variant="outline-secondary"
                                                       onClick={() => {
                                                            if (validateStoragePath(storagePath)) {
                                                                 toast.success('Storage path format is valid');
                                                            }
                                                       }}
                                                       disabled={!storagePath.trim()}
                                                  >
                                                       Validate
                                                  </Button>
                                             </div>
                                             <Form.Text className="text-muted">
                                                  Specify the directory where backup files will be stored. Use absolute paths for best results.
                                             </Form.Text>
                                        </Form.Group>

                                        <Alert variant="info" className={styles.storageNote}>
                                             <small>
                                                  <strong>Server directory</strong> The directory must exist and be writable by the application. Validate checks the path format, not directory access.
                                             </small>
                                        </Alert>
                                   </section>

                                   {/* Secure Deletion */}
                                   <section className={styles.panel} aria-labelledby="backup-deletion-heading">
                                        <div className={styles.panelHeading}>
                                             <span className={styles.sectionIcon}><RiDeleteBinLine size={20} aria-hidden="true" /></span>
                                             <div><h2 id="backup-deletion-heading">Secure deletion</h2><p>Control overwriting when backup files are deleted.</p></div>
                                        </div>

                                        <Form.Group className="mb-3">
                                             <Form.Check
                                                  type="switch"
                                                  id="secure-deletion-enabled"
                                                  label="Enable Secure Deletion"
                                                  checked={secureDeletionEnabled}
                                                  onChange={(e) => setSecureDeletionEnabled(e.target.checked)}
                                             />
                                             <Form.Text className="text-muted">
                                                  Overwrite deleted backup files multiple times to prevent data recovery
                                             </Form.Text>
                                        </Form.Group>

                                        {secureDeletionEnabled && (
                                             <Card className="bg-body-tertiary">
                                                  <Card.Body>
                                                       <Form.Group className="mb-3">
                                                            <Form.Label htmlFor="backup-deletion-passes">Deletion Security Level</Form.Label>
                                                            <Form.Select id="backup-deletion-passes" value={deletionPasses} onChange={(e) => setDeletionPasses(Number(e.target.value))}>
                                                                 <option value="1">1 pass - fastest</option>
                                                                 <option value="3">3 passes - standard</option>
                                                                 <option value="7">7 passes - extended</option>
                                                                 <option value="35">35 passes - slowest</option>
                                                            </Form.Select>
                                                       </Form.Group>
                                                       <Alert variant="info" className="mb-0">
                                                            <small>
                                                                 More passes take longer. The effectiveness of overwriting depends on the storage hardware.
                                                            </small>
                                                       </Alert>
                                                  </Card.Body>
                                             </Card>
                                        )}
                                   </section>
                         </div>
                         </fieldset>
                         <div className={styles.footer}><p>Settings apply to this server&apos;s backup policy.</p><Button variant="primary" onClick={handleSaveSettings} disabled={saving || rotating}><RiSaveLine size={18} className="me-2" aria-hidden="true" />{saving ? 'Saving...' : 'Save Settings'}</Button></div>
                    </>
               )}
          </div>
     );
}