import { Link } from '../types';
import { RiCalendarLine, RiDashboardLine, RiFileList3Line, RiMoneyDollarCircleLine, RiUserSettingsLine } from '@remixicon/react';

export const PatientPortalLinks: Link[] = [
    { title: 'Home', link: '/patientportal', icon: <RiDashboardLine /> },
    { title: 'My Results', link: '/patientportal/results', icon: <RiFileList3Line /> },
    { title: 'Appointments', link: '/patientportal/appointments', icon: <RiCalendarLine /> },
    { title: 'Billing', link: '/patientportal/billing', icon: <RiMoneyDollarCircleLine /> },
    { title: 'My Account', link: '/patientportal/account', icon: <RiUserSettingsLine /> },
];
