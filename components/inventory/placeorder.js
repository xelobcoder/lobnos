import React from 'react';
import TableIsLoading from '../accessories/TableIsLoading';

export default function PLACE_ORDER({ source, cartHandler, suppliers }) {
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
                        {
                          suppliers.length === 0 ? <option>no supplier</option> :
                            suppliers.map((item, index) => {
                              return <option key={index} dataid={item.supplierid} value={item.supplierid}>{item.name}</option>
                            })
                        }
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
                          if (selectedproduct.quantity === '' || selectedproduct.supplier === '') {
                            alert('please fill all fields');
                            return;
                          }
                          else {
                            const suppliedid = selectedproduct.supplier;
                            const supplierName = suppliers.filter(item => { return parseInt(item.supplierid) === parseInt(suppliedid) })[0].name;
                            cartHandler(ev, {
                              quantity: selectedproduct.quantity,
                              stockid: item.stockid,
                              name: item.name,
                              purchaseunit: item.purchaseunit,
                              tax: item.tax,
                              suppliername: supplierName,
                              supplierid: suppliedid
                            })
                          }

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
