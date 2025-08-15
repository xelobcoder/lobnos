import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { AppointmentsLinks } from "../../components/Layout/links/categories/AppointmentsLinks";
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
          <PrimeLayout links={AppointmentsLinks}>
            {children}
          </PrimeLayout>
        </MAIN_LAYOUT>
      </ApplicationProvider>
    </Suspense>
  );
}
