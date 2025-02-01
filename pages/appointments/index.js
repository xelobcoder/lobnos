import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import Loader from '../../components/accessories/Loader';
import { customFetch } from '../../components/Auth/customFetch';
import PrimeLayout from '../../components/Layout/PrimeLayout';


// Function to convert appointment data to FullCalendar event format
const convertAppointmentsToEvents = (appointments) => {
	return appointments.map(appointment => {
		const startDateTime = new Date(appointment.appointment_date);
		const [hours, minutes] = appointment.appointment_time.split(':');
		const period = appointment.appointment_time.split(' ')[1];
		const hours24 = period === 'PM' ? parseInt(hours) + 12 : parseInt(hours);
		startDateTime.setHours(hours24, parseInt(minutes));

		const endDateTime = new Date(startDateTime);
		endDateTime.setMinutes(startDateTime.getMinutes() + appointment.duration);

		return {
			title: appointment.title,
			start: startDateTime,
			end: endDateTime,
			extendedProps: {
				preference: appointment.preference,
				inviteMethod: appointment.inviteMethod,
				purpose: appointment.purpose,
				location: appointment.location,
				status: appointment.status,
				practioner: appointment.practioner
			}
		};
	});
};

export default function Appointment() {
	const [events, setEvents] = useState([]);
	const [isdataLoading, setDataLoading] = useState(true);

	useEffect(() => {
		import('../../node_modules/react-datepicker/dist/react-datepicker.min.css')
		customFetch(`appointments/month?month=${new Date().getUTCMonth() + 1}`)
			.then((appointments) => {
				if (Array.isArray(appointments) && appointments.length > 0) {
					setEvents(convertAppointmentsToEvents(appointments));
				} else {
					setEvents([])
				}
			}).catch((err) => {
				setEvents([]);
			}).finally(() => { setDataLoading(false) })

	}, []);


	if (isdataLoading) return <Loader />

	const handleDateClick = (info) => {
		alert(`Date clicked: ${info.dateStr}`);
		console.log('Date clicked:', info.dateStr);
	};

	const handleEventClick = (info) => {
		alert(`Event clicked: ${info.event.title}`);
		console.log('Event clicked:', info.event);
	};

	const handleSelect = (info) => {
		const title = prompt('Enter event title:');
		if (title) {
			setEvents([...events, { id: Date.now().toString(), title, start: info.startStr, end: info.endStr }]);
		}
	};


	return (
		<PrimeLayout>
			<section className='d-flex justify-content-between my-1 ui'>
				<h4>Appointments</h4>
				<div>
					<button onClick={(ev) => { window.open('/appointments/book') }} className='btn btn-primary btn-sm'>New Appointment</button>
				</div>
			</section>

			<FullCalendar
				themeSystem='ui'
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				initialView="dayGridMonth"
				height={"1500px"}
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
				}}
				events={events}
				// dateClick={handleDateClick}
				// eventClick={handleEventClick}
				selectable={true}
				select={handleSelect}
				// editable={true}
				// eventDrop={(info) => {
				//   console.log('Event dropped:', info.event);
				// }}
				// eventResize={(info) => {
				//   console.log('Event resized:', info.event);
				// }}
				locale="en"
			/>
		</PrimeLayout>
	);
}
