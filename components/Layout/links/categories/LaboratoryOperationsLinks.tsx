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
    RiHome2Line,
    RiQuestionMark,
    RiSearchLine,
    RiRegisteredFill
} from '@remixicon/react';

export const LaboratoryOperationsLinks: Link[] = [
    {
        title: "Laboratory Operations Lifecycle",
        link: "",
        icon: <RiTestTubeLine />,
        children: [
            { title: 'Customers Vital signs', link: "/operations/laboratory/vitals/record-vital-sign", icon: <RiHeartPulseLine /> },
            { title: "Sample Collection", link: "/operations/phelobotomy/pending-samples-collection", icon: <RiTestTubeLine /> },
            { title: "Sample Validation", link: `/operations/laboratory/sample/validation`, icon: <RiTestTubeLine /> },
            { title: "Processing stage", link: `/operations/laboratory/processing`, icon: <RiLoader4Line /> },
            { title: "Completed stage", link: `/operations/laboratory/completed`, icon: <RiCheckboxCircleLine /> },
            { title: "Validation stage", link: `/operations/laboratory/validation`, icon: <RiShieldCheckLine /> },
            { title: "Validated Result", link: `/operations/laboratory/validated`, icon: <RiFileListLine /> },
        ]
    },
    {
        title: "Laboratory Workspace",
        link: "/operations/laboratory",
        icon: <RiHome2Line />,
        children: [
            { title: "Laboratory Operations Home", link: "/operations/laboratory", icon: <RiHome2Line /> },
            { title: "Register New Client", link: "/crm/registration", icon: <RiRegisteredFill /> },
            { title: "Daily Laboratory Request", link: "/operations/laboratory/main/dailyRequest", icon: <RiFileListLine /> },
            { title: "Advanced Search", link: "/operations/laboratory/advanced-search", icon: <RiSearchLine /> },
        ]
    },
    {
        title: "Records & Auditing",
        link: "/operations/laboratory/patientarchives",
        icon: <RiFileListLine />,
        children: [
            { title: "Patient Archives", link: "/operations/laboratory/patientarchives", icon: <RiFileListLine /> },
            { title: "Audit Log", link: "/operations/laboratory/auditlogs", icon: <RiFileListLine /> },
            { title: "Laboratory Result Not Delivered", link: "/operations/laboratory/undelivered", icon: <RiFileListLine /> },
        ]
    },
    {
        title: "Quality & Performance",
        link: "/operations/laboratory/quality-control",
        icon: <RiShieldCheckLine />,
        children: [
            { title: "Critical Values Alert", link: "/operations/laboratory/criticalvaluesAlert", icon: <RiAlarmWarningLine /> },
            { title: "Turn around Time", link: "/operations/laboratory/turnaroundtime", icon: <RiTimeLine /> },
            { title: "Quality Control", link: "/operations/laboratory/quality-control", icon: <RiQuestionMark /> },
            { title: "Stock Management", link: "/operations/laboratory/stockmanagement", icon: <RiStore2Line /> },
            { title: "Incident Reporting", link: "/compliance/incident-reporting", icon: <RiShieldCheckLine /> },
        ]
    },
];



