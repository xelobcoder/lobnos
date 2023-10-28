import React, { useContext,useEffect } from 'react';
import SupplierTopNav from '../../components/supplierTopNav';
import SettingsLayout from '../settingsComponents/SettingsLayout';
import AuthContext from '../Auth/useAuthentification';
import { useRouter } from 'next/router';
export default function SupplierLayout({ children }) {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (['manager','admin'].includes(auth?.role) == false) {
      router.push('/authorization')
    }
  }, []);

  return (
    <>
      <SettingsLayout sidebar={<SupplierTopNav />}>
        {children}
      </SettingsLayout>
    </>
  )
}
