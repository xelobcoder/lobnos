import { Suspense } from 'react';
import styles from './layout.module.css';
import { ApplicationProvider } from '../../components/Auth/useApplicationContext';
import PrimeLayout from '../../components/Layout/PrimeLayout';
import MAIN_LAYOUT from '../../components/Layout/MainLayout';
import { PharmacyLinks } from '../../components/Layout/links/categories/PharmacyLinks';
import PharmacyPageHelp from './components/PharmacyPageHelp';


export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={PharmacyLinks}>
                              <div className={styles.workspace}><PharmacyPageHelp/>{children}</div>
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}