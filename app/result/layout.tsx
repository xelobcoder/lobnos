import { Suspense } from 'react';
import { ApplicationProvider } from '../../components/Auth/useApplicationContext';
import MAIN_LAYOUT from '../../components/Layout/MainLayout';
// import '../../styles/result.css'




export default function ResultLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
         <Suspense>
                    <ApplicationProvider >
                           <MAIN_LAYOUT>
                                 {children}
                           </MAIN_LAYOUT>
                    </ApplicationProvider>
               </Suspense>
     );
}
