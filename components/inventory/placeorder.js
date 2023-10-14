import React, { useState } from 'react';
import TableIsLoading from '../accessories/TableIsLoading';
import SECOND_NO_DATA from '../accessories/secondNodata';

export default function PLACE_ORDER({ source, cartHandler, suppliers }) {
  // GET ALL DATA OF COMMODITIES FROM SERVER
  const [datasource, setDatasource] = useState(source);
  const [selectedproduct, setSelectedproduct] = useState({
    quantity: '',
    supplier: '',
    purchaseunit: '',
  });

  const [purchaseunit, setPurchaseunit] = useState(['kg', 'g', 'litre','unit','Box','Bottle']);



  return (
    <>
      <div id="placeorder">
        {source.length === 0 ? (
          <SECOND_NO_DATA/>
        ) : (
          <div className="card br-5">
            <div className="card-header" id='split-8'>
              <div>stk id</div>
              <div>item name</div>
              <div>category</div>
              <div>purchase unit</div>
              <div>supplier</div>
              <div>qty required </div>
              <div>action</div>
            </div>
            <div className="card-body">
                  {source.map((item, index) => {
                    return (
                      <div key={index} id='split-8'>
                        <div>{item.stockid}</div>
                        <div>{item.name}</div>
                        <div>{item.category}</div>
                        <div>
                          <select
                            className="custom-select"
                            onChange={(ev) => {
                              setSelectedproduct({
                                ...selectedproduct,
                                purchaseunit: ev.target.value,
                              });
                            }}
                          >
                            <option>select a unit</option>
                            {purchaseunit.map((item, index) => {
                              return (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* <div>{item.unitquantity}</div> */}
                        <div>
                          <select
                            className="custom-select"
                            onChange={(ev) => {
                              setSelectedproduct({
                                ...selectedproduct,
                                supplier: ev.target.value,
                              });
                            }}
                          >
                            <option>select a supplier</option>
                            {suppliers.length === 0 ? (
                              <option>no supplier</option>
                            ) : (
                              suppliers.map((item, index) => {
                                return (
                                  <option
                                    key={index}
                                    dataid={item.supplierid}
                                    value={item.supplierid}
                                  >
                                    {item.name}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        </div>
                        <div>
                          <input
                            onChange={(ev) => {
                              setSelectedproduct({
                                ...selectedproduct,
                                quantity: ev.target.value,
                              });
                            }}
                            className="custom-input"
                            type="number"
                          />
                        </div>
                        <div dataid={item.stockid}>
                          <button
                            dataid={item.stockid}
                            onClick={(ev) => {
                              if (
                                selectedproduct.quantity === '' ||
                                selectedproduct.supplier === ''
                              ) {
                                alert('please fill all fields');
                                return;
                              } else {
                                const suppliedid = selectedproduct.supplier;
                                const supplierName = suppliers.filter(
                                  (item) =>
                                    parseInt(item.supplierid) ===
                                    parseInt(suppliedid)
                                )[0].name;
                                cartHandler(ev, {
                                  quantity: selectedproduct.quantity,
                                  stockid: item.stockid,
                                  name: item.name,
                                  purchaseunit: selectedproduct.purchaseunit,
                                  tax: item.tax,
                                  suppliername: supplierName,
                                  supplierid: suppliedid,
                                });
                               
                              }
                            }}
                            className="btn btn-sm btn-warning"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
