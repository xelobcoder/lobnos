import { Link } from '../types';
import {  RiSyringeLine, RiCloseCircleLine, RiBarChartBoxLine, RiHome2Line } from '@remixicon/react';

export const PhlebotomyLinks: Link[] = [
    { title: 'Apps Home', link: "/", icon: <RiHome2Line /> },
    { 
        title: "Summary", 
        link: "/operations/phelobotomy",
        icon: <RiSyringeLine />
    },
    { 
        title: "Phlebotomy Pending Cases", 
        link: "/operations/phelobotomy/pending-samples-collection",
        icon: <RiSyringeLine />
    },
    { 
        title: "Rejected Samples", 
        link: "/operations/phelobotomy/rejectedsamples",
        icon: <RiCloseCircleLine />
    },
    { 
        title: "Analytics", 
        link: "/operations/phelobotomy/analytics",
        icon: <RiBarChartBoxLine />
    },
];