import { Modal, Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { customPost } from "../Auth/customFetch";
import { toast } from "react-toastify";
import { useApplication } from "../Auth/useApplicationContext";

interface PhoneCallLogModalProps {
     show: boolean;
     onHide: () => void;
     onSubmit: (payload: any) => void;
     disableSubmit?: boolean;
     initialData?: Partial<{
          patientid: number;
          refid?: number;
          call_direction: 'outbound' | 'inbound';
          purpose: string;
          scheduled_at?: string;
          started_at?: string;
          ended_at?: string;
          outcome?: 'answered' | 'no_answer' | 'voicemail' | 'failed' | 'busy' | 'declined' | 'left_message';
          status?: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
          call_reference_id?: string;
          recording_url?: string;
          notes?: string;
          retry_count?: number;
          next_followup_at?: string;
          created_by?: number;
     }>;
}

const PhoneCallLogModal: React.FC<PhoneCallLogModalProps> = ({
     show,
     onHide,
     onSubmit,
     disableSubmit = false,
     initialData = {}
}) => {
     const createdby = useApplication()?.user?.employeeid;
     const [form, setForm] = useState({
          patientid: initialData.patientid || (initialData as any)?.patientid,
          appointment_refid: initialData.refid,
          call_direction: initialData.call_direction || 'outbound',
          purpose:  '',
          scheduled_at: initialData.scheduled_at || '',
          started_at: initialData.started_at || '',
          ended_at: initialData.ended_at || '',
          outcome: initialData.outcome || 'answered',
          status: initialData.status || 'scheduled',
          call_reference_id: initialData.call_reference_id || '',
          recording_url: initialData.recording_url || '',
          notes: initialData.notes || '',
          retry_count: initialData.retry_count || 0,
          next_followup_at: initialData.next_followup_at || '',
     });


     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          const { name, value } = e.target;
          setForm((prev) => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async () => {
          try {
               console.log(form)
               if (createdby && form.appointment_refid && form.patientid) {
                    const newFormdata = { ...form, created_by: createdby, retry_count: form.retry_count ? parseInt(form.retry_count.toString(), 10) : 0 };
                    const resp = await customPost('appointment/reminder/phonecall', 'POST', newFormdata);
                    if (resp && resp.success) {
                         toast.success('Phone call log saved successfully.');
                         onSubmit(form);
                         onHide();
                    } else {
                         toast.error('Failed to save phone call log.');
                    }
               }
          } catch (e) {
               toast.error('Failed to save phone call log.');
          }
     };

     return (
          <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg">
               <Modal.Header closeButton>
                    <Modal.Title>Log Phone Call</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    <Form>
                         <Form.Group className="mb-2">
                              <Form.Label>Patient ID</Form.Label>
                              <Form.Control type="number" name="patientid" value={form.patientid} disabled />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Appointment Ref ID</Form.Label>
                              <Form.Control type="number" name="appointment_refid" value={form.appointment_refid} disabled />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Call Direction</Form.Label>
                              <Form.Select name="call_direction" value={form.call_direction} onChange={handleChange} required>
                                   <option value="outbound">Outbound</option>
                                   <option value="inbound">Inbound</option>
                              </Form.Select>
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Purpose</Form.Label>
                              <Form.Control as="textarea" name="purpose" value={form.purpose} onChange={handleChange} required rows={3} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Scheduled At</Form.Label>
                              <Form.Control type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Started At</Form.Label>
                              <Form.Control type="datetime-local" name="started_at" value={form.started_at} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Ended At</Form.Label>
                              <Form.Control type="datetime-local" name="ended_at" value={form.ended_at} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Outcome</Form.Label>
                              <Form.Select name="outcome" value={form.outcome} onChange={handleChange}>
                                   <option value="answered">Answered</option>
                                   <option value="no_answer">No Answer</option>
                                   <option value="voicemail">Voicemail</option>
                                   <option value="failed">Failed</option>
                                   <option value="busy">Busy</option>
                                   <option value="declined">Declined</option>
                                   <option value="left_message">Left Message</option>
                              </Form.Select>
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Status</Form.Label>
                              <Form.Select name="status" value={form.status} onChange={handleChange}>
                                   <option value="scheduled">Scheduled</option>
                                   <option value="in_progress">In Progress</option>
                                   <option value="completed">Completed</option>
                                   <option value="missed">Missed</option>
                                   <option value="cancelled">Cancelled</option>
                              </Form.Select>
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Call Reference ID</Form.Label>
                              <Form.Control type="text" name="call_reference_id" value={form.call_reference_id} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Recording URL</Form.Label>
                              <Form.Control type="text" name="recording_url" value={form.recording_url} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Notes</Form.Label>
                              <Form.Control as="textarea" name="notes" value={form.notes} onChange={handleChange} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Retry Count</Form.Label>
                              <Form.Control type="number" name="retry_count" value={form.retry_count} onChange={handleChange} min={0} />
                         </Form.Group>
                         <Form.Group className="mb-2">
                              <Form.Label>Next Follow-up At</Form.Label>
                              <Form.Control type="datetime-local" name="next_followup_at" value={form.next_followup_at} onChange={handleChange} />
                         </Form.Group>
                    </Form>
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                         Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={disableSubmit}>
                         Submit
                    </Button>
               </Modal.Footer>
          </Modal>
     );
};

export default PhoneCallLogModal;
