'use client'
import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { Link } from "../../../components/Layout/links/types";
import { useParams } from "next/navigation";

import {
     RiPieChart2Line,
     RiCalendar2Line,
     RiBarChart2Line,
     RiStackLine,
     RiLineChartLine,
     RiListCheck2,
     RiTeamLine,
     RiPulseLine,
} from "@remixicon/react";

export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     const ClincianAnalyticsLinks: Link[] = [
          { title: `Overall Analytics`, link: `./overall/`, icon: <RiPieChart2Line size={18} /> },
          { title: "Daily Summary", link: "./daily-summary", icon: <RiCalendar2Line size={18} /> },
          { title: "Monthly Summary", link: "./monthly-summary", icon: <RiBarChart2Line size={18} /> },
          { title: "Yearly Summary", link: "./yearly-summary", icon: <RiStackLine size={18} /> },
          { title: "Daily Case Change", link: "./daily-case-change", icon: <RiLineChartLine size={18} /> },
          { title: "Monthly Totals", link: "./monthly-totals", icon: <RiListCheck2 size={18} /> },
          { title: "Yearly Totals", link: "./yearly-totals", icon: <RiTeamLine size={18} /> },
          { title: "Cases vs Total", link: "./cases-vs-total", icon: <RiPulseLine size={18} /> },
     ];

     return (
          <Suspense>
               <ApplicationProvider>
                    <PrimeLayout links={ClincianAnalyticsLinks}>
                         {children}
                    </PrimeLayout>
               </ApplicationProvider>
          </Suspense>
     );
}
