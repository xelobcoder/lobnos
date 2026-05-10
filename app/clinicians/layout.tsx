import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import PrimeToast from "../../components/accessories/PrimeToast";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { ClinicianLinks } from "../../components/Layout/links/categories/ClinicianLinks";



export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <Suspense>
               <ApplicationProvider >
                    <MAIN_LAYOUT>
                         <PrimeToast />
                         <PrimeLayout links={ClinicianLinks}>
                              {children}
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
