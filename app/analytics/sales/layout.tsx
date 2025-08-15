import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { SalesLinks } from "../../../components/Layout/links/categories/salesLinks";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ApplicationProvider>
        <MAIN_LAYOUT>
          <PrimeLayout links={SalesLinks}>
            {children}
          </PrimeLayout>
        </MAIN_LAYOUT>
      </ApplicationProvider>
    </Suspense>
  );
}
