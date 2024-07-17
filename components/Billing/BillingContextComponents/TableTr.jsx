import Select from "react-select";
import Add from "../../icons/PlusOutlineSvg";
import { currencyFormatter } from "../../Auth/customFetch";
import { useContext, useEffect, useState } from "react";
import { BillingContext } from "./BillingContext";

export default function TrTable({ item, Kndex }) {
  const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
  const [selected, setSelected] = useState(null);
  const { cart } = billingdata;

  const addtoCart = async () => {
    if (!selected) return;
    const testid = selected?.id;
    if (cart.length === 0) {
      updateBilling({ ...billingdata, cart: [...billingdata.cart, selected] });
    } else {
      updateBilling((prev) => {
        const { cart } = prev;
        const isInCart = cart.some((item, index) => parseInt(item?.id) == parseInt(testid));
        if (!isInCart) {
          return { ...prev, cart: [...cart, selected] };
        } else return prev;
      });
    }
  };

  useEffect(() => {
    if (cart.length >= 0) {
      recalculateTotalBill(billingdata);
    }
    console.log("j");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const emptyCart = () => {
    setCart([]);
    setSelected("");
  };
  const removeFromCart = (ev, value) => {
    if (!value) return;
    setCart((prev) => {
      return prev.filter((item, index) => item?.id !== value?.id);
    });
  };

  console.log(billingdata);
  return (
    <tr style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%" }}>
      <td>
        <Select
          className=""
          options={billingdata.testpanels}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
          placeholder="search test here please"
          onChange={(newValue) => {
            setSelected(newValue);
          }}
        />
      </td>
      <td>
        <input disabled value={1} className="custom-input" />
      </td>
      <td>{currencyFormatter.format(item ? item.price : 0)}</td>
      <td>
        <button
          onClick={(ev) => {
            addtoCart();
          }}
          className="btn btn-secondary">
          <Add />
        </button>
      </td>
    </tr>
  );
}
