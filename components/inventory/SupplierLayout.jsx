import React from 'react';
import SupplierTopNav from '../../components/supplierTopNav';
import SettingsLayout from '../settingsComponents/SettingsLayout';
export default function SupplierLayout({ children }) {
  return (
    <>
      <SettingsLayout sidebar={<SupplierTopNav/>}>
        {children}
      </SettingsLayout>
    </>
  )
}
