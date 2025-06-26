"use client"
import NewAppointment from '../../../components/appointments/newAppointmentModal'
import { Tab, Tabs } from 'react-bootstrap'
import PreviousAppointments from '../../../components/appointments/previousAppointments'
import { useSearchParams } from 'next/navigation'
import PrimeBreadcrumb from '../../../components/accessories/PrimeBreadCrumb'

export default function BookAppointment() {
    const patientid = useSearchParams().get('patientid');

    const breadcrumbLinks = [
        { href: '/appointments', label: 'Calendar' },
        { href: '/appointments/tt', label: 'Appointment List' },
        { href: '/appointments/book', label: 'New Appointment' }
    ];

    return (
        <section className='container-fluid'>
            <PrimeBreadcrumb links={breadcrumbLinks} />
            <Tabs>
                <Tab eventKey={1} title="New Appointment">
                    <NewAppointment />
                </Tab>
                <Tab disabled={!patientid} eventKey={2} title="Previous Appointment">
                    <PreviousAppointments />
                </Tab>
            </Tabs>
        </section>
    )
}
