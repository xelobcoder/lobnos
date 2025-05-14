import { Link } from '../types';
import {
    RiUserHeartLine,
    RiUserStarLine,
    RiTestTubeLine
} from '@remixicon/react';

export const AnalyticsLinks = function (branchid: number, employeeid: number): Link[] {
    return [
        { title: 'Patient Analytics', link: '/dashboard/analytics/patients', icon: <RiUserHeartLine /> },
        { title: 'Clinicians Analytics', link: "/dashboard/analytics/clinicians", icon: <RiUserStarLine /> },
        { title: 'Phelobotomy Analytics', link: "/operations/laboratory/phelobotomy/analytics", icon: <RiTestTubeLine /> },
        {title:"Sales Trends", link:"/analytics/sales", icon:<RiTestTubeLine/>}
    ];
};