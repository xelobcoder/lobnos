'use client';
import React from 'react';
import PrimeLayout from '../../../components/Layout/PrimeLayout';
import { PayrollLinks } from '../../../components/Layout/links/categories/PayrollLinks';
import { ApplicationProvider } from '../../../components/Auth/useApplicationContext';
import MAIN_LAYOUT from '../../../components/Layout/MainLayout';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
     return (
          <ApplicationProvider>
               <MAIN_LAYOUT>
                    <PrimeLayout links={PayrollLinks}>
                         {children}
                    </PrimeLayout>
               </MAIN_LAYOUT>
          </ApplicationProvider>
     );
}
