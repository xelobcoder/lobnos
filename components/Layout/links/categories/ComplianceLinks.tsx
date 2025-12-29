import { Link } from '../types';
import {
     RiShieldCheckLine,
     RiFileList3Line,
     RiAlertLine,
     RiFileTextLine,
     RiGovernmentLine,
     RiClipboardLine,
     RiBarChartLine
} from '@remixicon/react';

export const ComplianceLinks: Link[] = [
     {
          title: "Compliance Management",
          link: "",
          icon: <RiShieldCheckLine />,
          children: [
               {
                    title: "Incident Reporting",
                    link: "/compliance/incident-reporting",
                    icon: <RiAlertLine />
               },
               {
                    title: "Compliance Analytics",
                    link: "/analytics/compliance",
                    icon: <RiBarChartLine />
               }
          ]
     }
];