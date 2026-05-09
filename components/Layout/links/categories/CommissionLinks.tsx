import { RiTeamLine, RiStethoscopeLine, RiMoneyDollarCircleLine, RiBuilding4Line, RiHistoryLine, RiTimeLine } from "@remixicon/react";
import { Link } from "../types";

export const CommissionLinks: Link[] = [
     {
          title: "Commissions Overview",
          link: "/commissions",
          icon: <RiMoneyDollarCircleLine />,
     },
     {
          title: "Clinician Commissions Information",
          link: "/commissions/clinicians/commissions-information",
          icon: <RiStethoscopeLine />,
     },
     {
          title: "General Commissions Payments Made",
          link: "/commissions/clinicians/commissions-payments-made",
          icon: <RiHistoryLine />,
     },
     {
          title: "Organization Commissions Information",
          link: "/commissions/organizations/pending-commissions",
          icon: <RiBuilding4Line />,
     },
     {
          title: "Organization Commissions Payments Made",
          link: "/commissions/organizations/commission-payments",
          icon: <RiHistoryLine />,
     },
     {
          title: "Untracked Commissions",
          link: "/commissions/organizations/untracked-commission-records",
          icon: <RiTimeLine />,
     },
];
