import { Link } from '../types';
import { RiStethoscopeLine, RiFileListLine, RiFileTextLine, RiTimeLine, RiFlaskLine, RiMedicineBottleLine } from '@remixicon/react';

export const DoctorsPortalLinks: Link[] = [
    { title: 'Consulations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
    { title: "Consult", link: '/doctor/consultation', icon: <RiFileTextLine /> },
    { title: 'Pending Consultations', link: "/doctor/consultation/clients/pending", icon: <RiTimeLine /> },
    { title: 'Order Lab Test', link: '/doctor/order-lab', icon: <RiFlaskLine /> },
    { title: 'Order Drugs', link: '/doctor/order-drugs', icon: <RiMedicineBottleLine /> }
];