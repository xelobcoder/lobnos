import { Link } from '../types'
import {
    RiCalendarCheckLine,
    RiFileAddLine,
    RiHistoryLine,
    RiFileListLine,
    RiMessage2Line,
    RiErrorWarningLine
} from '@remixicon/react';

export const SmsLinks :Link[]=
     [
        { title: "Schedule SMS Campaign", link: "/sms/schedule-sms-campaign", icon: <RiCalendarCheckLine /> },
        { title: "Create SMS Template", link: "/sms/create-sms-templates", icon: <RiFileAddLine /> },
        { title: "SMS logs", link: "/sms/smslogs", icon: <RiHistoryLine /> },
        { title: "SMS Templates", link: "/sms/sms-templates", icon: <RiFileListLine /> },
        { title: "SMS Messages", link: "/sms/smsmessages", icon: <RiMessage2Line /> },
        { title: "UnResolved Messages", link: "/sms/smsmessages/unresolved", icon: <RiErrorWarningLine /> }
    ];