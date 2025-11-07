import { Link } from '../types';
import {
     RiShieldCheckLine,
     RiFileList3Line,
     RiAlertLine,
     RiFileTextLine,
     RiGovernmentLine,
     RiClipboardLine
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
                    title: "Regulatory Submissions",
                    link: "/compliance/regulatory-submissions",
                    icon: <RiFileTextLine />
               }
          ]
     },
     {
          title: "Quality Assurance",
          link: "",
          icon: <RiClipboardLine />,
          children: [
               {
                    title: "Quality Metrics",
                    link: "/compliance/quality-metrics",
                    icon: <RiFileList3Line />
               },
               {
                    title: "Audit Trails",
                    link: "/compliance/audit-trails",
                    icon: <RiGovernmentLine />
               }
          ]
     }
];