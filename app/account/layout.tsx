import {Suspense} from 'react';
import {ApplicationProvider} from '../../components/Auth/useApplicationContext';
import MAIN_LAYOUT from '../../components/Layout/MainLayout';
import PrimeLayout from '../../components/Layout/PrimeLayout';
export default function AccountLayout({children}:{children:React.ReactNode}){return <Suspense><ApplicationProvider><MAIN_LAYOUT><PrimeLayout links={[{title:'My roles & locations',link:'/account/roles'},{title:'Staff access',link:'/account/staff',roles:['admin','pharmacy_manager']}]}>{children}</PrimeLayout></MAIN_LAYOUT></ApplicationProvider></Suspense>}
