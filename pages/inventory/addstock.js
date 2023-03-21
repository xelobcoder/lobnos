import React from 'react'
import Header from '../../components/header';
import ADD_STOCK_INVENTORY from '../../components/inventory/addstock';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';

export default function INVENTORY_ADD_PAGE() {
 return (
  <div>
   <ADD_STOCK_INVENTORY />
  </div>
 )
}



INVENTORY_ADD_PAGE.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders />
        </div>
        <div className="main" id='page-main-view'>{page}</div>
      </div>
    </>
  )
}
