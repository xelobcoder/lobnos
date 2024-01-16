import { useRouter } from 'next/navigation';
import { ListGroupItem } from 'react-bootstrap';
import { handleAssignWare } from '../Util';
export default function StockListView({ data,handleDelete, handleEditingStock}) {
   const { stockid, date, categoryname, purchaseunit, name, alertlevel, quantity,consumptionunit } = data;
   const router = useRouter();
   const alertSignal = () => {
      if (quantity === 0) return `bg-danger`;
      if (alertlevel >= quantity) return `bg-warning`;
      return;
   }
   
   return (
      <ListGroupItem dataid={stockid} className={`stock-grid p-3 br-0  bg-opacity-50 ${alertSignal()}`}>
         <span>{new Date(date).toLocaleDateString()}</span>
         <span>{name}</span>
         <span>{categoryname}</span>
         <span className='d-flex flex-column text-capitalize'>
            <span>purchase unit({purchaseunit})</span>
            <span>consump. unit({consumptionunit})</span>
         </span>
         <span>{quantity}</span>
         <span>{alertlevel}</span>
         <span>
            <button onClick={() => handleDelete(stockid)} className='btn btn-sm  btn-danger'>
               delete
            </button>
            <button onClick={() => handleEditingStock(stockid, data)} className='btn btn-sm btn-primary mx-2'>
                edit
            </button>
            <button   onClick={() => { handleAssignWare(data,router) }} className='btn btn-secondary btn-sm'>
               brands
            </button>
         </span>

      </ListGroupItem>
   )
}