import { Link } from '../types';
import {
    RiCalendarCheckLine,
    RiCalendarEventLine,
    RiTaskLine,
    RiUserFollowLine,
    RiTimeLine,
    RiCheckLine,
    RiFileAddLine,
    RiSearchLine
} from '@remixicon/react';

export const AppointmentsLinks: Link[] = [
    { title: 'Appointments Calender', link: '/appointments', icon: <RiCalendarCheckLine /> },
    { title: 'Appointments List', link: '/appointments/appointment-list', icon: <RiTaskLine /> },
    { title: 'Book Appointment', link: '/appointments/book', icon: <RiCalendarEventLine /> },
    {title:'Phone Call Log', link:'/appointments/phone-call-log/all-calls', icon:<RiSearchLine />},
    { title: 'Create Attendance', link: '/appointments/attendance/create-attendance', icon: <RiUserFollowLine /> },
    { title: "Create Shifts", link: "/appointments/attendance/create-shifts", icon: <RiTimeLine /> },
    { title: "Tasks", link: '/appointments/taskmanagement/task-list', icon: <RiCheckLine /> },
    { title: "Create New Tasks", link: "/appointments/taskmanagement/create-new-tasks", icon: <RiFileAddLine /> }
];