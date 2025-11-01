import { RiPieChart2Line, RiCalendar2Line, RiBarChart2Line, RiStackLine, RiLineChartLine, RiListCheck2, RiTeamLine, RiPulseLine, RiUserStarLine } from "@remixicon/react";
import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import { Link } from "../../../components/Layout/links/types";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";
import PrimeLayout from "../../../components/Layout/PrimeLayout";

;

export default function ClinicianAnalyticsLayout({
     children,
     params,
}: {
     children: React.ReactNode;
     params: { clinicianid: string };
}) {
     const { clinicianid } = params;

     const clinicianAnalyticsLinks: Link[] = [
          {
               title: 'Clinician Overview',
               link: `/clinicians-analytics/${clinicianid}/overall`,
               icon: <RiPieChart2Line size={18} />
          },
          {
               title: "Daily Summary",
               link: `/clinicians-analytics/${clinicianid}/daily-summary`,
               icon: <RiCalendar2Line size={18} />
          },
          {
               title: "Monthly Summary",
               link: `/clinicians-analytics/${clinicianid}/monthly-summary`,
               icon: <RiBarChart2Line size={18} />
          },
          {
               title: "Yearly Summary",
               link: `/clinicians-analytics/${clinicianid}/yearly-summary`,
               icon: <RiStackLine size={18} />
          },
          {
               title: "Daily Case Change",
               link: `/clinicians-analytics/${clinicianid}/daily-case-change`,
               icon: <RiLineChartLine size={18} />
          },
          {
               title: "Monthly Totals",
               link: `/clinicians-analytics/${clinicianid}/monthly-totals`,
               icon: <RiListCheck2 size={18} />
          },
          {
               title: "Yearly Totals",
               link: `/clinicians-analytics/${clinicianid}/yearly-totals`,
               icon: <RiTeamLine size={18} />
          },
          {
               title: "Cases vs Total",
               link: `/clinicians-analytics/${clinicianid}/cases-vs-total`,
               icon: <RiPulseLine size={18} />
          },
          {
               title: "Total Cases",
               link: `/clinicians-analytics/${clinicianid}/totalcases`,
               icon: <RiUserStarLine size={18} />
          },
     ];

     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={clinicianAnalyticsLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}