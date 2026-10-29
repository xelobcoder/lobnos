'use client';
import React, { Suspense } from 'react';
import styles from './PayrollWorkspace.module.css';
import PrimeLayout from '../../../components/Layout/PrimeLayout';
import { PayrollLinks } from '../../../components/Layout/links/categories/PayrollLinks';
import { ApplicationProvider } from '../../../components/Auth/useApplicationContext';
import MAIN_LAYOUT from '../../../components/Layout/MainLayout';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
     return (
          <Suspense>
               <ApplicationProvider>
                    <MAIN_LAYOUT>
                         <PrimeLayout links={PayrollLinks}>
                              <div className={styles.workspace}>{children}</div>
                         </PrimeLayout>
                    </MAIN_LAYOUT>
               </ApplicationProvider>
          </Suspense>
     );
}
