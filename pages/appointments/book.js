import FrontDeskLayout from '../../components/Layout/FrontDeskLayout'
import NewAppointment from '../../components/appointments/newAppointmentModal'
import { Tab, Tabs } from 'react-bootstrap'
import PreviousAppointments from '../../components/appointments/previousAppointments'
export default function BookAppointment() {
  return (
    <FrontDeskLayout>
      <Tabs>
        <Tab eventKey={1} title="New Appointment">
          <NewAppointment />
        </Tab>
        <Tab eventKey={2} title="Previous Appointment">
          <PreviousAppointments />
        </Tab>
      </Tabs>
    </FrontDeskLayout>
  )
}
