'use client';

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { ApplicationSettingsLinks } from "../../components/Layout/links/categories/ApplicationSettingsLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";






export default function SMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A revoked session must be able to reach cookie clearing without restoring a workspace.
  const pathname = usePathname();
  if (pathname === '/authentication/logout') return children;

  return (
    <Suspense>
      <ApplicationProvider>
        <MAIN_LAYOUT>
          <PrimeLayout links={ApplicationSettingsLinks}>
            {children}
          </PrimeLayout>
        </MAIN_LAYOUT>
      </ApplicationProvider>
    </Suspense>
  );
}
