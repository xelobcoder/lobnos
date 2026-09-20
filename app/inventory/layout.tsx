"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { InventoryLinks } from "../../components/Layout/links/categories/InventoryLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";
import { PharmacyLinks } from "../../components/Layout/links/categories/PharmacyLinks";

function InventoryPrimeLayout({ children }: { children: React.ReactNode }) {
     const searchParams = useSearchParams();
     const links = searchParams.get('workspace') === 'pharmacy' ? PharmacyLinks : InventoryLinks;

     return (
          <ApplicationProvider>
               <MAIN_LAYOUT>
                    <PrimeLayout links={links}>
                         {children}
                    </PrimeLayout>
               </MAIN_LAYOUT>
          </ApplicationProvider>
     );
}


export default function InventoryLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <Suspense>
               <InventoryPrimeLayout>{children}</InventoryPrimeLayout>
          </Suspense>
     );
}