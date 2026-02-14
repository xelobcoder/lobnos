
import { Modal, Form, Button } from "react-bootstrap";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { customPost } from "../Auth/customFetch";

interface SmsReminderModalProps {
	show: boolean;
	onHide: () => void;
	sendType: 'now' | 'schedule';
	setSendType: (type: 'now' | 'schedule') => void;
	scheduleDate: string;
	setScheduleDate: (date: string) => void;
	appointment?: {
		id?: string | number;
		title?: string;
		appointment_time?: string;
		appointment_date?: string;
		patient?: string;
		contact?: string;
		[key: string]: any;
	} | null;
	onSend: (payload: { type: string; scheduleDate?: string; appointment?: any }) => void;
	disableSend: boolean;
}

const SmsReminderModal: React.FC<SmsReminderModalProps> = ({
	show,
	onHide,
	sendType,
	setSendType,
	scheduleDate,
	setScheduleDate,
	onSend,
	disableSend,
	appointment
}) => {
	const handleSend = async () => {
		const payload = {
			type: sendType,
			scheduleDate: sendType === 'schedule' ? scheduleDate : undefined,
			appointmentId: appointment?.id,
			appointmentDetails: appointment,
		};
		try {
			const resp = await customPost('appointment/reminder', 'POST', payload);
			const { status, message } = resp;
			if (status === 'success') {
				toast.success(message || 'SMS reminder sent successfully.');
				onSend(payload);
			} else {
				toast.error(message || 'Failed to send SMS reminder.');
			}
		} catch (e) {
			toast.error('Failed to send SMS reminder.');
		}
	};

	return (
		<Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Send SMS Reminder</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{appointment && (
					<div className="mb-3 p-2 border rounded br-5">
						<div><b>Patient ID:</b> {appointment.patientid}</div>
						<div><b>Patient Name:</b> {appointment.firstname} {appointment.lastname}</div>
						<div><b>Purpose:</b> {appointment.purpose}</div>
						<div><b>Date:</b> {appointment.appointment_date ? dayjs(appointment.appointment_date).format('DD MMM YYYY') : ''}</div>
						<div><b>Time:</b> {appointment.appointment_time}</div>
					</div>
				)}
				<Form>
					<Form.Label className="mt-3">Send Type:</Form.Label>
					<div className="mb-2">
						<Form.Check
							type="radio"
							label="Send Now"
							name="sendType"
							id="sendTypeNow"
							value="now"
							checked={sendType === 'now'}
							onChange={() => setSendType('now')}
						/>
						<Form.Check
							type="radio"
							label="Schedule"
							name="sendType"
							id="sendTypeSchedule"
							value="schedule"
							checked={sendType === 'schedule'}
							onChange={() => setSendType('schedule')}
						/>
					</div>
					{sendType === 'schedule' && (
						<Form.Group className="mb-2">
							<Form.Label>Schedule Date & Time</Form.Label>
							<Form.Control
								type="datetime-local"
								value={scheduleDate}
								onChange={(e) => setScheduleDate(e.target.value)}
							/>
						</Form.Group>
					)}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSend} disabled={disableSend}>
					{sendType === 'now' ? 'Send Now' : 'Schedule'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SmsReminderModal;
