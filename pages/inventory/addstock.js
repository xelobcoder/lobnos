import React from 'react'
import Header from '../../components/header';
import ADD_STOCK_INVENTORY from '../../components/inventory/addstock';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';
import InventoryLayout from '../../components/inventory/InventoryLayout';

export default function INVENTORY_ADD_PAGE() {
 return (
  <InventoryLayout>
    <ADD_STOCK_INVENTORY/>
  </InventoryLayout>
 )
}



