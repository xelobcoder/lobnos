import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";
import { PatientPortalLinks } from "../../components/Layout/links/categories/PatientPortalLinks";

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={PatientPortalLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
