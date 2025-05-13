import { Link } from '../types';
import { RiFileListLine, RiFileTextLine, RiTimeLine } from '@remixicon/react';

export const DoashBoardMainLinks: Link[] = [
    { title: 'Clinician', link: '/dashboard/analytics/clinicians', icon: <RiFileListLine /> },
    { title: "Clients", link: '/dashboard/analytics/patients', icon: <RiFileTextLine /> },
    { title: 'Result Analysis', link: "/dashboard/resultanalysis/alltest", icon: <RiTimeLine /> }
];










export const ResultAnalysisLinks : Link[] = [
    {link: "/dashboard/resultanalysis/alltest", title: "All Test", icon:<RiFileListLine />},
    {link:"/dashboard/resultanalysis/monthcasescount", title: "Monthly case count", icon:<RiFileListLine />},
    {link:"/dashboard/resultanalysis/monthresultsvalues", title: "Monthly Results Values", icon:<RiFileListLine />},
    {link:"/dashboard/resultanalysis/yearmonthcasescount", title: "Year Month Cases Count", icon:<RiFileListLine />}
]