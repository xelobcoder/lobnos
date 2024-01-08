import React from 'react';
import Link from 'next/link';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Inventory, MoneyOffCsredRounded, OutboxRounded, Person, Storage } from '@mui/icons-material';

export default function SupplierTopNav({auth}) {
  const { email, username, role } = auth;

  return (
    <div className='settings-sidebar'>
       <div className='head'>
        <Link  href={'/'} >
            PLS
          </Link>
        </div>
        <div className='user'>
          <span>{username}({role})</span>
        </div>
      <div className='contents'>
        <ul>
          <li>
            <div className='icons'>
              <Person/>
            </div>
            <div className='text'>
              <Link href="/supplier">
                suppliers
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <AddBoxIcon fontSize='medium' />
            </div>
            <div className='text'>
              <Link href="/supplier/addsupplier">
                Add supplier
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Inventory fontSize='medium' />
            </div>
            <div className='text'>
              <Link href="/inventory">
                inventory
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <OutboxRounded fontSize='medium' />
            </div>
            <div className='text'>
              <Link href="/supplier/placeorder">
                place order
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <MoneyOffCsredRounded fontSize='medium' />
            </div>
            <div className='text'>
              <Link href="/supplier/purchases">
                purchases
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Storage fontSize='medium' />
            </div>
            <div className='text'>
              <Link href="/inventory">
                stock
              </Link>
            </div>
          </li>

        </ul>
      </div>
    </div>
  )
}



