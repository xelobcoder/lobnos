import React from 'react';
import Link from 'next/link';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Inventory, MoneyOffCsredRounded, OutboxRounded, Storage } from '@mui/icons-material';

export default function SupplierTopNav() {
  return (
    <div>
      <ul className='inventory_sidebar'>
        <li>
          <Link href="/supplier/addsupplier">
            <AddBoxIcon fontSize='medium' />
            Add supplier
          </Link>
        </li>
        <li>
          <Link href="/inventory">
            <Inventory fontSize='medium'/>
            inventory
          </Link>
        </li>
        <li>
          <Link href="/supplier/placeorder">
            <OutboxRounded fontSize='medium' />
            place order
          </Link>
        </li>
        <li>
          <Link href="/supplier/purchases">
          <MoneyOffCsredRounded fontSize='medium' />
              purchases
          </Link>
        </li>
        <li>
          <Link href="/inventory">
            <Storage fontSize='medium' />
            stock
          </Link>
        </li>

      </ul>
    </div>
  )
}



