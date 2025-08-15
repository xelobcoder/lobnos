import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { ImaginLinks } from "../../../components/Layout/links/categories/imaginglinks";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";



export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={ImaginLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
