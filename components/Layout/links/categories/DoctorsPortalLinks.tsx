import { Link } from '../types';
import { RiStethoscopeLine, RiFileListLine, RiFileTextLine, RiTimeLine } from '@remixicon/react';

export const DoctorsPortalLinks: Link[] = [
    { title: 'Consulations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
    { title: "Consult", link: '/doctor/consultation', icon: <RiFileTextLine /> },
    { title: 'Pending Consultations', link: "/doctor/consultation/clients/pending", icon: <RiTimeLine /> }
];