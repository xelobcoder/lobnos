import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import PrimeToast from "../../components/accessories/PrimeToast";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import { AccountingLinks } from "../../components/Layout/links/categories/AccountingLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import styles from "./accounting.module.css";

export default function AccountingLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeToast />
                         <div className={styles.accountingModule}>
                              <PrimeLayout links={AccountingLinks}>
                                   {children}
                              </PrimeLayout>
                         </div>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
