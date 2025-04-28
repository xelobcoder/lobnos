import { Link } from '../types';
import {
    RiTeamLine,
    RiUserSettingsLine,
    RiMoneyDollarCircleLine
} from '@remixicon/react';

export const ClinicianLinks : Link[] = 
     [
        { title: 'Clinicians List', link: '/clinicians', icon: <RiTeamLine /> },
        { title: 'Clinician Management', link: '/clinicians/add-new', icon: <RiUserSettingsLine /> },
    ];