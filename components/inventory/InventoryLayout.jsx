import React from 'react'
import InventoryHeaders from '../Headers/inventoryHeaders'
import SettingsLayout from '../settingsComponents/SettingsLayout'

export default function InventoryLayout({ children }) {
  return (
    <>
      <SettingsLayout sidebar={<InventoryHeaders />}>
        {children}
      </SettingsLayout>
    </>
  )
}
