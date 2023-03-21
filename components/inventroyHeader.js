import React from 'react';
import Link from 'next/link';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { InsertInvitationRounded } from '@mui/icons-material';

export default function InventroyHeader() {
  return (
    <div>
      <ul className='frontpagesidebar"'>
        <li>
          <Link href="/supplier/addsupplier">
            <AddBoxIcon fontSize='large' />
            Add supplier
          </Link>
        </li>
        <li>
          <Link href="/supplier/inventory">
            <AddBoxIcon fontSize='large' />
            inventory
          </Link>
        </li>
        <li>
          <Link href="/supplier/placeorder">
            <AddBoxIcon fontSize='large' />
            place order
          </Link>
        </li>
        <li>
          <Link href="/supplier/purchases">
          <AddBoxIcon fontSize='large' />
              purchases
          </Link>
        </li>
        <li>
          <Link href="/supplier/stock">
            <AddBoxIcon fontSize='large' />
            stock
          </Link>
        </li>

      </ul>
    </div>
  )
}



