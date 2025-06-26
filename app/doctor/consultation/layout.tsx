import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { ConsulationLinks } from "../../../components/Layout/links/categories/ConsultationLinks";




export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
        <Suspense>
        <ApplicationProvider>
          <PrimeLayout links={ConsulationLinks}>
            {children}
          </PrimeLayout>
        </ApplicationProvider>
      </Suspense>
     );
}
