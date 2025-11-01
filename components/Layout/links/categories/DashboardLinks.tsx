import { Link } from '../types';
import { RiFileListLine, RiFileTextLine, RiTimeLine, RiUserAddLine } from '@remixicon/react';

export const DoashBoardMainLinks: Link[] = [
    { title: 'Clinician', link: '/dashboard/analytics/clinicians', icon: <RiFileListLine /> },
    { title: "Clients", link: '/dashboard/analytics/patients', icon: <RiFileTextLine /> },
    { title: 'Leads', link: '/dashboard/leads', icon: <RiUserAddLine /> },
    { title: 'Result Analysis', link: "/dashboard/resultanalysis/alltest", icon: <RiTimeLine /> }
];


