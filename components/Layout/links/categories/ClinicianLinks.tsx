import { Link } from '../types';
import {
    RiTeamLine,
    RiUserSettingsLine,
    RiMoneyDollarCircleLine
} from '@remixicon/react';

export const ClinicianLinks: Link[] =
    [
        { title: 'Clinicians List', link: '/clinicians', icon: <RiTeamLine /> },
        { title: 'New Clinician ', link: '/clinicians/add-new', icon: <RiUserSettingsLine /> },
        { title: 'Commission Information', link: '/commissions/clinicians/commissions-information', icon: <RiMoneyDollarCircleLine /> },
        { title: 'Commissions Payments Made', link: '/commissions/clinicians/commissions-payments-made', icon: <RiMoneyDollarCircleLine /> }
    ];