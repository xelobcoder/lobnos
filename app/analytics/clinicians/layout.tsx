import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import { ResultAnalysisLinks } from "../../../components/Layout/links/categories/DashboardLinks";
import PrimeLayout from "../../../components/Layout/PrimeLayout";

export default function SMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Suspense>
    <ApplicationProvider>
      <PrimeLayout links={[]}>
        {children}
      </PrimeLayout>
    </ApplicationProvider>
  </Suspense>
  );
}
