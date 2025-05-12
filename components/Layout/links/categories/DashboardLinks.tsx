import { Link } from '../types';
import { RiFileListLine, RiFileTextLine, RiTimeLine } from '@remixicon/react';

export const DoashBoardMainLinks: Link[] = [
    { title: 'Clinician', link: '/analytics/clinicians', icon: <RiFileListLine /> },
    { title: "Clients", link: '/analytics/patients', icon: <RiFileTextLine /> },
    { title: 'Result Analysis', link: "/analytics/resultanalysis/alltest", icon: <RiTimeLine /> }
];










export const ResultAnalysisLinks : Link[] = [
    {link: "/analytics/resultanalysis/alltest", title: "All Test", icon:<RiFileListLine />},
    {link:"/analytics/resultanalysis/monthcasescount", title: "Monthly case count", icon:<RiFileListLine />},
    {link:"/analytics/resultanalysis/monthresultsvalues", title: "Monthly Results Values", icon:<RiFileListLine />},
    {link:"/analytics/resultanalysis/yearmonthcasescount", title: "Year Month Cases Count", icon:<RiFileListLine />}
]