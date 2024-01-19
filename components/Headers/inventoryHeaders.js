import React, {  useEffect } from 'react'
import GridViewIcon from '@mui/icons-material/GridView';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { AddShoppingCart, Category, ExpandCircleDownSharp, Settings, UnarchiveRounded, Warehouse } from '@mui/icons-material';
import Link from 'next/link';

export default function InventoryHeaders({auth}) {
  const { username, role, email } = auth;

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
        <ul >
          <li>
            <div className='icons'>
              <GridViewIcon fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory'>
                Stocks
              </Link>
            </div>
          </li>
          {/* <li>
            <div className='icons'>
              <AddShoppingCart fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory/addstock'>
                new stock
              </Link>
            </div>
          </li> */}
          <li>
            <div className='icons'>
              <ExpandCircleDownSharp fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory/expirestocks'>
                expires stocks
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <UnarchiveRounded fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory/stocks'>
                Instocks
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <DepartureBoardIcon fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory/department'>
                Department requisitions
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <DepartureBoardIcon fontSize='small' sx={{ marginRight: '10px' }} />
            </div>
            <div className='text'>
              <Link href='/inventory/stocksrequest'>
                General Store
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
             <Warehouse/>
            </div>
            <div className='text'>
              <Link href='/inventory/warehouse'>
                WareHouse
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
             <Warehouse/>
            </div>
            <div className='text'>
              <Link href='/inventory/analytics'>
                analytics
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
            <Settings/>
            </div>
            <div className='text'>
              <Link href='/inventory/settings'>
               Settings
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
