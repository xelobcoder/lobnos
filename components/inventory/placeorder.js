import React from 'react';
import TableIsLoading from '../accessories/TableIsLoading';

export default function PLACE_ORDER({ source, cartHandler }) {
 // GET ALL DATA OF COMMODITIES FROM SERVER
 const [datasource, setDatasource] = React.useState(source);
 const [selectedproduct, setSelectedproduct] = React.useState({
  quantity: '',
  supplier: '',
 });

 return (
  <>
   <div id='placeorder'>
    {datasource.length === 0 ? <TableIsLoading /> :
     <table >
      <thead>
       <tr>
        <th>stk id</th>
        <th>name</th>
        <th>category</th>
        <th>consump. unit</th>
        <th>purchase unit</th>
        <th>unit qty</th>
        <th>supplier</th>
        <th>quantity required </th>
        <th>tax</th>
        <th>action</th>
       </tr>
      </thead>
      <tbody>
       {datasource.map((item, index) => {
        return (
         <tr key={index}>
          <td>{item.stockid}</td>
          <td>{item.name}</td>
          <td>{item.category}</td>
          <td>{item.consumptionunit}</td>
          <td>{item.purchaseunit}</td>
          <td>{item.unitquantity}</td>
          <td>
           <select className='custom-input' onChange={
            (ev) => {
             setSelectedproduct({
              ...selectedproduct,
              supplier: ev.target.value
             })
            }
           }>
            <option value="supplier1">supplie</option>
            <option value="supplier2">supplier2</option>
            <option value="supplier3">supplier3</option>
            <option value="supplier4">supplier4</option>
           </select>
          </td>
          <td>
           <input
            onChange={
             (ev) => {
              setSelectedproduct({
               ...selectedproduct,
               quantity: ev.target.value
              })
             }
            }
            className='custom-input' type="number" />
          </td>
          <td>{item.tax + '%'}</td>
          <td dataid={item.stockid}>
           <button dataid={item.stockid}
            onClick={(ev) => {
             cartHandler(ev, {
              ...selectedproduct,
              stockid: item.stockid,
              name: item.name,
              purchaseunit: item.purchaseunit,
              tax: item.tax
             })
            }}
            className='btn btn-sm btn-primary'>Add to cart</button>
          </td>
         </tr>
        );
       }
       )}
      </tbody>
     </table>}
   </div></>
 )
}
