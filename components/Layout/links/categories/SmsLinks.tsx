import { Link } from '../types'
import {
    RiCalendarCheckLine,
    RiFileAddLine,
    RiHistoryLine,
    RiFileListLine,
    RiMessage2Line,
    RiErrorWarningLine,
    RiHome2Line
} from '@remixicon/react';

export const SmsLinks :Link[]=
     [
        { title: 'Apps Home', link: "/", icon: <RiHome2Line /> },
        { title: "Schedule SMS Campaign", link: "/communications/sms/schedule-sms-campaign", icon: <RiCalendarCheckLine /> },
        { title: "Create SMS Template", link: "/communications/sms/create-sms-templates", icon: <RiFileAddLine /> },
        { title: "SMS logs", link: "/communications/sms/smslogs", icon: <RiHistoryLine /> },
        { title: "SMS Templates", link: "/communications/sms/sms-templates", icon: <RiFileListLine /> },
        { title: "SMS Messages", link: "/communications/sms/smsmessages", icon: <RiMessage2Line /> },
        { title: "UnResolved Messages", link: "/communications/sms/smsmessages/unresolved", icon: <RiErrorWarningLine /> },
        {title:'Laboratory Lifecycle Events', link:"/communications/sms/laboratory-lifecycle-events", icon:<RiHistoryLine/>},
    ];