import React, { useEffect, useState } from 'react';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import { EditIcon } from '../../components/Billing/BillingContextComponents/Lib/Icons';
import dayjs from 'dayjs';
import { customPost } from '../Auth/customFetch';
import { toast } from 'react-toastify';
import PreviewPatientInformation from '../petientsComponent/PreviewPatientInformation';


export default function AppointmentModal(props) {
     const {
          show,
          onHide,
          refid,
          selectedDate,
          selectedAppointments,
          editedAppointments,
          modalMode,
          setModalMode,
          handleEditChange,
          handleSaveChanges,
          handleCancelEdit,
          formatTime,
          getStatusColor
     } = props;
     const [appointmentData, setAppointmentData] = useState(null);
     const [selectedListAppointment, setSelectedListAppointment] = useState(null);
     const [editFields, setEditFields] = useState(null);



     const handleListItemClick = (appointment) => {
          setSelectedListAppointment(appointment);
          setEditFields(null);
          if (modalMode === 'edit') {
               setModalMode('view');
          }
     };

     const handleListItemEdit = (appointment) => {
          setSelectedListAppointment(appointment);
          setEditFields({ ...appointment });
          setModalMode('edit');
     };

     // Always reset edit form when modal closes
     const handleClose = () => {
          setSelectedListAppointment(null);
          setEditFields(null);
          setModalMode('view');
          if (typeof onHide === 'function') onHide();
     };

     const getStatusBackgroundClass = (status) => {
          const statusLower = status?.toLowerCase() || '';
          if (statusLower === 'confirmed') return 'bg-success-subtle';
          if (statusLower === 'pending') return 'bg-warning-subtle';
          if (statusLower === 'cancelled') return 'bg-danger-subtle';
          return 'bg-secondary-subtle';
     };

     useEffect(() => {
          if (modalMode === 'edit' && selectedListAppointment) {
               setEditFields({ ...selectedListAppointment });
          }
     }, [modalMode, selectedListAppointment]);


     const handleEditFieldChange = (field, value) => {
          setEditFields(prev => ({ ...prev, [field]: value }));
     };

     const handleSaveEdit = async () => {
          const id = editFields?.refid || (selectedListAppointment && selectedListAppointment.id);
          if (!id || !editFields) return;
          try {
               const resp = await customPost(`appointments/${id}`, 'PUT', editFields);
               if (resp && resp.success) {
                    if (selectedListAppointment) {
                         setSelectedListAppointment({ ...editFields });
                    }
                    if (Array.isArray(selectedAppointments)) {
                         const idx = selectedAppointments.findIndex(a => a.id === editFields.id);
                         if (idx !== -1) {
                              selectedAppointments[idx] = { ...editFields };
                         }
                    }
                    setModalMode('view');
                    toast.success('Appointment updated successfully.');
               } else {
                    toast.error('Failed to save changes.');
               }
          } catch (e) {
               toast.error('Failed to save changes.');
          }
     };

     const handleLocalCancelEdit = () => {
          setEditFields(selectedListAppointment ? { ...selectedListAppointment } : null);
          setModalMode('view');
     };

     return (
          <>
               <Modal show={show} onHide={handleClose} backdrop="static" size='xl'>
                    <Modal.Header className="bg-secondary-subtle fw-bold d-flex justify-content-between" closeButton>
                         <div className="d-flex justify-content-between w-100">
                              <div>
                                   <h5>{selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : 'Appointment Details'}</h5>
                              </div>
                         </div>
                    </Modal.Header>
                    <Modal.Body>
                         <div className="row">
                              <div className="col-md-5 border-end" style={{ maxHeight: 500, overflowY: 'auto' }}>
                                   {Array.isArray(selectedAppointments) && selectedAppointments.length === 0 ? (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-3" style={{ minHeight: 200 }}>
                                             <p className="text-muted">No appointments for this day.</p>
                                             <Button
                                                  variant="primary"
                                                  onClick={() => window.open('/appointments/book')}
                                                  className="d-flex align-items-center"
                                             >
                                                  <span className="me-2">+</span> Create Appointment
                                             </Button>
                                        </div>
                                   ) : (
                                        <ul className="list-unstyled">
                                             {Array.isArray(selectedAppointments) && selectedAppointments.map(appointment => (
                                                  <li key={appointment.id} className={`mb-2 p-2 rounded ${getStatusBackgroundClass(appointment.status)}`}>
                                                       <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                 <h6 className="mb-1">{appointment.title}</h6>
                                                                 <p className="text-muted small">{formatTime(appointment.appointment_time)}</p>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                 <Badge bg={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                                                 <Button variant="outline-info" size="sm" onClick={() => handleListItemClick(appointment)}>
                                                                      View
                                                                 </Button>
                                                                 <Button variant="outline-primary" size="sm" onClick={() => handleListItemEdit(appointment)}>
                                                                      <EditIcon style={{ marginRight: 2 }} /> Edit
                                                                 </Button>
                                                            </div>
                                                       </div>
                                                  </li>
                                             ))}
                                        </ul>
                                   )}
                              </div>

                              <div className="col-md-7" style={{ maxHeight: 500, overflowY: 'auto' }}>
                                   {selectedListAppointment ? (
                                        modalMode === 'edit' && editFields ? (
                                             <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', minHeight: 200 }}>
                                                  <div className="mb-3 d-flex gap-2">
                                                       <Button variant="success" size="sm" onClick={handleSaveEdit} className="me-2">
                                                            Save
                                                       </Button>
                                                       <Button variant="outline-secondary" size="sm" onClick={handleLocalCancelEdit}>
                                                            Cancel
                                                       </Button>
                                                  </div>
                                                  <Form>
                                                       <h5>Edit Appointment</h5>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Title</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.title || ''}
                                                                 onChange={e => handleEditFieldChange('title', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Time</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.appointment_time || ''}
                                                                 onChange={e => handleEditFieldChange('appointment_time', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Duration (minutes)</Form.Label>
                                                            <Form.Control
                                                                 type="number"
                                                                 value={editFields.duration || ''}
                                                                 onChange={e => handleEditFieldChange('duration', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Status</Form.Label>
                                                            <Form.Select
                                                                 value={editFields.status || ''}
                                                                 onChange={e => handleEditFieldChange('status', e.target.value)}
                                                            >
                                                                 <option value="confirmed">Confirmed</option>
                                                                 <option value="pending">Pending</option>
                                                                 <option value="cancelled">Cancelled</option>
                                                            </Form.Select>
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Purpose</Form.Label>
                                                            <Form.Control
                                                                 as="textarea"
                                                                 rows={2}
                                                                 value={editFields.purpose || ''}
                                                                 onChange={e => handleEditFieldChange('purpose', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Location</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.location || ''}
                                                                 onChange={e => handleEditFieldChange('location', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Preference</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.preference || ''}
                                                                 onChange={e => handleEditFieldChange('preference', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Practitioner</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.practioner || ''}
                                                                 onChange={e => handleEditFieldChange('practioner', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Invite Method</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.inviteMethod || ''}
                                                                 onChange={e => handleEditFieldChange('inviteMethod', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                       <Form.Group className="mb-2">
                                                            <Form.Label>Notes</Form.Label>
                                                            <Form.Control
                                                                 as="textarea"
                                                                 rows={2}
                                                                 value={editFields.notes || ''}
                                                                 onChange={e => handleEditFieldChange('notes', e.target.value)}
                                                            />
                                                       </Form.Group>
                                                  </Form>
                                             </div>
                                        ) : (
                                             <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px' }}>
                                                  <h5 className="mb-3">Patient Information</h5>
                                                  {selectedListAppointment.patientid && (
                                                       <PreviewPatientInformation patientid={selectedListAppointment.patientid} />
                                                  )}
                                                  <hr />
                                                  <h5 className="mt-3 mb-3">Appointment Details</h5>
                                                  <div className="mb-3">
                                                       <div className="mb-2"><b>Title:</b> {selectedListAppointment.title}</div>
                                                       <div className="mb-2"><b>Date:</b> {dayjs(selectedListAppointment.appointment_date).format('MMMM D, YYYY')}</div>
                                                       <div className="mb-2"><b>Time:</b> {formatTime(selectedListAppointment.appointment_time)}</div>
                                                       <div className="mb-2"><b>Duration:</b> {selectedListAppointment.duration || '-'} minutes</div>
                                                       <div className="mb-2"><b>Status:</b> <Badge bg={getStatusColor(selectedListAppointment.status)}>{selectedListAppointment.status}</Badge></div>
                                                       <div className="mb-2"><b>Purpose:</b> {selectedListAppointment.purpose || '-'}</div>
                                                       <div className="mb-2"><b>Location:</b> {selectedListAppointment.location || '-'}</div>
                                                       <div className="mb-2"><b>Preference:</b> {selectedListAppointment.preference || '-'}</div>
                                                       <div className="mb-2"><b>Practitioner:</b> {selectedListAppointment.practioner || '-'}</div>
                                                       <div className="mb-2"><b>Invite Method:</b> {selectedListAppointment.inviteMethod || '-'}</div>
                                                       <div className="mb-2"><b>Notes:</b> {selectedListAppointment.notes || '-'}</div>
                                                  </div>
                                             </div>
                                        )
                                   ) : (
                                        <div className="text-muted" style={{ padding: '16px' }}>
                                             Select an appointment to view details.
                                        </div>
                                   )}
                              </div>
                         </div>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" size="sm" onClick={handleClose}>Close</Button>
                    </Modal.Footer>
               </Modal>
          </>
     );
}
