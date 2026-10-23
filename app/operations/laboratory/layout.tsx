import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { LaboratoryOperationsLinks } from "../../../components/Layout/links/categories/LaboratoryOperationsLinks";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";








export default function LaboratoryLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={LaboratoryOperationsLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
