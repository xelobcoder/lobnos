"use client"
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import NewAppointment from '../../../components/Appointments/newAppointmentModal'
import PreviousAppointments from '../../../components/appointments/previousAppointments'


export default function BookAppointment() {
	const patientid = useSearchParams().get('patientid');

	return (
		<section className='container mx-auto px-4'>
			<Breadcrumb className='mb-6'>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href='/appointments' className="text-sm font-medium">Calendar</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href='/appointments/tt' className="text-sm font-medium">Appointment List</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-sm font-medium">New Appointment</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			
			<Tabs defaultValue="new-appointment" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="new-appointment">New Appointment</TabsTrigger>
					<TabsTrigger value="previous-appointment" disabled={!patientid}>Previous Appointment</TabsTrigger>
				</TabsList>
				<TabsContent value="new-appointment">
					<NewAppointment />
				</TabsContent>
				<TabsContent value="previous-appointment">
					<PreviousAppointments />
				</TabsContent>
			</Tabs>
		</section>
	)
}
