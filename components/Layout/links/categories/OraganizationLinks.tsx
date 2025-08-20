import { Link } from '../types';
import {
    RiUserHeartLine,
    RiUserStarLine
} from '@remixicon/react';

export const OrganizationMainLinks: Link[] = [
    { title: 'New Organization', link: '/organization/new', icon: <RiUserHeartLine /> },
    { title: 'Organizations', link: "/organization", icon: <RiUserStarLine /> },
    {
        title: 'outsourcing',
        link: '/settings/outsource',
        icon: <RiUserStarLine />
    },
    { title: 'Outsourcing Services', link: '/organization/outsource', icon: <RiUserStarLine /> },
    { title: 'Outsourced Cases Tracking', link: '/organization/outsource/outsourced-cases-tracking', icon: <RiUserStarLine /> }
];