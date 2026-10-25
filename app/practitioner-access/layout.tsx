import {Suspense} from 'react';
export const metadata={referrer:'no-referrer',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <Suspense fallback={<p>Loading practitioner access…</p>}>{children}</Suspense>;}
