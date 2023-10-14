import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FactCheck, GetApp, Inventory, Pending, ShoppingBasket, TransferWithinAStation } from '@mui/icons-material';
export default function DepartmentLevelSidebar() {
  const departmentId = useRouter().query.id;
  return (
    <div className='settings-sidebar'>
      <div className='contents'>
        <ul>
          <li>
            <div className='icons'>
              <Inventory />
            </div>
            <div className='text'>
              <Link href={`/inventory/department/${departmentId}`}>
                Department stocks
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Pending />
            </div>
            <div className='text'>
              <Link href={`/inventory/department/${departmentId}/pending`}>
                Pending Requests
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <FactCheck />
            </div>
            <div className='text'>
              <Link href={`/inventory/department/${departmentId}/accepted`}>
                Accepted Requests
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <GetApp/>
            </div>
            <div className='text'>
              <Link href={`/inventory/department/${departmentId}/receive`}>
                Receive stocks
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <ShoppingBasket />
            </div>
            <div className='text'>
              <Link href={`/inventory/department/${departmentId}/request`}>
                place order
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <TransferWithinAStation/>
            </div>
            <div className='text'>
              <Link href="/supplier/purchases">
                transfer stock
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              {/* <Storage fontSize='medium' /> */}
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
