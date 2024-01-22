import { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import DebitableBrandBatch from './_DebitableTable';
export default function DispatchStockAccordionList({ data, index,invsettings }) {
   const [debitable, setdebitable] = useState([]);

   useEffect(() => {
      if (data && data.debitable && invsettings.stocksAutoDeduct) {
         const { debitable } = data;
         const approvedQuantity = parseInt(data.quantity_approved);
   
         let remainder = approvedQuantity;
   
         const updatedDebitable = debitable.map((item) => {
            const { storeQty } = item;
            const brandbatchqty = parseInt(storeQty);
   
            const served = Math.min(remainder, brandbatchqty);
            const deficit = brandbatchqty - served;
   
            remainder -= served;
   
            return {
               ...item,
               served,
               availableQty: brandbatchqty,
               currentQty: brandbatchqty - served,
               deficit,
            };
         });
   
         setdebitable([...updatedDebitable]);
      }
   }, [data, invsettings]);
   
   console.log(debitable)
   return (
      <Accordion.Item   eventKey={index}>
         <Accordion.Header>
            <div className='grid-6 text-capitalize' style={{ width: '100%',fontSize:'14px' }}>
               <span>{data?.name}</span>
               <span>{new Date(data?.date).toLocaleDateString()}</span>
               <span>Total store qty({data.quantity})</span>
               <span>Req. Qty({data?.quantity_requested})</span>
               <span>App. Qty({data?.quantity_approved})</span>
               <span className='btn btn-success btn-sm' style={{ width: 'max-content' }}>{data?.status}</span>
               <span>

               </span>
           </div>
      </Accordion.Header>
         <Accordion.Body>
            {/* <table className='table'>
               <thead>
                  <tr>
                     <th>Brand</th>
                     <th>Batch/lot</th>
                     <th>Store Qty</th>
                     <th>Available</th>
                     <th>Current</th>
                     <th>Served</th>
                  </tr>
               </thead>
               <tbody>
            {
               debitable.length > 0 && debitable.map((a, v) => {
                  return (
                     <tr key={v}>
                        <td>{a.brand}</td>
                        <td>{a.batchnumber}</td>
                        <td>{a.storeQty}</td>
                        <td>{a.availableQty}</td>
                        <td>{a.currentQty}</td>
                        <td>
                           <input value={a.served} className='custom-input' type='number'/>
                        </td>
                     </tr>
                )
             })
            }
           </tbody>
            </table> */}
            <DebitableBrandBatch data={debitable}/>
      </Accordion.Body>
</Accordion.Item>
   )
}