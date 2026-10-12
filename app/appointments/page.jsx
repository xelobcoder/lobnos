'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiCalendarCheckLine,
	RiCalendarEventLine,
	RiCloseLine,
	RiSearchLine,
	RiTimeLine,
	RiUserLine,
} from '@remixicon/react';
import { customFetch } from '../../components/Auth/customFetch';
import styles from './appointments.module.css';

const calendarLocalizer = momentLocalizer(moment);

const WORKFLOW_TYPES = [
	{ value: 'all', label: 'All appointment types' },
	{ value: 'consultation', label: 'Consultation' },
	{ value: 'laboratory', label: 'Laboratory' },
	{ value: 'ultrasound', label: 'Ultrasound' },
	{ value: 'follow_up', label: 'CRM follow-up' },
];

function getAppointmentType(appointment) {
	return String(appointment.appointment_type || appointment.type || 'consultation')
		.toLowerCase()
		.replace(/[\s-]+/g, '_');
}

function getTypeLabel(value) {
	return WORKFLOW_TYPES.find((item) => item.value === value)?.label || 'Consultation';
}

function getAppointmentDate(appointment) {
	return dayjs(String(appointment.appointment_date || '').slice(0, 10));
}

function formatTime(value) {
	if (!value) return 'Time not set';
	const parsed = dayjs(`2000-01-01T${value}`);
	return parsed.isValid() ? parsed.format('h:mm A') : value;
}

function getPatientName(appointment) {
	if (!appointment.patientid && appointment.lead_id) {
		const leadName = [appointment.lead_firstname, appointment.lead_lastname].filter(Boolean).join(' ').trim();
		return leadName || appointment.lead_name || appointment.lead_company || `Lead #${appointment.lead_id}`;
	}
	const name = [
		appointment.designation,
		appointment.firstname,
		appointment.middlename,
		appointment.lastname,
	].filter(Boolean).join(' ').trim();
	return name || (appointment.patientid ? `Patient #${appointment.patientid}` : 'Patient not assigned');
}

function getWorkflowPath(appointment) {
	const type = getAppointmentType(appointment);
	let path = '';
	if (type === 'laboratory') path = '/operations/laboratory';
	if (type === 'ultrasound') path = '/operations/imaging/ultrasound';
	if (type === 'follow_up' && appointment.lead_id) return `/crm/leads/followups/${appointment.lead_id}`;
	if (!path) return '';
	const params = new URLSearchParams();
	if (appointment.patientid) params.set('patientid', appointment.patientid);
	if (appointment.billingid) params.set('billingid', appointment.billingid);
	return params.size ? `${path}?${params.toString()}` : path;
}

function CalendarToolbar({ label, onNavigate, onView, view }) {
	return (
		<div className={styles.toolbar}>
			<div className={styles.periodControls}>
				<button type="button" className={styles.todayButton} onClick={() => onNavigate('TODAY')}>Today</button>
				<button type="button" className={styles.iconButton} onClick={() => onNavigate('PREV')} aria-label="Previous period">
					<RiArrowLeftSLine size={20} />
				</button>
				<button type="button" className={styles.iconButton} onClick={() => onNavigate('NEXT')} aria-label="Next period">
					<RiArrowRightSLine size={20} />
				</button>
				<h2>{label}</h2>
			</div>
			<div className={styles.viewSwitch} role="group" aria-label="Calendar view">
				{[['month', 'Month'], ['week', 'Week'], ['day', 'Day'], ['agenda', 'Agenda']].map(([value, text]) => (
					<button key={value} type="button" aria-pressed={view === value} className={view === value ? styles.viewActive : ''} onClick={() => onView(value)}>{text}</button>
				))}
			</div>
		</div>
	);
}

function CalendarEvent({ event }) {
	const type = getAppointmentType(event.appointment);
	return (
		<div className={`${styles.calendarEvent} ${styles[`event_${type}`] || styles.event_consultation}`}>
			<strong>{event.title}</strong>
			<span>{getPatientName(event.appointment)}</span>
		</div>
	);
}

