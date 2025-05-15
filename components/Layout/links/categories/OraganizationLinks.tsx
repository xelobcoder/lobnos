import { Link } from '../types';
import {
    RiUserHeartLine,
    RiUserStarLine
} from '@remixicon/react';

export const OrganizationMainLinks: Link[] =  [
        { title: 'New Organization', link: '/organization/new', icon: <RiUserHeartLine /> },
        { title: 'Organizations', link: "/organization", icon: <RiUserStarLine /> },
    ];