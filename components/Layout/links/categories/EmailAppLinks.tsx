import { Link } from '../types';
import { RiCustomerService2Line, RiFileListLine, RiFileTextLine, RiMailSettingsLine, RiSettings4Line, RiTimeLine, RiUserAddLine } from '@remixicon/react';

export const EmailMainLinks: Link[] = [
    {
            title: "Email Management",
            link: "",
            icon: <RiMailSettingsLine />,
            children: [
                { title: "Overview", link: "/email-services", icon: <RiMailSettingsLine /> },
                { title: "Templates", link: "/email-services/templates", icon: <RiFileTextLine /> },
                { title: "Providers", link: "/email-services/providers", icon: <RiSettings4Line /> },
                { title: "Settings", link: "/email-services/settings", icon: <RiSettings4Line /> },
                { title: "Notifications", link: "/email-services/notifications", icon: <RiMailSettingsLine /> },
                { title: "Notification Events", link: "/email-services/notifications/events", icon: <RiSettings4Line /> },
                { title: "Notification Templates", link: "/email-services/notifications/templates", icon: <RiFileTextLine /> },
                { title: "Notification Trigger", link: "/email-services/notifications/trigger", icon: <RiMailSettingsLine /> },
                { title: "Notification Queue", link: "/email-services/notifications/queue", icon: <RiCustomerService2Line /> },
                { title: "Notification Logs", link: "/email-services/notifications/logs", icon: <RiFileListLine /> },
                { title: "Queue", link: "/email-services/queue", icon: <RiCustomerService2Line /> },
                { title: "Logs", link: "/email-services/logs", icon: <RiFileListLine /> },
            ]
        }
];


