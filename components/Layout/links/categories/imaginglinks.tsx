import { RiBookOpenLine } from '@remixicon/react';
import { Link } from '../types';
import {
    RiUserFollowLine,
    RiListCheck2,
    RiBarChartBoxLine,
    RiFileAddLine,
    RiFileListLine,
    RiShieldCheckLine,
    RiHistoryLine
} from '@remixicon/react';

export const ImagingLinks: Link[] = [
    {title:"Learning Center",link:"/operations/guide",icon:<RiBookOpenLine/>},
    {title:'Imaging Operations',link:'/operations/imaging',icon:<RiUserFollowLine/>},
    {title:"Imaging supplies",link:"/operations/imaging/ultrasound/requisitions",icon:<RiFileListLine/>},
    { title: 'Waiting List', link: '/operations/imaging/ultrasound', icon: <RiUserFollowLine /> },
    { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist', icon: <RiListCheck2 /> },
    { title: 'Create Templates', link: '/operations/imaging/ultrasound/templates', icon: <RiFileAddLine /> },
    { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list', icon: <RiFileListLine /> },
    { title: 'Imaging Analytics', link: '/analytics/imaging', icon: <RiBarChartBoxLine /> },
    { title: 'Result Audit Trail', link: '/operations/imaging/audit', icon: <RiHistoryLine />, roles: ['admin'] },
    { title: 'Incident Reporting', link: '/compliance/incident-reporting', icon: <RiShieldCheckLine /> },
];