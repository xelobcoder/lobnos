import React from 'react'
import GridViewIcon from '@mui/icons-material/GridView';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { AddShoppingCart, ExpandCircleDownSharp, UnarchiveRounded} from '@mui/icons-material';
import Link from 'next/link';
export default function InventoryHeaders() {
  return (
    <div id='custom-sidebar'>
      <ul>
        <li>
          <Link href='/inventory'>
            <GridViewIcon fontSize='large' />
            Stocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/addstock'>
            <AddShoppingCart fontSize='large' />
            new stock
          </Link>
        </li>
        <li>
          <Link href='/inventory/expirestocks'>
            <ExpandCircleDownSharp fontSize='large' />
            expires stocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/instock'>
            <UnarchiveRounded fontSize='large' />
            Instocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/department'>
            <DepartureBoardIcon fontSize='large' />
            Department requisition
          </Link>
        </li>
      </ul>
    </div>
  )
}
