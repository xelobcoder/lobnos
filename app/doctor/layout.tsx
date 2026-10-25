import {Suspense} from 'react';
import DoctorShell from '../../components/Practitioner/DoctorShell';
export default function Layout({children}:{children:React.ReactNode}){return <Suspense fallback={<p>Loading practitioner workspace…</p>}><DoctorShell>{children}</DoctorShell></Suspense>;}
