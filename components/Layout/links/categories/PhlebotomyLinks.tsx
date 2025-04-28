import { Link } from '../types';
import {  RiSyringeLine, RiCloseCircleLine, RiBarChartBoxLine } from '@remixicon/react';

export const PhlebotomyLinks: Link[] = [
    { 
        title: "Phlebotomy", 
        link: "/operations/laboratory/phelobotomy",
        icon: <RiSyringeLine />
    },
    { 
        title: "Rejected Samples", 
        link: "/operations/laboratory/phelobotomy/rejectedsamples",
        icon: <RiCloseCircleLine />
    },
    { 
        title: "Analytics", 
        link: "/operations/laboratory/phelobotomy/analytics",
        icon: <RiBarChartBoxLine />
    },
];