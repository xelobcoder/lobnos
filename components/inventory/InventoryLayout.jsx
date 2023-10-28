import React, { useContext, useEffect } from 'react'
import InventoryHeaders from '../Headers/inventoryHeaders'
import SettingsLayout from '../settingsComponents/SettingsLayout'
import AuthContext from '../Auth/useAuthentification'
import { useRouter } from 'next/router';

export default function InventoryLayout({ children }) {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    if (['manager','admin'].includes(auth?.role) == false) {
      router.push('/authorization')
    }
  }, []);

  return (
    <>
      <SettingsLayout sidebar={<InventoryHeaders />}>
        {children}
      </SettingsLayout>
    </>
  )
}
