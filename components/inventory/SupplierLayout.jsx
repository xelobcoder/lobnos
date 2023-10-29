import React, { useContext, useEffect } from 'react';
import SupplierTopNav from '../../components/supplierTopNav';
import SettingsLayout from '../settingsComponents/SettingsLayout';
import AuthContext from '../Auth/useAuthentification';
import { useRouter } from 'next/router';
import Authorization from '../accessories/authorization';
export default function SupplierLayout({ children }) {
  const { auth } = useContext(AuthContext);
  const authorized = ['manager', 'admin'].includes(auth?.role) != false

  return (
    <>
      {authorized ?
        (
          <SettingsLayout sidebar={<SupplierTopNav />}>{children}</SettingsLayout>
        )
        :
        (
          <Authorization />
        )}
    </>
  );
}
