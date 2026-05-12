import { RiTeamLine, RiStethoscopeLine, RiMoneyDollarCircleLine, RiBuilding4Line, RiHistoryLine, RiTimeLine } from "@remixicon/react";
import { Link } from "../types";

export const CommissionLinks: Link[] = [
     {
          title: "Commissions Overview",
          link: "/commissions",
          icon: <RiMoneyDollarCircleLine />,
     },
        {
          title: "Organization Pending",
          link: "/commissions/organizations/pending-commissions",
          icon: <RiBuilding4Line />,
     },
     {
          title: "Clinician Pending",
          link: "/commissions/clinicians/commissions-information",
          icon: <RiStethoscopeLine />,
     },
     {
          title: "General Commissions Analytics",
          link: "/commissions/clinicians/commissions-payments-made",
          icon: <RiHistoryLine />,
     },
  
     {
          title: "Commissions Payments",
          link: "/commissions/commission-payments",
          icon: <RiHistoryLine />,
     },
     {
          title: "Untracked  Commissions",
          link: "/commissions/untracked-commission-records",
          icon: <RiTimeLine />,
     }
];
