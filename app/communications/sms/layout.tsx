import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { SmsLinks } from "../../../components/Layout/links/categories/SmsLinks";



export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
          <ApplicationProvider>
               <PrimeLayout links={SmsLinks}>
                    {children}
               </PrimeLayout>
          </ApplicationProvider>
     </Suspense>
     );
}
