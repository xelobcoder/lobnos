import React from 'react';
import Link from 'next/link';
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function InventroyHeader() {
  return (
    <div>
      <ul className='frontpagesidebar"'>
      <li>
          <Link href="/supplier/addsupplier">
            <a>
              <AddBoxIcon  fontSize='large'/>
              Add supplier
            </a>
          </Link>
        </li>
        <li>
          <Link href="/supplier/inventory">
            <a>
              <AddBoxIcon  fontSize='large'/>
              inventory
            </a>
          </Link>
        </li>
        <li>
        <Link href="/supplier/placeorder">
            <a>
              <AddBoxIcon  fontSize='large'/>
              place order
            </a>
          </Link>
        </li>
      </ul>
    </div>
  )
}



