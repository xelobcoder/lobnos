import React, { useContext, useEffect } from 'react'
import InventoryHeaders from '../Headers/inventoryHeaders'
import SettingsLayout from '../settingsComponents/SettingsLayout'
import AuthContext from '../Auth/useAuthentification'
import Authorization from '../accessories/authorization';

export default function InventoryLayout({ children }) {
  const { auth } = useContext(AuthContext);
  const authorized = ['manager', 'admin'].includes(auth?.role) != false


  return (
    <>
      {authorized ?
        (<SettingsLayout sidebar={<InventoryHeaders />}>
          {children}
        </SettingsLayout>)
        :
        (<Authorization/>)}
    </>
  )
}
