import { Link } from '../types';
import {
    RiHeartPulseLine,
    RiTestTubeLine,
    RiLoader4Line,
    RiCheckboxCircleLine,
    RiShieldCheckLine,
    RiFileListLine,
    RiAlarmWarningLine,
    RiTimeLine,
    RiStore2Line,
    RiUserFollowLine,
    RiListCheck2,
    RiBarChartBoxLine,
    RiFileAddLine,
    RiSyringeLine,
    RiCloseCircleLine,
    RiHome2Line
} from '@remixicon/react';

export const LaboratoryOperationsLinks: Link[] = [
    { title: 'Apps Home', link: "/", icon: <RiHome2Line /> },
    { title: 'Customers Vital signs', link: "/customers/recordVitalSigns", icon: <RiHeartPulseLine /> },
    { title: "Sample Validation", link: `/operations/laboratory/sample/validation`, icon: <RiTestTubeLine /> },
    { title: "Processing stage", link: `/operations/laboratory/processing`, icon: <RiLoader4Line /> },
    { title: "Completed stage", link: `/operations/laboratory/completed`, icon: <RiCheckboxCircleLine /> },
    { title: "Validation stage", link: `/operations/laboratory/validation`, icon: <RiShieldCheckLine /> },
    { title: "Validated Result", link: `/operations/laboratory/validated`, icon: <RiFileListLine /> },
    { title: "Critical Values Alert", link: `/operations/laboratory/criticalvaluesAlert`, icon: <RiAlarmWarningLine /> },
    { title: "Turn around Time", link: `/operations/laboratory/turnaroundtime`, icon: <RiTimeLine /> },
    { title: "Stock Management", link: `/operations/laboratory/stockmanagement`, icon: <RiStore2Line /> },
    { title: 'Waiting List', link: '/operations/imaging/ultrasound', icon: <RiUserFollowLine /> },
    { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist', icon: <RiListCheck2 /> },
    { title: 'Analytics', link: '/operations/imaging/ultrasound/analytics', icon: <RiBarChartBoxLine /> },
    { title: 'Create Templates', link: '/operations/imaging/ultrasound/templates', icon: <RiFileAddLine /> },
    { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list', icon: <RiFileListLine /> },
    { title: "Phlebotomy", link: "/operations/laboratory/phelobotomy", icon: <RiSyringeLine /> },
    { title: "Rejected Samples", link: "/operations/laboratory/phelobotomy/rejectedsamples", icon: <RiCloseCircleLine /> },
    { title: "Analytics", link: "/operations/laboratory/phelobotomy/analytics", icon: <RiBarChartBoxLine /> }
];
