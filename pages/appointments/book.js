import NewAppointment from '../../components/appointments/newAppointmentModal'
import { Tab, Tabs, Breadcrumb } from 'react-bootstrap'
import PreviousAppointments from '../../components/appointments/previousAppointments'
import { useSearchParams } from 'next/navigation'
import PrimeLayout from '../../components/Layout/PrimeLayout'
export default function BookAppointment() {
	// const [disabled, setDisabled] = useState(true);
	const patientid = useSearchParams().get('patientid');

	return (
		<PrimeLayout>
			<section className='container-fluid'>
				<Breadcrumb className='ui fw-bold'>
					<Breadcrumb.Item href='/appointments' className="text-sm">Calendar</Breadcrumb.Item>
					<Breadcrumb.Item href='/appointments/tt' className="text-sm">Appointment List</Breadcrumb.Item>
					<Breadcrumb.Item href='/appointments/book' className="text-sm">New Appointment</Breadcrumb.Item>
				</Breadcrumb>
				<Tabs>
					<Tab eventKey={1} title="New Appointment">
						<NewAppointment />
					</Tab>
					<Tab disabled={!patientid} eventKey={2} title="Previous Appointment">
						<PreviousAppointments />
					</Tab>
				</Tabs>
			</section>
		</PrimeLayout>
	)
}
