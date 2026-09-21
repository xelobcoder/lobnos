import { Link } from '../types';
import { RiSyringeLine, RiCloseCircleLine, RiBarChartBoxLine, RiHome2Line, RiFileListLine, RiQuestionAnswerLine, RiMailLine } from '@remixicon/react';

export const PhlebotomyLinks: Link[] = [
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
        title: "All Pending Requests",
        link: "/operations/phelobotomy/all-pending-requests",
        icon: <RiHome2Line />
    },
    {
        title: "Sample Validations",
        link: "/operations/laboratory/sample/validation",
        icon: <RiSyringeLine />
    },
    {
        title: "Sample Summary",
        link: "/operations/phelobotomy/sample-summary",
        icon: <RiFileListLine />
    },
    {
        title: "Review Requests",
        link: "/operations/phelobotomy/review-requests",
        icon: <RiQuestionAnswerLine />
    },
    {
        title: "Rejection Messages",
        link: "/operations/phelobotomy/rejection-communications",
        icon: <RiMailLine />
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