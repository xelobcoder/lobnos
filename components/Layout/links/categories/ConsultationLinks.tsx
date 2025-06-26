import { Link } from '../types';
import { RiDashboardLine, RiFileListLine, RiSettingsLine, RiTimeLine } from '@remixicon/react';

export const ConsulationLinks: Link[] = [
    { title: 'Consultation Overview', link: '/doctor/consultation', icon: <RiDashboardLine /> },
    { title: 'All Consultations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
    { title: 'Pending Client Consultations', link: '/doctor/consultation/clients/pending', icon: <RiTimeLine /> },
    { title: 'Consultation Settings', link: '/doctor/consultation/fieldsettings', icon: <RiSettingsLine /> }
];