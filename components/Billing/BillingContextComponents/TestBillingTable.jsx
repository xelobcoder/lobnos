import { Clear, Delete } from "@mui/icons-material";
import { useContext } from "react";
import { Table } from "react-bootstrap";
import { BillingContext } from "./BillingContext";
import TrTable from "./TableTr";
import { currencyFormatter } from "../../Auth/customFetch";

export default function TestBillingTable({ toast }) {
  const { billingdata, updateBilling } = useContext(BillingContext);
  const cart = billingdata?.cart;


  const removeFromCart = (testId) => {
    updateBilling(function (prev) {
      const newCart = prev.cart.filter((item) => item.id !== testId);
      return { ...prev, cart: newCart };
    });
  };

  if (!billingdata.billingSource) {
    return <div className="br-0 alert border-2 border-danger alert-danger alert-dismissible"> Select Billing Source to continue</div>;
  }

  return (
    <Table className="table-striped  billing-cart-table table-hover table p-0">
      <thead className="text-capitalize">
        <tr>
          <th style={{ width: '40%' }}>Test</th>
          <th style={{ width: '10%' }}>Quantity</th>
          <th style={{ width: '20%' }}>Outsourcing To</th>
          <th style={{ width: '10%' }}>Price</th>
          <th style={{ width: '10%' }}>discount</th>
          <th style={{ width: '20%' }}>Action</th>
        </tr>
      </thead>
      <tbody>
        <TrTable toast={toast} />
        {cart.length > 0 && cart.map((item, index) => (
          <tr style={{fontSize:'12px'}} className={item.isoutsourced === 1 ? 'table-danger' : ''} key={index}>
            <td>{item.name}</td>
            <td>{item.quantity || 1}</td>
            <td>
              {item.isoutsourced === 1 && item?.label}
            </td>
            <td>{currencyFormatter.format(item.discountedValue)}</td>
            <td>{currencyFormatter.format(item.discount || 0)}</td>
            <td>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeFromCart(item.id)}
              >
                <Delete />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