export default function Appointment() {
	const [appointments, setAppointments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [currentDate, setCurrentDate] = useState(dayjs());
	const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
	const [viewMode, setViewMode] = useState('month');
	const [visibleRange, setVisibleRange] = useState(() => ({
		start: dayjs().startOf('month').startOf('week').format('YYYY-MM-DD'),
		end: dayjs().endOf('month').endOf('week').format('YYYY-MM-DD'),
	}));
	const [typeFilter, setTypeFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [selectedAppointment, setSelectedAppointment] = useState(null);

	const fetchAppointments = useCallback(async () => {
		setIsLoading(true);
		setLoadError('');
		try {
			const response = await customFetch(`appointments/month?startDate=${visibleRange.start}&endDate=${visibleRange.end}`);
			if (!Array.isArray(response)) {
				throw new Error('The appointments service returned an invalid response.');
			}
			setAppointments(response);
		} catch (error) {
			console.error('Unable to load appointment calendar:', error);
			setAppointments([]);
			setLoadError('Appointments could not be loaded. Check your connection and try again.');
		} finally {
			setIsLoading(false);
		}
	}, [visibleRange]);

	useEffect(() => {
		fetchAppointments();
	}, [fetchAppointments]);

	const visibleAppointments = useMemo(() => {
		const query = search.trim().toLowerCase();
		return appointments.filter((appointment) => {
			const typeMatches = typeFilter === 'all' || getAppointmentType(appointment) === typeFilter;
			const status = String(appointment.status || 'pending').toLowerCase();
			const statusMatches = statusFilter === 'all' || status === statusFilter;
			const searchMatches = !query || [
				appointment.title,
				appointment.purpose,
				appointment.firstname,
				appointment.lastname,
				appointment.practioner_name,
				appointment.lead_name,
				appointment.lead_company,
			].some((value) => String(value || '').toLowerCase().includes(query));
			return typeMatches && statusMatches && searchMatches;
		});
	}, [appointments, typeFilter, statusFilter, search]);

	const selectedDayAppointments = useMemo(() => visibleAppointments
		.filter((appointment) => getAppointmentDate(appointment).format('YYYY-MM-DD') === selectedDate)
		.sort((left, right) => String(left.appointment_time || '').localeCompare(String(right.appointment_time || ''))),
	[visibleAppointments, selectedDate]);

	const appointmentsByDay = useMemo(() => {
		const byDay = new Map();
		visibleAppointments.forEach((appointment) => {
			const date = getAppointmentDate(appointment);
			if (!date.isValid()) return;
			const key = date.format('YYYY-MM-DD');
			byDay.set(key, [...(byDay.get(key) || []), appointment]);
		});
		return byDay;
	}, [visibleAppointments]);
	const calendarEvents = useMemo(() => visibleAppointments.flatMap((appointment) => {
		const date = getAppointmentDate(appointment);
		if (!date.isValid()) return [];
		const time = String(appointment.appointment_time || '09:00').slice(0, 8);
		const parsedStart = moment(`${date.format('YYYY-MM-DD')} ${time}`, [
			'YYYY-MM-DD HH:mm:ss',
			'YYYY-MM-DD HH:mm',
			'YYYY-MM-DD H:mm',
		], true);
		if (!parsedStart.isValid()) return [];
		const start = parsedStart.toDate();
		const duration = Math.max(5, Number(appointment.duration) || 30);
		return [{
			title: appointment.title || getTypeLabel(getAppointmentType(appointment)),
			start,
			end: moment(start).add(duration, 'minutes').toDate(),
			appointment,
		}];
	}), [visibleAppointments]);

	const pendingAppointments = visibleAppointments.filter((appointment) =>
		['pending', 'scheduled'].includes(String(appointment.status || 'pending').toLowerCase()),
	);
	const nextAppointment = [...visibleAppointments]
		.filter((appointment) => getAppointmentDate(appointment).isSame(dayjs(), 'day') || getAppointmentDate(appointment).isAfter(dayjs(), 'day'))
		.sort((left, right) => {
			const leftDate = `${left.appointment_date} ${left.appointment_time || ''}`;
			const rightDate = `${right.appointment_date} ${right.appointment_time || ''}`;
			return leftDate.localeCompare(rightDate);
		})[0];

	const openAppointment = (appointment) => {
		setSelectedAppointment(appointment);
		setSelectedDate(getAppointmentDate(appointment).format('YYYY-MM-DD'));
	};

	const openBooking = () => {
		const params = new URLSearchParams({ appointment_date: selectedDate });
		if (typeFilter !== 'all') params.set('appointment_type', typeFilter);
		window.location.href = `/appointments/book?${params.toString()}`;
	};

	return (
		<div className={styles.page}>
			<div className={styles.heading}>
				<div>
					<div className={styles.eyebrow}>CARE COORDINATION</div>
					<h1>Appointments</h1>
					<p>Schedule and coordinate patient visits, diagnostics, imaging and follow-ups.</p>
				</div>
				<button type="button" className={styles.primaryAction} onClick={openBooking}>
					<RiCalendarEventLine size={18} />
					New appointment
				</button>
			</div>

			<div className={styles.summaryGrid}>
				<article className={styles.summaryCard}>
					<span className={styles.summaryIcon}><RiCalendarCheckLine size={18} /></span>
					<div><span>Selected day</span><strong>{selectedDayAppointments.length}</strong></div>
					<small>{dayjs(selectedDate).format('ddd, D MMM')}</small>
				</article>
				<article className={styles.summaryCard}>
					<span className={`${styles.summaryIcon} ${styles.summaryIconPending}`}><RiTimeLine size={18} /></span>
					<div><span>Needs confirmation</span><strong>{pendingAppointments.length}</strong></div>
					<small>pending</small>
				</article>
				<article className={`${styles.summaryCard} ${styles.nextSummaryCard}`}>
					<span className={`${styles.summaryIcon} ${styles.summaryIconNext}`}><RiUserLine size={18} /></span>
					<div>
						<span>Next appointment</span>
						<strong>{nextAppointment ? getPatientName(nextAppointment) : 'Nothing scheduled'}</strong>
					</div>
					<small>{nextAppointment ? `${getAppointmentDate(nextAppointment).format('D MMM')} · ${formatTime(nextAppointment.appointment_time)}` : 'You are all caught up'}</small>
				</article>
			</div>

			{loadError && (
				<div className={styles.errorBanner} role="alert">
					<span>{loadError}</span>
					<button type="button" onClick={fetchAppointments}>Try again</button>
				</div>
			)}

			<div className={styles.workspace}>
				<section className={styles.calendarPanel} aria-label="Appointment calendar">
					<div className={styles.filters}>
						<label className={styles.searchBox}>
							<RiSearchLine size={17} aria-hidden="true" />
							<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients, appointments…" aria-label="Search appointments" />
							{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><RiCloseLine size={16} /></button>}
						</label>
						<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by appointment type">
							{WORKFLOW_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
						</select>
						<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
							<option value="all">All statuses</option>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>

					<div className={styles.calendarCanvas}>
						<Calendar
							localizer={calendarLocalizer}
							events={calendarEvents}
							date={currentDate.toDate()}
							view={viewMode}
							views={['month', 'week', 'day', 'agenda']}
							onNavigate={(date) => {
								const nextDate = dayjs(date);
								setCurrentDate(nextDate);
								setSelectedDate(nextDate.format('YYYY-MM-DD'));
								setSelectedAppointment(null);
							}}
							onView={(nextView) => setViewMode(nextView)}
							onRangeChange={(range) => {
								const start = Array.isArray(range) ? range[0] : range.start;
								const end = Array.isArray(range) ? range[range.length - 1] : range.end;
								if (!start || !end) return;
								setVisibleRange({
									start: dayjs(start).format('YYYY-MM-DD'),
									end: dayjs(end).format('YYYY-MM-DD'),
								});
							}}
							onSelectEvent={(event) => openAppointment(event.appointment)}
							onSelectSlot={({ start }) => {
								const nextDate = dayjs(start);
								setSelectedDate(nextDate.format('YYYY-MM-DD'));
								setSelectedAppointment(null);
							}}
							onDrillDown={(date) => {
								const nextDate = dayjs(date);
								setCurrentDate(nextDate);
								setSelectedDate(nextDate.format('YYYY-MM-DD'));
								setViewMode('day');
								setSelectedAppointment(null);
							}}
							selectable
							popup
							components={{
								toolbar: CalendarToolbar,
								event: CalendarEvent,
							}}
							eventPropGetter={(event) => ({
								className: `${styles.calendarEventShell} ${styles[`eventShell_${getAppointmentType(event.appointment)}`] || styles.eventShell_consultation}`,
							})}
							dayPropGetter={(date) => ({
								className: [
									dayjs(date).isSame(dayjs(), 'day') ? styles.calendarToday : '',
									dayjs(date).format('YYYY-MM-DD') === selectedDate ? styles.calendarSelectedDay : '',
								].filter(Boolean).join(' '),
							})}
							messages={{
								noEventsInRange: 'No appointments scheduled for this period.',
								showMore: (count) => `+${count} more`,
							}}
						/>
					</div>
					{isLoading && <div className={styles.loadingOverlay} role="status">Updating appointments…</div>}
				</section>

				<aside className={styles.agenda} aria-label="Selected day agenda">
					<div className={styles.agendaHeader}>
						<div>
							<span className={styles.agendaEyebrow}>DAY AGENDA</span>
							<h2>{dayjs(selectedDate).format('dddd, MMMM D')}</h2>
						</div>
						<button type="button" className={styles.agendaAdd} onClick={openBooking} aria-label="Add appointment"><span>+</span></button>
					</div>
					<div className={styles.agendaCount}>{selectedDayAppointments.length} {selectedDayAppointments.length === 1 ? 'appointment' : 'appointments'}</div>
					<div className={styles.agendaList}>
						{selectedDayAppointments.length === 0 ? (
							<div className={styles.emptyAgenda}>
								<span className={styles.emptyIcon}><RiCalendarEventLine size={22} /></span>
								<strong>Your day is clear</strong>
								<p>No appointments for this date yet.</p>
								<button type="button" onClick={openBooking}>Schedule a visit</button>
							</div>
						) : selectedDayAppointments.map((appointment) => {
							const type = getAppointmentType(appointment);
							const status = String(appointment.status || 'pending').toLowerCase();
							const isActive = selectedAppointment?.refid === appointment.refid;
							return (
								<button type="button" key={appointment.refid} className={`${styles.agendaItem} ${isActive ? styles.agendaItemActive : ''}`} onClick={() => openAppointment(appointment)}>
									<span className={`${styles.agendaTimeline} ${styles[`eventBorder_${type}`] || styles.eventBorder_consultation}`} />
									<span className={styles.agendaItemContent}>
										<span className={styles.agendaTime}>{formatTime(appointment.appointment_time)} <span>{appointment.duration ? `${appointment.duration} min` : ''}</span></span>
										<strong>{appointment.title || getTypeLabel(type)}</strong>
										<span className={styles.agendaPatient}>{getPatientName(appointment)}</span>
										<span className={styles.agendaMeta}>
											<span className={`${styles.typeTag} ${styles[`event_${type}`] || styles.event_consultation}`}>{getTypeLabel(type)}</span>
											<span className={`${styles.statusTag} ${styles[`status_${status}`] || ''}`}>{appointment.status || 'Pending'}</span>
										</span>
										{(appointment.practioner_name || appointment.practioner) && <span className={styles.practitioner}>With {appointment.practioner_name || appointment.practioner}</span>}
									</span>
								</button>
							);
						})}
					</div>
					{selectedAppointment && (
						<div className={styles.detailCard}>
							<div className={styles.detailTopline}>
								<span>APPOINTMENT DETAILS</span>
								<button type="button" onClick={() => setSelectedAppointment(null)} aria-label="Close appointment details"><RiCloseLine size={17} /></button>
							</div>
							<strong>{selectedAppointment.title || getTypeLabel(getAppointmentType(selectedAppointment))}</strong>
							<p>{selectedAppointment.purpose || 'No additional details provided.'}</p>
							<div><RiTimeLine size={15} /> {formatTime(selectedAppointment.appointment_time)}{selectedAppointment.duration ? ` · ${selectedAppointment.duration} minutes` : ''}</div>
							<div><RiUserLine size={15} /> {getPatientName(selectedAppointment)}</div>
							{selectedAppointment.location && <small>{selectedAppointment.location}</small>}
							{getWorkflowPath(selectedAppointment) && (
								<a className={styles.workflowLink} href={getWorkflowPath(selectedAppointment)}>
									Open {getTypeLabel(getAppointmentType(selectedAppointment)).toLowerCase()} workflow
								</a>
							)}
						</div>
					)}
				</aside>
			</div>
			<div className={styles.legend} aria-label="Appointment type legend">
				{WORKFLOW_TYPES.filter((type) => type.value !== 'all').map((type) => (
					<span key={type.value}><i className={styles[`legend_${type.value}`]} />{type.label}</span>
				))}
			</div>
		</div>
	);
}
