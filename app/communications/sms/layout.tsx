import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { SmsLinks } from "../../../components/Layout/links/categories/SmsLinks";
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
                         <PrimeLayout links={SmsLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
