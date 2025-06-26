import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { LaboratoryOperationsLinks } from "../../../components/Layout/links/categories/LaboratoryOperationsLinks";




export default function LaboratoryLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider>
                    <PrimeLayout links={LaboratoryOperationsLinks}>
                         {children}
                    </PrimeLayout>
               </ApplicationProvider>
          </Suspense>
     );
}
