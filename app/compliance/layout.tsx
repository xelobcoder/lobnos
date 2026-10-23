import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { ComplianceLinks } from "../../components/Layout/links/categories/ComplianceLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";
import PrimeToast from "../../components/accessories/PrimeToast";






export default function ComplianceLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeToast />
                         <PrimeLayout links={ComplianceLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}