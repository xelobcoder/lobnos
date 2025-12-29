'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Alert, Card, Badge } from 'react-bootstrap';
import { RiShieldLine, RiLockLine, RiKeyLine, RiDeleteBinLine, RiRefreshLine, RiSaveLine, RiShieldCrossFill, RiHomeLine, RiFolderLine } from '@remixicon/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';


export default function BackupSecurityPage() {
     const { user } = useApplicationSettings().applicationsettings;

     // State variables
     const [encryptionEnabled, setEncryptionEnabled] = useState(true);
     const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('AES-256');
     const [keyRotationDays, setKeyRotationDays] = useState(90);
     const [secureDeletionEnabled, setSecureDeletionEnabled] = useState(true);
     const [deletionPasses, setDeletionPasses] = useState(3);
     const [currentKeyId, setCurrentKeyId] = useState('KEY-2025-001');
     const [keyLastRotated, setKeyLastRotated] = useState('2025-10-15');
     const [storagePath, setStoragePath] = useState('C:\\Lobnos\\Backups');
     const [storagePathError, setStoragePathError] = useState('');
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

     // Load security settings on component mount
     useEffect(() => {
          loadSecuritySettings();
     }, []);

     // Admin access control
     if (!user || user.role !== 'admin') {
          return (
               <div className="min-vh-100 d-flex flex-column">
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
                         <div className="text-center p-4 bg-white rounded shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
                              <div className="text-danger mb-4">
                                   <RiShieldCrossFill size={64} className="mx-auto" />
                              </div>
                              <h1 className="display-4 fw-bold text-danger mb-4">401</h1>
                              <h2 className="h4 fw-semibold text-dark mb-4">Unauthorized Access</h2>
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

     const loadSecuritySettings = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`security-features/backup/security-settings`);
               if (response.status && response.data) {
                    const settings = response.data;
                    setEncryptionEnabled(settings.encryption_enabled);
                    setEncryptionAlgorithm(settings.encryption_algorithm === 'aes-256-cbc' ? 'AES-256' :
                         settings.encryption_algorithm === 'aes-128-cbc' ? 'AES-128' : 'ChaCha20');
                    setKeyRotationDays(settings.key_rotation_days);
                    setSecureDeletionEnabled(settings.secure_deletion_enabled);
                    setDeletionPasses(settings.deletion_passes);
                    setCurrentKeyId(settings.current_key_id);
                    setKeyLastRotated(new Date(settings.key_last_rotated).toISOString().split('T')[0]);
                    setStoragePath(settings.storage_path || 'C:\\Lobnos\\Backups');
               } else if (response?.status && response?.data == null) {
                    toast.info('No security settings found. Using default values.');
               } else {
                    toast.error('Failed to load security settings');
               }
          } catch (error) {
               console.error('Error loading security settings:', error);
               toast.error('Failed to load security settings');
          } finally {
               setLoading(false);
          }
     };

     const handleRotateKey = async () => {
          try {
               setRotating(true);
               const payload = {
                    createdBy: user?.employeeid || 'admin'
               };

               const response = await customPost(`security-features/backup/rotate-key`, 'POST', payload);
               if (response.status && response.data) {
                    setCurrentKeyId(response.data.newKeyId);
                    setKeyLastRotated(new Date().toISOString().split('T')[0]);
                    toast.success('Encryption key rotated successfully!');
                    // Reload settings to get updated data
                    await loadSecuritySettings();
               } else {
                    toast.error(response.error || 'Failed to rotate encryption key');
               }
          } catch (error) {
               console.error('Error rotating key:', error);
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

          try {
               setSaving(true);
               const payload = {
                    encryption_enabled: encryptionEnabled,
                    encryption_algorithm: encryptionAlgorithm === 'AES-256' ? 'aes-256-cbc' :
                         encryptionAlgorithm === 'AES-128' ? 'aes-128-cbc' : 'chacha20',
                    key_rotation_days: keyRotationDays,
                    secure_deletion_enabled: secureDeletionEnabled,
                    deletion_passes: deletionPasses,
                    storage_path: storagePath
               };

               const response = await customPost(`security-features/backup/security-settings`, 'PUT', payload);
               if (response.status) {
                    toast.success('Security settings saved successfully!');
               } else {
                    toast.error(response.error || 'Failed to save security settings');
               }
          } catch (error) {
               console.error('Error saving security settings:', error);
               toast.error('Failed to save security settings');
          } finally {
               setSaving(false);
          }
     };

     return (
          <div className="container-fluid p-4">
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
                         <div className="d-flex align-items-center justify-content-between mb-4">
                              <div className="d-flex align-items-center gap-3">
                                   <div>
                                        <h4 className="mb-1">Backup Security Settings</h4>
                                        <p className="text-muted mb-0 fs-6">Configure encryption, access controls, and security policies for backups</p>
                                   </div>
                              </div>
                              <Button variant="primary" size="sm" onClick={handleSaveSettings} disabled={saving || loading}>
                                   <RiSaveLine size={16} className="me-2" />
                                   {saving ? 'Saving...' : 'Save Settings'}
                              </Button>
                         </div>

                         <Alert variant="warning" className="mb-4">
                              <div className="d-flex align-items-start gap-3">
                                   <RiShieldLine size={20} className="text-warning mt-1" />
                                   <div className="small">
                                        <strong>Security Notice:</strong> These settings control the security of your backup files. Changes may affect data accessibility and compliance requirements. Ensure you understand the implications before modifying these settings.
                                   </div>
                              </div>
                         </Alert>

                         <Row className="g-4">
                              <Col lg={12}>
                                   {/* Encryption Configuration */}
                                   <div className="border bg-white border-secondary-subtle mx-2 p-3 mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                             <RiLockLine size={20} className="text-primary" />
                                             <h5 className="mb-0">Encryption Configuration</h5>
                                        </div>

                                        <Form>
                                             <Form.Group className="mb-3">
                                                  <Form.Check
                                                       type="switch"
                                                       id="encryption-enabled"
                                                       label="Enable Backup Encryption"
                                                       checked={encryptionEnabled}
                                                       onChange={(e) => setEncryptionEnabled(e.target.checked)}
                                                  />
                                                  <Form.Text className="text-muted">
                                                       Encrypt all backup files to protect sensitive medical data
                                                  </Form.Text>
                                             </Form.Group>

                                             {encryptionEnabled && (
                                                  <>
                                                       <Row className="mb-3">
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label>Encryption Algorithm</Form.Label>
                                                                      <Form.Select value={encryptionAlgorithm} onChange={(e) => setEncryptionAlgorithm(e.target.value)}>
                                                                           <option value="AES-128">AES-128 (Fast)</option>
                                                                           <option value="AES-256">AES-256 (Secure)</option>
                                                                           <option value="ChaCha20">ChaCha20 (Modern)</option>
                                                                      </Form.Select>
                                                                 </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                 <Form.Group>
                                                                      <Form.Label>Key Rotation Period (Days)</Form.Label>
                                                                      <Form.Control
                                                                           type="number"
                                                                           value={keyRotationDays}
                                                                           onChange={(e) => setKeyRotationDays(Number(e.target.value))}
                                                                           min="30"
                                                                           max="365"
                                                                      />
                                                                 </Form.Group>
                                                            </Col>
                                                       </Row>
                                                       <Form.Text className="text-muted">
                                                            Automatically rotate encryption keys every {keyRotationDays} days for enhanced security
                                                       </Form.Text>
                                                  </>
                                             )}
                                        </Form>
                                   </div>

                                   {/* Key Management */}
                                   <div className="border bg-white border-secondary-subtle mx-2 p-3 mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                             <RiKeyLine size={20} className="text-success" />
                                             <h5 className="mb-0">Key Management</h5>
                                        </div>

                                        <Card className="bg-light">
                                             <Card.Body>
                                                  <Row className="mb-3">
                                                       <Col md={6}>
                                                            <strong>Current Key ID:</strong>
                                                            <div className="text-monospace font-monospace bg-white p-2 rounded border mt-1">{currentKeyId}</div>
                                                       </Col>
                                                       <Col md={6}>
                                                            <strong>Last Rotated:</strong>
                                                            <div className="bg-white p-2 rounded border mt-1">{keyLastRotated}</div>
                                                       </Col>
                                                  </Row>
                                                  <div className="d-flex justify-content-between align-items-center">
                                                       <small className="text-muted">
                                                            Key rotation ensures ongoing security by regularly changing encryption keys
                                                       </small>
                                                       <Button variant="outline-primary" size="sm" onClick={handleRotateKey} disabled={rotating}>
                                                            <RiRefreshLine size={14} className="me-1" />
                                                            {rotating ? 'Rotating...' : 'Rotate Key Now'}
                                                       </Button>
                                                  </div>
                                             </Card.Body>
                                        </Card>
                                   </div>

                                   {/* Storage Configuration */}
                                   <div className="border bg-white border-secondary-subtle mx-2 p-3 mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                             <RiFolderLine size={20} className="text-info" />
                                             <h5 className="mb-0">Storage Configuration</h5>
                                        </div>

                                        <Form.Group className="mb-3">
                                             <Form.Label>Backup Storage Path</Form.Label>
                                             <div className="d-flex gap-2 mb-3">
                                                  <div className="flex-grow-1">
                                                       <Form.Control
                                                            type="text"
                                                            value={storagePath}
                                                            onChange={(e) => {
                                                                 setStoragePath(e.target.value);
                                                                 if (storagePathError) validateStoragePath(e.target.value);
                                                            }}
                                                            onBlur={(e) => validateStoragePath(e.target.value)}
                                                            placeholder="Enter full path for backup storage (e.g., C:\Lobnos\Backups or /home/user/backups)"
                                                            isInvalid={!!storagePathError}
                                                       />
                                                       <Form.Control.Feedback type="invalid">
                                                            {storagePathError}
                                                       </Form.Control.Feedback>
                                                  </div>
                                                  <Button
                                                       variant="outline-secondary"
                                                       size="sm"
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

                                        <Alert variant="info">
                                             <small>
                                                  <strong>Path Requirements:</strong> Ensure the specified directory exists and the application has write permissions. Use forward slashes (/) on Linux/Unix systems and backslashes (\) on Windows.
                                             </small>
                                        </Alert>
                                   </div>

                                   {/* Secure Deletion */}
                                   <div className="border bg-white border-secondary-subtle mx-2 p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                             <RiDeleteBinLine size={20} className="text-danger" />
                                             <h5 className="mb-0">Secure Deletion</h5>
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
                                             <Card className="bg-light">
                                                  <Card.Body>
                                                       <Form.Group className="mb-3">
                                                            <Form.Label>Deletion Security Level</Form.Label>
                                                            <Form.Select value={deletionPasses} onChange={(e) => setDeletionPasses(Number(e.target.value))}>
                                                                 <option value="1">1 Pass - Fast (Basic security)</option>
                                                                 <option value="3">3 Passes - Standard (Good security)</option>
                                                                 <option value="7">7 Passes - Enhanced (High security)</option>
                                                                 <option value="35">35 Passes - Military Grade (Maximum security)</option>
                                                            </Form.Select>
                                                       </Form.Group>
                                                       <Alert variant="info" className="mb-0">
                                                            <small>
                                                                 <strong>Note:</strong> Higher security levels take longer to delete files but provide better protection against data recovery attempts.
                                                            </small>
                                                       </Alert>
                                                  </Card.Body>
                                             </Card>
                                        )}
                                   </div>
                              </Col>
                         </Row>
                    </>
               )}
          </div>
     );
}