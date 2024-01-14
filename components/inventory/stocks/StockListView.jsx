import { ListGroupItem } from 'react-bootstrap';
export default function StockListView({ data,handleAssignWare,handleDelete,handleEditingStock}) {
   const { stockid, date, categoryname, purchaseunit, name, alertlevel, quantity,consumptionunit } = data;
   const alertSignal = () => {
      if (quantity === 0) return `bg-danger`;
      if (alertlevel >= quantity) return `bg-warning`;
      return;
   }
   return (
      <ListGroupItem dataid={stockid} className={`stock-grid p-3  bg-opacity-50 ${alertSignal()}`}>
         <span>{new Date(date).toLocaleDateString()}</span>
         <span>{name}</span>
         <span>{categoryname}</span>
         <span className='d-flex flex-column text-capitalize'>
            <span>purchase unit({purchaseunit})</span>
            <spa>consump. unit({consumptionunit})</spa>
         </span>
         <span>{quantity}</span>
         <span>{alertlevel}</span>
         <span>
            <buttons onClick={() => handleDelete(stockid)} className='btn btn-sm  btn-danger'>
               delete
            </buttons>
            <buttons onClick={() => handleEditingStock(stockid, data)} className='btn btn-sm btn-primary mx-2'>
                edit
            </buttons>
            <buttons onClick={() => { handleAssignWare(data) }} className='btn btn-secondary btn-sm'>
               view
            </buttons>
         </span>
      </ListGroupItem>
   )
}