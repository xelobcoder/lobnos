'use client';

import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert, Card, Badge } from 'react-bootstrap';
import { RiShieldLine, RiLockLine, RiKeyLine, RiUserLine, RiDeleteBinLine, RiRefreshLine, RiSaveLine, RiArrowLeftLine } from '@remixicon/react';
import Link from 'next/link';

export default function BackupSecurityPage() {
     const [encryptionEnabled, setEncryptionEnabled] = useState(true);
     const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('AES-256');
     const [keyRotationDays, setKeyRotationDays] = useState(90);
     const [accessControlEnabled, setAccessControlEnabled] = useState(true);
     const [allowedUsers, setAllowedUsers] = useState(['admin', 'backup_admin']);
     const [secureDeletionEnabled, setSecureDeletionEnabled] = useState(true);
     const [deletionPasses, setDeletionPasses] = useState(3);
     const [currentKeyId, setCurrentKeyId] = useState('KEY-2025-001');
     const [keyLastRotated, setKeyLastRotated] = useState('2025-10-15');
     const [newUser, setNewUser] = useState('');

     const handleAddUser = () => {
          if (newUser.trim() && !allowedUsers.includes(newUser.trim())) {
               setAllowedUsers([...allowedUsers, newUser.trim()]);
               setNewUser('');
          }
     };

     const handleRemoveUser = (user: string) => {
          setAllowedUsers(allowedUsers.filter(u => u !== user));
     };

     const handleRotateKey = () => {
          const newKeyId = `KEY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
          setCurrentKeyId(newKeyId);
          setKeyLastRotated(new Date().toISOString().split('T')[0]);
          alert('Encryption key rotated successfully!');
     };

     const handleSaveSettings = () => {
          console.log('Saving security settings:', {
               encryptionEnabled,
               encryptionAlgorithm,
               keyRotationDays,
               accessControlEnabled,
               allowedUsers,
               secureDeletionEnabled,
               deletionPasses
          });
          alert('Security settings saved successfully!');
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                         <Link href="/settings/records/data-backup-restore">
                              <Button variant="outline-secondary" size="sm">
                                   <RiArrowLeftLine size={16} className="me-2" />
                                   Back to Backup
                              </Button>
                         </Link>
                         <div>
                              <h2 className="mb-1">Backup Security Settings</h2>
                              <p className="text-muted mb-0">Configure encryption, access controls, and security policies for backups</p>
                         </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                         <RiSaveLine size={16} className="me-2" />
                         Save Settings
                    </Button>
               </div>

               <Alert variant="warning" className="mb-4">
                    <div className="d-flex align-items-start gap-3">
                         <RiShieldLine size={20} className="text-warning mt-1" />
                         <div>
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
                                             <Button variant="outline-primary" size="sm" onClick={handleRotateKey}>
                                                  <RiRefreshLine size={14} className="me-1" />
                                                  Rotate Key Now
                                             </Button>
                                        </div>
                                   </Card.Body>
                              </Card>
                         </div>

                         {/* Access Control */}
                         <div className="border bg-white border-secondary-subtle mx-2 p-3 mb-4">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiUserLine size={20} className="text-info" />
                                   <h5 className="mb-0">Access Control</h5>
                              </div>

                              <Form.Group className="mb-3">
                                   <Form.Check
                                        type="switch"
                                        id="access-control-enabled"
                                        label="Enable Access Control"
                                        checked={accessControlEnabled}
                                        onChange={(e) => setAccessControlEnabled(e.target.checked)}
                                   />
                                   <Form.Text className="text-muted">
                                        Restrict backup access to authorized users only
                                   </Form.Text>
                              </Form.Group>

                              {accessControlEnabled && (
                                   <Card className="bg-light">
                                        <Card.Body>
                                             <Form.Group className="mb-3">
                                                  <Form.Label>Add Authorized User</Form.Label>
                                                  <div className="d-flex gap-2">
                                                       <Form.Control
                                                            type="text"
                                                            placeholder="Enter username"
                                                            value={newUser}
                                                            onChange={(e) => setNewUser(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                                                       />
                                                       <Button variant="outline-success" size="sm" onClick={handleAddUser}>
                                                            Add User
                                                       </Button>
                                                  </div>
                                             </Form.Group>

                                             <div className="mb-2">
                                                  <strong>Authorized Users ({allowedUsers.length}):</strong>
                                             </div>
                                             <div className="d-flex flex-wrap gap-2">
                                                  {allowedUsers.map((user: string) => (
                                                       <Badge key={user} bg="info" className="d-flex align-items-center gap-1 px-2 py-1">
                                                            {user}
                                                            <RiArrowLeftLine
                                                                 size={12}
                                                                 className="ms-1 cursor-pointer"
                                                                 onClick={() => handleRemoveUser(user)}
                                                                 style={{ cursor: 'pointer', transform: 'rotate(45deg)' }}
                                                            />
                                                       </Badge>
                                                  ))}
                                             </div>
                                             <small className="text-muted mt-2 d-block">
                                                  Only these users can access, restore, or download backup files
                                             </small>
                                        </Card.Body>
                                   </Card>
                              )}
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
          </div>
     );
}