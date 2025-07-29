import React, { useEffect, useState } from 'react';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import { EditIcon } from '../../components/Billing/BillingContextComponents/Lib/Icons';
import dayjs from 'dayjs';
import { customPost } from '../Auth/customFetch';
import { toast } from 'react-toastify';


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

     return (
          <>
               <Modal show={show} onHide={onHide} backdrop="static" size='xl'>
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
                                        <p>No appointments for this day.</p>
                                   ) : (
                                        <ul className="list-unstyled">
                                             {Array.isArray(selectedAppointments) && selectedAppointments.map(appointment => (
                                                  <li key={appointment.id} className="mb-2">
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
                                                       <hr />
                                                  </li>
                                             ))}
                                        </ul>
                                   )}
                              </div>
                              
                              <div className="col-md-7">
                                   {selectedListAppointment ? (
                                        modalMode === 'edit' && editFields ? (
                                             <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', minHeight: 200 }}>
                                                  <div className="mb-3 d-flex gap-2">
                                                       <Button variant="success" size="sm" onClick={handleSaveEdit} className="me-2">
                                                            Save
                                                       </Button>
                                                       <Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>
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
                                                            <Form.Label>Status</Form.Label>
                                                            <Form.Select
                                                                 value={editFields.status || ''}
                                                                 onChange={e => handleEditFieldChange('status', e.target.value)}
                                                            >
                                                                 <option value="Confirmed">Confirmed</option>
                                                                 <option value="Pending">Pending</option>
                                                                 <option value="Cancelled">Cancelled</option>
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
                                                            <Form.Label>Practitioner</Form.Label>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={editFields.practioner || ''}
                                                                 onChange={e => handleEditFieldChange('practioner', e.target.value)}
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
                                             <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', minHeight: 200 }}>
                                                  <h5>Appointment Details</h5>
                                                  <div><b>Title:</b> {selectedListAppointment.title}</div>
                                                  <div><b>Time:</b> {formatTime(selectedListAppointment.appointment_time)}</div>
                                                  <div><b>Status:</b> {selectedListAppointment.status}</div>
                                                  <div><b>Purpose:</b> {selectedListAppointment.purpose || '-'}</div>
                                                  <div><b>Location:</b> {selectedListAppointment.location || '-'}</div>
                                                  <div><b>Practitioner:</b> {selectedListAppointment.practioner || '-'}</div>
                                                  <div><b>Notes:</b> {selectedListAppointment.notes || '-'}</div>
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
                         <Button variant="secondary" size="sm" onClick={onHide}>Close</Button>
                    </Modal.Footer>
               </Modal>
          </>
     );
}
