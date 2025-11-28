import { Link } from '../types';
import { RiDashboardLine, RiFileListLine, RiSettingsLine, RiTimeLine } from '@remixicon/react';

export const ConsulationLinks: Link[] = [
    {
        title: "Consultation", link: "/doctor/consultation", icon: <RiDashboardLine />, children: [
            { title: 'Consultation Overview', link: '/doctor/consultation', icon: <RiDashboardLine /> },
            { title: 'All Consultations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
            { title: 'Pending Client Consultations', link: '/doctor/consultation/clients/pending', icon: <RiTimeLine /> },
        ]
    },
    {
        title: 'Ascension', link: '/doctor/ascension', icon: <RiTimeLine />, children: [
            { title: "Sample Collection", link: "/doctor/ascension/sample-collection" },
            { title: "Ascension Status", link: "/doctor/ascension/ascension-status" },
        ]
    },
    {
        title: "Result", link: "",icon:<RiTimeLine/>, children: [
            { title: 'View Result', link: '/doctor/results', icon: <RiTimeLine /> },
            { title: 'Analytics', link: '/doctor/analytics', icon: <RiTimeLine /> },
        ]
    }
];