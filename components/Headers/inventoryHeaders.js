import React from 'react'
import GridViewIcon from '@mui/icons-material/GridView';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { AddShoppingCart, Category, ExpandCircleDownSharp, UnarchiveRounded} from '@mui/icons-material';
import Link from 'next/link';
export default function InventoryHeaders() {
  return (
    <div >
      <ul className='inventory_sidebar'>
        <li>
          <Link href='/inventory'>
            <GridViewIcon fontSize='small' sx={{marginRight:'10px'}} />
            Stocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/stockcategory'>
            <Category fontSize='small' sx={{marginRight:'10px'}}/>
            Add category
          </Link>
        </li>
        <li>
          <Link href='/inventory/addstock'>
            <AddShoppingCart fontSize='small' sx={{marginRight:'10px'}} />
            new stock
          </Link>
        </li>
        <li>
          <Link href='/inventory/expirestocks'>
            <ExpandCircleDownSharp fontSize='small' sx={{marginRight:'10px'}} />
            expires stocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/stocks'>
            <UnarchiveRounded fontSize='small' sx={{marginRight:'10px'}} />
            Instocks
          </Link>
        </li>
        <li>
          <Link href='/inventory/department'>
            <DepartureBoardIcon fontSize='small' sx={{marginRight:'10px'}} />
            Department requisition
          </Link>
        </li>
      </ul>
    </div>
  )
}
