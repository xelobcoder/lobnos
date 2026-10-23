import { Suspense } from "react";
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
