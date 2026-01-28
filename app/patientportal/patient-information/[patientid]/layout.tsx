import { Suspense } from "react";
import { ApplicationProvider } from "../../../../components/Auth/useApplicationContext";
import MAIN_LAYOUT from "../../../../components/Layout/MainLayout";
import PrimeLayout from "../../../../components/Layout/PrimeLayout";



export default function SMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Suspense>
      <ApplicationProvider>
        <MAIN_LAYOUT>
          <PrimeLayout links={[]}>
            {children}
          </PrimeLayout>
        </MAIN_LAYOUT>
      </ApplicationProvider>
    </Suspense>
  );
}
