import { Link } from '../types';
import { RiCalendarLine, RiDashboardLine, RiFileList3Line, RiMoneyDollarCircleLine, RiUserSettingsLine, RiLineChartLine, RiAddCircleLine, RiHomeHeartLine } from '@remixicon/react';

export const PatientPortalLinks: Link[] = [
    { title: 'Home', link: '/patientportal', icon: <RiDashboardLine /> },
    { title: 'My Results', link: '/patientportal/results', icon: <RiFileList3Line /> },
    { title: 'Test trends', link: '/patientportal/trends', icon: <RiLineChartLine /> },
    { title: 'Request tests', link: '/patientportal/requests', icon: <RiAddCircleLine /> },
    { title: 'Home collection', link: '/patientportal/home-collection', icon: <RiHomeHeartLine /> },
    { title: 'Appointments', link: '/patientportal/appointments', icon: <RiCalendarLine /> },
    { title: 'Billing', link: '/patientportal/billing', icon: <RiMoneyDollarCircleLine /> },
    { title: 'My Account', link: '/patientportal/account', icon: <RiUserSettingsLine /> },
];
