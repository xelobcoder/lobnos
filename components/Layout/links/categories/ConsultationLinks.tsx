import { Link } from '../types';
import { RiDashboardLine, RiFileListLine, RiMoneyDollarCircleLine, RiShieldUserLine, RiStethoscopeLine, RiTimeLine } from '@remixicon/react';

export const ConsulationLinks: Link[] = [
    {
        title: "Doctor Portal", link: "/doctor", icon: <RiStethoscopeLine />, children: [
            { title: 'Overview', link: '/doctor', icon: <RiDashboardLine /> },
            { title: 'Requested Tests', link: '/doctor/requested-test', icon: <RiFileListLine /> },
            { title: 'Permissions', link: '/doctor/permissions', icon: <RiShieldUserLine /> },
            { title: 'Commission', link: '/doctor/commission', icon: <RiMoneyDollarCircleLine /> },
            { title: "Validated Results", link: "/doctor/validated-test-results", icon: <RiFileListLine /> },
        ]
    },
    {
        title: "Consultation", link: "/doctor/consultation", icon: <RiDashboardLine />, children: [
            { title: 'Consultation Overview', link: '/doctor/consultation', icon: <RiDashboardLine /> },
            { title: 'All Consultations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
            { title: 'Pending Client Consultations', link: '/doctor/consultation/clients/pending', icon: <RiTimeLine /> },
        ]
    },
    {
        title: 'Ascension', link: '/doctor/ascension', icon: <RiTimeLine />, children: [
            { title: "Ascension Status", link: "/doctor/ascension/ascension-status" },
        ]
    }
];