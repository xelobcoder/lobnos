import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { AppointmentsLinks } from "../../components/Layout/links/categories/AppointmentsLinks";



export default function SMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Suspense>
          <ApplicationProvider>
            <PrimeLayout links={AppointmentsLinks}>
              {children}
            </PrimeLayout>
          </ApplicationProvider>
        </Suspense>
  );
}
