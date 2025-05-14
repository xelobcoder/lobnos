import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { SalesLinks } from "../../../components/Layout/links/categories/salesLinks";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ApplicationProvider>
       <PrimeLayout links={SalesLinks}>
       {children}
       </PrimeLayout>
      </ApplicationProvider>
    </Suspense>
  );
}
