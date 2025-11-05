import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface ScheduleForm {
     schedule_name: string;
     frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
     backup_time: string;
     retention_days: number;
     backup_type: 'database' | 'files' | 'full_system';
     is_active: boolean;
}

interface BackupScheduleModalProps {
     show: boolean;
     onHide: () => void;
     title: string;
     scheduleForm: ScheduleForm;
     setScheduleForm: (form: ScheduleForm) => void;
     onSubmit: () => void;
     loading: boolean;
     isEdit?: boolean;
}

const FREQUENCY_OPTIONS = [
     { value: 'hourly', label: 'Hourly' },
     { value: 'daily', label: 'Daily' },
     { value: 'weekly', label: 'Weekly' },
     { value: 'monthly', label: 'Monthly' }
];

const BACKUP_TYPE_OPTIONS = [
     { value: 'database', label: 'Database Only' },
     { value: 'files', label: 'Files Only' },
     { value: 'full_system', label: 'Full System' }
];

export default function BackupScheduleModal({
     show,
     onHide,
     title,
     scheduleForm,
     setScheduleForm,
     onSubmit,
     loading,
     isEdit = false
}: BackupScheduleModalProps) {
     const updateForm = (updates: Partial<ScheduleForm>) => {
          setScheduleForm({ ...scheduleForm, ...updates });
     };

     return (
          <Modal show={show} onHide={onHide} size="lg">
               <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    <Form>
                         <Form.Group className="mb-3">
                              <Form.Label>Schedule Name *</Form.Label>
                              <Form.Control
                                   type="text"
                                   value={scheduleForm.schedule_name}
                                   onChange={(e) => updateForm({ schedule_name: e.target.value })}
                                   placeholder="e.g., Daily Database Backup"
                                   maxLength={255}
                              />
                         </Form.Group>

                         <Row className="mb-3">
                              <Col md={6}>
                                   <Form.Group>
                                        <Form.Label>Frequency *</Form.Label>
                                        <Form.Select
                                             value={scheduleForm.frequency}
                                             onChange={(e) => updateForm({ frequency: e.target.value as any })}
                                        >
                                             {FREQUENCY_OPTIONS.map(option => (
                                                  <option key={option.value} value={option.value}>
                                                       {option.label}
                                                  </option>
                                             ))}
                                        </Form.Select>
                                   </Form.Group>
                              </Col>
                              <Col md={6}>
                                   <Form.Group>
                                        <Form.Label>Backup Time *</Form.Label>
                                        <Form.Control
                                             type="time"
                                             value={scheduleForm.backup_time}
                                             onChange={(e) => updateForm({ backup_time: e.target.value })}
                                        />
                                   </Form.Group>
                              </Col>
                         </Row>

                         <Row className="mb-3">
                              <Col md={6}>
                                   <Form.Group>
                                        <Form.Label>Backup Type *</Form.Label>
                                        <Form.Select
                                             value={scheduleForm.backup_type}
                                             onChange={(e) => updateForm({ backup_type: e.target.value as any })}
                                        >
                                             {BACKUP_TYPE_OPTIONS.map(option => (
                                                  <option key={option.value} value={option.value}>
                                                       {option.label}
                                                  </option>
                                             ))}
                                        </Form.Select>
                                   </Form.Group>
                              </Col>
                              <Col md={6}>
                                   <Form.Group>
                                        <Form.Label>Retention Days *</Form.Label>
                                        <Form.Control
                                             type="number"
                                             value={scheduleForm.retention_days}
                                             onChange={(e) => updateForm({ retention_days: Number(e.target.value) })}
                                             min="1"
                                             max="3650"
                                        />
                                   </Form.Group>
                              </Col>
                         </Row>

                         <Form.Group className="mb-3">
                              <Form.Check
                                   type="checkbox"
                                   label="Active Schedule"
                                   checked={scheduleForm.is_active}
                                   onChange={(e) => updateForm({ is_active: e.target.checked })}
                              />
                         </Form.Group>
                    </Form>
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={onHide}>
                         Cancel
                    </Button>
                    <Button
                         variant="primary"
                         size="sm"
                         onClick={onSubmit}
                         disabled={loading}
                    >
                         {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Schedule' : 'Create Schedule')}
                    </Button>
               </Modal.Footer>
          </Modal>
     );
}