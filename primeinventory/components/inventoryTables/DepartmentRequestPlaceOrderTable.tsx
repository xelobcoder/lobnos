"use client";
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { departmentRequisition } from '../../Lib/departInventoryPlaceorder';
import InventoryStockFiltering from '../inventory/purchasesFlow/InventoryStockFiltering';
import '../../styles/prime-table.css';
import NoDataAvailable from '../accessories/NoDataAvailable';

export interface SelectedStockItem {
     alertlevel: number;
     category: string;
     categoryname: string;
     consumptionunit: string;
     date: string;
     label: string;
     name: string;
     quantity: number;
     quantityrequired: number;
     stockid: number;
     value: number;
     requestedQty: number;
}

const defaultStockItem: SelectedStockItem = {
     alertlevel: 0,
     category: '',
     categoryname: '',
     consumptionunit: '',
     date: new Date().toISOString(),
     label: '',
     name: '',
     quantity: 0,
     quantityrequired: 0,
     stockid: 0,
     value: 0,
     requestedQty: 0,
};

const DepartmentRequestPlaceOrderTable = ({ departmentId }: { temp: SelectedStockItem[]; departmentId: number }) => {
     const [stocks, setStocks] = useState<SelectedStockItem[]>([]);
     const [selectedStock, setSelectedStock] = useState<SelectedStockItem>(defaultStockItem);
     const [btnDisabled, setBtnDisabled] = useState<boolean>(true);

     const handleAddRequestedItem = () => {
          if (!selectedStock.stockid) {
               toast.error('Please select a stock item.');
               return;
          }

          if (selectedStock.requestedQty <= 0) {
               toast.error('Quantity must be greater than zero.');
               return;
          }

          if (stocks.some((stock) => stock.stockid === selectedStock.stockid)) {
               toast.warn('This stock item is already added.');
               return;
          }

          if (selectedStock.requestedQty > selectedStock.quantity) {
               toast.error('Quantity must not be greater than main store quantity.');
               return;
          }

          setStocks((prevStocks) => [...prevStocks, selectedStock]);
          setSelectedStock(defaultStockItem);
     };

     const handleSelectedStock = (value: Partial<SelectedStockItem>) => {
          if (value) {
               const keys = Object.keys(value)
               if (keys.length > 0 && keys.includes('stockid') && value.stockid) {
                    setSelectedStock({ ...defaultStockItem, ...value });
               }
          }
          return;
     };

     const updateButtonState = () => {
          setBtnDisabled(stocks.length === 0 || stocks.some((stock) => stock.requestedQty <= 0));
     };

     useEffect(() => {
          updateButtonState();
     }, [stocks]);



     const handleStockSubmission = async () => {
          try {
               const response = await departmentRequisition({ stocks, departmentid: departmentId });
               const { success, message } = response;
               if (success == true) {
                    toast.success(message);
                    setStocks([]);
               }
               else { toast.error(message) };
          } catch (err) {
               console.log(err);

          }
     }


     const CartViewOrders = () => {
          if (stocks.length == 0) return <NoDataAvailable message='No stock Selected' />
          return (
               <div className="bt-wrapper">
                    <table className="bt">
                         <thead>
                              <tr>
                                   <th>Stock</th>
                                   <th>Category</th>
                                   <th>Consumption Unit</th>
                                   <th>Store Qty</th>
                                   <th className="pinned">Qty Required</th>
                              </tr>
                         </thead>
                         <tbody>
                              {stocks.map((stock) => (
                                   <tr key={stock.stockid}>
                                        <td>{stock.name}</td>
                                        <td>{stock.categoryname}</td>
                                        <td>{stock.consumptionunit}</td>
                                        <td className={stock.quantity === 0 ? 'text-danger' : ''}>
                                             {stock.quantity}
                                        </td>
                                        <td className="pinned">{stock.requestedQty}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          )
     }



     return (
          <React.Fragment>
               <ToastContainer position='top-center' theme='colored' className={'text-sm'} />
               <div className="col-12 my-lg-2 d-lg-flex">
                    <div className="col-4">
                         <InventoryStockFiltering
                              onSelectStock={handleSelectedStock}
                              selectedWarehouse="all"
                              page={1}
                              count={10}
                         />
                    </div>
                    <div className="col-4 mx-lg-2">
                         <input
                              type="number"
                              className="custom-input"
                              placeholder="Quantity Required"
                              value={selectedStock.requestedQty}
                              onChange={(ev) =>
                                   setSelectedStock({
                                        ...selectedStock,
                                        requestedQty: parseInt(ev.target.value) || 0,
                                   })
                              }
                         />
                    </div>
                    <div>
                         <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleAddRequestedItem}
                         >
                              Request Item
                         </button>
                    </div>
               </div>

               <CartViewOrders/>
               <div className='my-2'>
                    <button
                         className="btn btn-primary btn-sm"
                         onClick={handleStockSubmission}
                         disabled={btnDisabled}
                    >
                         Push Order
                    </button>
               </div>
          </React.Fragment>
     );
};

export default DepartmentRequestPlaceOrderTable;
