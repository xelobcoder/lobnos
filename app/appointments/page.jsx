'use client';
import React, { useState, useEffect } from 'react';
import { customFetch } from '../../components/Auth/customFetch';
import Loader from '../../components/accessories/Loader';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiCloseLine,
	RiEditLine,
	RiAddLine,
	RiSaveLine,
	RiArrowGoForwardLine
} from '@remixicon/react';
import { EditIcon } from '../../components/Billing/BillingContextComponents/Lib/Icons';
import { motion } from 'motion/react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

import AppointmentModal from '../../components/appointments/AppointmentModal';


export default function Appointment() {
	const [appointments, setAppointments] = useState([]);
	const [isDataLoading, setDataLoading] = useState(true);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [selectedAppointments, setSelectedAppointments] = useState([]);
	const [editedAppointments, setEditedAppointments] = useState([]);
	const [viewMode, setViewMode] = useState('Month');
	const [modalMode, setModalMode] = useState('view');

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const currentMonth = currentDate.getMonth() + 1;
				const response = await customFetch(`appointments/month?month=${currentMonth}`);
				if (Array.isArray(response) && response.length > 0) {
					setAppointments(response);
				} else {
					setAppointments([]);
				}
			} catch (error) {
				console.error('Error fetching appointments:', error);
				setAppointments([]);
			} finally {
				setDataLoading(false);
			}
		};
		fetchAppointments();
	}, [currentDate]);

	// Adjust view mode based on screen width for responsiveness
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				// For small screens, switch to a simpler view
				setViewMode('Day');
			} else {
				setViewMode('Month');
			}
		};
		window.addEventListener('resize', handleResize);
		handleResize(); // Set initial view mode
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const navigateToPreviousMonth = () => {
		const newDate = new Date(currentDate);
		newDate.setMonth(currentDate.getMonth() - 1);
		setCurrentDate(newDate);
		setDataLoading(true);
	};

	const navigateToNextMonth = () => {
		const newDate = new Date(currentDate);
		newDate.setMonth(currentDate.getMonth() + 1);
		setCurrentDate(newDate);
		setDataLoading(true);
	};

	const navigateToToday = () => {
		setCurrentDate(new Date());
		setDataLoading(true);
	};

	const generateCalendarDays = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const dayOfWeek = firstDayOfMonth.getDay();
		const lastDayOfMonth = new Date(year, month + 1, 0);
		const daysInMonth = lastDayOfMonth.getDate();
		const prevMonthDays = [];
		if (dayOfWeek > 0) {
			const prevMonth = new Date(year, month, 0);
			const prevMonthDaysCount = prevMonth.getDate();
			for (let i = dayOfWeek - 1; i >= 0; i--) {
				prevMonthDays.push({ date: new Date(year, month - 1, prevMonthDaysCount - i), isCurrentMonth: false });
			}
		}
		const currentMonthDays = [];
		for (let i = 1; i <= daysInMonth; i++) {
			currentMonthDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
		}
		const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
		const remainingCells = Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed;
		const nextMonthDays = [];
		for (let i = 1; i <= remainingCells; i++) {
			nextMonthDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
		}
		return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
	};

	const getWeekViewDays = () => {
		const current = new Date(currentDate);
		const dayIndex = current.getDay();
		const sunday = new Date(current);
		sunday.setDate(current.getDate() - dayIndex);
		const days = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(sunday);
			d.setDate(sunday.getDate() + i);
			days.push({ date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() });
		}
		return days;
	};

	const getFiveDaysView = () => {
		const days = [];
		const start = new Date(currentDate);
		for (let i = 0; i < 5; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			days.push({ date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() });
		}
		return days;
	};

	const getDayView = () => {
		return [{ date: new Date(currentDate), isCurrentMonth: true }];
	};

	const getViewDays = () => {
		if (viewMode === 'Month') {
			return { days: generateCalendarDays(), columns: 7, isGrid: true };
		} else if (viewMode === 'Week') {
			return { days: getWeekViewDays(), columns: 7, isGrid: false };
		} else if (viewMode === '5 Days') {
			return { days: getFiveDaysView(), columns: 5, isGrid: false };
		} else if (viewMode === 'Day') {
			return { days: getDayView(), columns: 1, isGrid: false };
		}
		return { days: [], columns: 0, isGrid: false };
	};

	const getAppointmentsForDay = (day) => {
		if (!appointments || appointments.length === 0) return [];
		return appointments.filter(appointment => {
			const appointmentDate = new Date(appointment.appointment_date);
			return (
				appointmentDate.getDate() === day.date.getDate() &&
				appointmentDate.getMonth() === day.date.getMonth() &&
				appointmentDate.getFullYear() === day.date.getFullYear()
			);
		});
	};

	const formatTime = (timeString) => {
		if (!timeString) return '';
		if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
		const [hours, minutes] = timeString.split(':');
		const hourNum = parseInt(hours, 10);
		if (hourNum === 0) return `12:${minutes} AM`;
		else if (hourNum < 12) return `${hourNum}:${minutes} AM`;
		else if (hourNum === 12) return `12:${minutes} PM`;
		else return `${hourNum - 12}:${minutes} PM`;
	};

	const handleDayClick = (day) => {
		const dayAppointments = getAppointmentsForDay(day);
		setSelectedDate(day.date);
		setSelectedAppointments(dayAppointments);
		setEditedAppointments(dayAppointments.map(appt => ({ ...appt })));
		setShowModal(true);
		setModalMode('view');
	};

	const getMonthName = (date) => {
		return date.toLocaleString('default', { month: 'long' });
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'Confirmed': return 'success';
			case 'Pending': return 'warning';
			case 'Cancelled': return 'danger';
			default: return 'secondary';
		}
	};

	// Wrap each day cell with Framer Motion for animation
	const renderDayCell = (day, index) => {
		const dayAppointments = getAppointmentsForDay(day);
		const today = new Date();
		const isToday =
			day.date.getDate() === today.getDate() &&
			day.date.getMonth() === today.getMonth() &&
			day.date.getFullYear() === today.getFullYear();
		const isSelected =
			selectedDate &&
			day.date.getDate() === selectedDate.getDate() &&
			day.date.getMonth() === selectedDate.getMonth() &&
			day.date.getFullYear() === selectedDate.getFullYear();
		let cellClasses = "position-relative p-2 day-cell";
		if (!day.isCurrentMonth) cellClasses += " text-muted bg-light";
		if (isToday) cellClasses += " bg-primary bg-opacity-10";
		if (isSelected) cellClasses += " border-primary border-2";
		return (
			<motion.div
				key={day.date.toString()}
				className={cellClasses}
				onClick={() => handleDayClick(day)}
				style={{
					height: "120px",
					cursor: "pointer",
					overflow: "hidden",
					border: "1px solid #eee"
				}}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: index * 0.05 }}
			>
				<div className="d-flex justify-content-between align-items-center mb-1">
					<span
						className={isToday ? 'badge bg-primary rounded-circle' : ''}
						style={{
							width: isToday ? '24px' : 'auto',
							height: isToday ? '24px' : 'auto',
							display: isToday ? 'flex' : 'inline',
							alignItems: isToday ? 'center' : 'initial',
							justifyContent: isToday ? 'center' : 'initial'
						}}
					>
						{day.date.getDate()}
					</span>
				</div>
				<div className="mt-1 d-flex flex-column gap-1">
					{dayAppointments.slice(0, 3).map((appointment, idx) => {
						const statusColor = getStatusColor(appointment.status);
						return (
							<div
								key={idx}
								className="d-flex align-items-center small py-0 px-1 text-truncate"
								title={appointment.title}
								style={{
									borderLeft: `3px solid var(--bs-${statusColor})`,
									backgroundColor: `var(--bs-${statusColor}-bg-subtle)`
								}}
							>
								<div className="ms-1">
									{formatTime(appointment.appointment_time).split(' ')[0]} · {appointment.title}
								</div>
							</div>
						);
					})}
					{dayAppointments.length > 3 && (
						<div className="small text-muted ps-1">
							+ {dayAppointments.length - 3} more
						</div>
					)}
				</div>
			</motion.div>
		);
	};

	const handleCloseModal = () => setShowModal(false);

	const handleEditChange = (index, field, value) => {
		const updated = [...editedAppointments];
		updated[index] = { ...updated[index], [field]: value };
		setEditedAppointments(updated);
	};

	const handleSaveChanges = () => {
		console.log('Saving changes', editedAppointments);
		setSelectedAppointments(editedAppointments);
		setModalMode('view');
	};

	const handleCancelEdit = () => {
		setEditedAppointments(selectedAppointments.map(appt => ({ ...appt })));
		setModalMode('view');
	};

	if (isDataLoading) return <Loader />;
	const { days } = getViewDays();
	const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	return (
		<div className="p-3 container-fluid">
			<section className="d-flex justify-content-between align-items-center mb-3">
				<h4>Appointments</h4>
				<Button onClick={() => window.open('/appointments/book')} variant="primary" size="sm" className="d-flex align-items-center">
					<i className="bi bi-plus-circle me-1"></i>New Appointment
				</Button>
			</section>
			<div className="border p-2">
				<div className="card-header d-flex justify-content-between align-items-center br-5 bg-secondary-subtle p-3">
					<h5 className="mb-0">{getMonthName(currentDate)} {currentDate.getFullYear()}</h5>
					<div className="d-flex gap-2">
						<div className="btn-group">
							<Button onClick={navigateToPreviousMonth} variant="danger" size="sm" aria-label="Previous month">
								<RiArrowLeftSLine />
							</Button>
							<Button onClick={navigateToToday} variant="danger" size="sm">Today</Button>
							<Button onClick={navigateToNextMonth} variant="danger" size="sm" aria-label="Next month">
								<RiArrowRightSLine />
							</Button>
							<Button onClick={navigateToNextMonth} variant="danger" size="sm" aria-label="Next month">
								<RiArrowGoForwardLine />
							</Button>
						</div>
						<div className="btn-group">
							<Button variant={viewMode === 'Day' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('Day')}>Day</Button>
							<Button variant={viewMode === '5 Days' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('5 Days')}>5 Days</Button>
							<Button variant={viewMode === 'Week' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('Week')}>Week</Button>
							<Button variant={viewMode === 'Month' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('Month')}>Month</Button>
						</div>
					</div>
				</div>
				<div className="card-body p-0">
					{viewMode === 'Month' ? (
						<>
							<div className="row g-0 text-center bg-light border-bottom">
								{weekdays.map(day => (
									<div key={day} className="col p-2 fw-bold small">{day}</div>
								))}
							</div>
							<div className="row g-0">
								{days.reduce((rows, day, index) => {
									if (index % 7 === 0) rows.push([]);
									rows[rows.length - 1].push(day);
									return rows;
								}, []).map((week, weekIndex) => (
									<div key={weekIndex} className="row g-0">
										{week.map((day, dayIndex) => (
											<div key={dayIndex} className="col" style={{ minWidth: "14.28%" }}>
												{renderDayCell(day, dayIndex)}
											</div>
										))}
									</div>
								))}
							</div>
						</>
					) : (
						<div className="row g-0">
							{days.map((day, index) => (
								<div key={index} className="col p-2" style={{ minWidth: `${100 / weekdays.length}%` }}>
									<div className="text-center fw-bold mb-2">{day.date.getDate()}</div>
									{renderDayCell(day, index)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<AppointmentModal
				show={showModal}
				onHide={handleCloseModal}
				selectedDate={selectedDate}
				selectedAppointments={selectedAppointments}
				editedAppointments={editedAppointments}
				modalMode={modalMode}
				setModalMode={setModalMode}
				handleEditChange={handleEditChange}
				handleSaveChanges={handleSaveChanges}
				handleCancelEdit={handleCancelEdit}
				formatTime={formatTime}
				getStatusColor={getStatusColor}
			/>
		</div>
	);
}
