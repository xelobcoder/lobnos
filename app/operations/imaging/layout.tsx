import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { ImaginLinks } from "../../../components/Layout/links/categories/imaginglinks";



export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider>
                    <PrimeLayout links={ImaginLinks}>
                         {children}
                    </PrimeLayout>
               </ApplicationProvider>
          </Suspense>
     );
}
