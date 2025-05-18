import { Link } from '../types';
import { RiFileListLine, RiFileTextLine, RiTimeLine } from '@remixicon/react';

export const DoashBoardMainLinks: Link[] = [
    { title: 'Clinician', link: '/dashboard/analytics/clinicians', icon: <RiFileListLine /> },
    { title: "Clients", link: '/dashboard/analytics/patients', icon: <RiFileTextLine /> },
    { title: 'Result Analysis', link: "/dashboard/resultanalysis/alltest", icon: <RiTimeLine /> }
];










export const ResultAnalysisLinks : Link[] = [
    {link: "/analytics/resultanalysis/alltest", title: "All Test", icon:<RiFileListLine />},
    {link:"/analytics/resultanalysis/monthresultsvalues", title: "Monthly Results Values", icon:<RiFileListLine />},
    {link:"/analytics/resultanalysis/yearmonthcasescount", title: "Year Month Cases Count", icon:<RiFileListLine />}
]