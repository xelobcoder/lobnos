import { Link } from '../types';
import { RiFileListLine, RiFileTextLine, RiTimeLine, RiUserAddLine } from '@remixicon/react';

export const DoashBoardMainLinks: Link[] = [
    { title: 'Clinician', link: '/analytics/clinicians', icon: <RiFileListLine /> },
    { title: "Clients", link: '/analytics/patients', icon: <RiFileTextLine /> },
    { title: 'Leads', link: '/dashboard/leads', icon: <RiUserAddLine /> },
    { title: 'Result Analysis', link: "/analytics/resultanalysis/alltest", icon: <RiTimeLine /> }
];

