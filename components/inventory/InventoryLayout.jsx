import React from 'react'
import InventoryHeaders from '../Headers/inventoryHeaders'

export default function InventoryLayout({ children }) {
  return (
    <>
      <div style={{backgroundColor:'#00224f17',height:'100vh'}}>
        <InventoryHeaders />
        {children}
      </div>
    </>
  )
}
