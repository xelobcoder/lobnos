import { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
export default function DispatchStockAccordionList({ data, index }) {
   const [debitable, setdebitable] = useState([]);

   useEffect(() => {
      if (data && data.debitable) {
         setdebitable(data.debitable);
      }
   },[data])
   
   return (
      <Accordion.Item eventKey={index}>
         <Accordion.Header>
            <div className='grid-5 text-capitalize' style={{ width: '100%',fontSize:'14px' }}>
               <span>{data?.name}</span>
               <span>Req. Qty({data?.requesteddate})</span>
               <span>App. Qty({data?.quantity_requested})</span>
               <span>{data?.quantity_approved}</span>
               <span className='btn btn-success btn-sm' style={{width:'max-content'}}>{data?.status}</span>
           </div>
      </Accordion.Header>
         <Accordion.Body>
            <table className='table'>
               <thead>
                  <tr>
                     <th>Brand</th>
                     <th>Batch/lot</th>
                     <th>Store Qty</th>
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
                     </tr>
                )
             })
            }
           </tbody>
            </table>
      </Accordion.Body>
</Accordion.Item>
   )
}