import { Link } from '../types'
import {
    RiCalendarCheckLine,
    RiFileAddLine,
    RiHistoryLine,
    RiFileListLine,
    RiMessage2Line,
    RiErrorWarningLine,
    RiHome2Line,
    RiDashboardLine,
    RiTeamLine
} from '@remixicon/react';

export const SmsLinks: Link[] =
    [
        { title: "SMS Dashboard", link: "/communications/sms/dashboard", icon: <RiDashboardLine /> },
        { title: "SMS Jobs", link: "/communications/sms/jobs/list", icon: <RiFileListLine /> },
        { title: "Laboratory Lifecycle Events", link: "/communications/sms/laboratory-lifecycle-events", icon: <RiHistoryLine /> },
        { title: "SMS Templates", link: "/communications/sms/templates", icon: <RiFileAddLine /> },
    ];