import { RiTeamLine, RiStethoscopeLine, RiMoneyDollarCircleLine } from "@remixicon/react";
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
          icon: <RiStethoscopeLine />,
     },
];
