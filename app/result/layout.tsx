import { Suspense } from 'react';
import { ApplicationProvider } from '../../components/Auth/useApplicationContext';
// import '../../styles/result.css'




export default function ResultLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
         <Suspense>
                    <ApplicationProvider >
                              {children}
                    </ApplicationProvider>
               </Suspense>
     );
}
