import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import "../../node_modules/react-toastify/dist/ReactToastify.min.css";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { PharmacyLinks } from "../../components/Layout/links/categories/PharmacyLinks";
import PrimeToast from "../../components/accessories/PrimeToast";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeToast />
                         <PrimeLayout links={PharmacyLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
