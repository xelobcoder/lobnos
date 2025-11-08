import { Link } from '../types';
import {
    RiUserFollowLine,
    RiListCheck2,
    RiBarChartBoxLine,
    RiFileAddLine,
    RiFileListLine,
    RiShieldCheckLine
} from '@remixicon/react';

export const ImagingLinks: Link[] = [
    { title: 'Waiting List', link: '/operations/imaging/ultrasound', icon: <RiUserFollowLine /> },
    { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist', icon: <RiListCheck2 /> },
    { title: 'Create Templates', link: '/operations/imaging/ultrasound/templates', icon: <RiFileAddLine /> },
    { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list', icon: <RiFileListLine /> },
    { title: 'Incident Reporting', link: '/compliance/incident-reporting', icon: <RiShieldCheckLine /> },
];