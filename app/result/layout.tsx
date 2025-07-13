import { Suspense } from 'react';
import '../../styles/result.css'




export default function ResultLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
           <Suspense>
                <div>
                 {children}
            </div>
            </Suspense>
     );
}
