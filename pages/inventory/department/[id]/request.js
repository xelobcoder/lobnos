import React, { useState, useEffect } from 'react';
import SettingsLayout from '../../../../components/settingsComponents/SettingsLayout';
import DepartmentLevelSidebar from '../../../../components/inventory/DepartmentLevelSidebar';
import { customFetch } from '../../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import Inventory from '../../../../components/Auth/inventory';

export default function DepartmentRequestCustom() {
  const inventory = new Inventory();
  const [stocks, setStocks] = useState([]);
  const [temporary, setTemp] = useState([]);
  const [filter, setFilter] = useState('');
  const departmentId = useRouter().query.id;



  useEffect(() => { inventory.getPlaceOrderStocks(setStocks, setTemp);}, []);

  const handleRequiredQty = (e, stockid) => {
    const qty = parseInt(e.target.value);
    setStocks((prevStocks) => {
      return prevStocks.map((stock) => {
        if (stock.stockid === stockid) {
          return { ...stock, quantityrequired: qty };
        }
        return stock;
      });
    });
  };



  const handleFilter = async function (ev) {
    let { value } = ev.target; let len = value.length;
    setFilter(value);
    if (len < 3) return
    else {
      let response = await customFetch(`stocks/filter?filter=${value}`);
      const { statusCode, status, result } = response;
      if (statusCode == 200 && result.length > 0 && len > 3) setStocks(result);
      else {
        setStocks(temporary);
      }
    }
  }

  return (
    <SettingsLayout sidebar={<DepartmentLevelSidebar />}>
      <div className='d-flex px-2 py-2 justify-content-between'>
        <div>
          <h4 className='text-primary'>Department Requisition</h4>
        </div>
        <div className='col-5'>
          <input value={filter} onChange={(ev) => { handleFilter(ev) }} className='custom-input' type='text' placeholder='search using category or stock name ' />
        </div>
      </div>

      <table className='table'>
        <thead>
          <tr>
            <th>stockid</th>
            <th>name</th>
            <th>category</th>
            <th>consumption unit</th>
            <th>store qty</th>
            <th>qty required</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.stockid}>
              <td>{stock.stockid}</td>
              <td>{stock.name}</td>
              <td>{stock.category}</td>
              <td>{stock.consumptionunit}</td>
              <td>{stock.quantity}</td>
              <td>
                <input
                  type="number"
                  value={stock.quantityrequired}
                  onChange={(e) => handleRequiredQty(e, stock.stockid)}
                />
              </td>
              <td>
                <Button onClick={(e) => { inventory.departmentRequisition(e, stock.stockid, departmentId, setStocks, stocks) }} size="small" variant="contained">
                  Order
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsLayout>
  );
}
