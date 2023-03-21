import React from 'react'
import Header from '../../components/header'
import InventoryHeaders from '../../components/Headers/inventoryHeaders'

export default function DepartmentRequisition() {
  return (
    <div className='p-2 lims-text-color'>
      <header className='mt-1'>
        Department Requisition
      </header>
    </div>
  )
}


DepartmentRequisition.getLayout = function getLayout(page) {
  return (
    <>
      <Header/>
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders/>
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  )
}
