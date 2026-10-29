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
        { title: "Arkesel connection", link: "/communications/sms/provider", icon: <RiMessage2Line /> },
        { title: "SMS Dashboard", link: "/communications/sms/dashboard", icon: <RiDashboardLine /> },
        { title: "SMS Jobs", link: "/communications/sms/jobs/list", icon: <RiFileListLine /> },
        { title: 'Create SMS Job', link: '/communications/sms/jobs', icon: <RiFileAddLine /> },
        { title: "Laboratory Lifecycle Events", link: "/communications/sms/laboratory-lifecycle-events", icon: <RiHistoryLine /> },
        { title: "Contact groups", link: "/communications/sms/contact-groups", icon: <RiTeamLine /> },
        { title: "SMS Templates", link: "/communications/sms/templates", icon: <RiFileAddLine /> },
    ];