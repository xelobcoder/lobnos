import { useEffect, useState } from 'react';
import Autocomplete from '@mui/joy/Autocomplete';

export default function PLACE_ORDER({ source, cartHandler, suppliers, editdata }) {
  const [purchaseunit, setPurchaseunit] = useState(['kg', 'g', 'litre', 'unit', 'Box', 'Bottle']);
  const defaultdata = { name: '', purchaseunit: '', quantity: '', suppliername: '' }
  const [field, setField] = useState(defaultdata);
  const [target, setTarget] = useState(0);


  const handelChange = (event, value, target) => {
    if (!value || typeof target != 'string') return;
    if (target == 'stock') {
      const { stockid, name } = value;
      setField({ ...field, stockid, name });
    };
    if (target == 'supplier') {
      const { supplierid, name } = value;
      setField({ ...field, supplierid, suppliername: name });
    }
    if (target == 'purchaseunit') {
      setField({ ...field, purchaseunit: value });
    }
    if (target == 'qty') {
      setField({ ...field, quantity: value });
    }
  }



  useEffect(() => {
    if (Object.keys(editdata).length > 0) setField(editdata);
  }, [editdata])
  
 


  const handleAddCart = (ev) => {
    ev.preventDefault();
    setTarget(0);
    const { stockid, supplierid, purchaseunit, quantity } = field;
    if (Object.keys(field).length === 0) setTarget('all');
    const empty = [stockid, supplierid, purchaseunit, quantity].findIndex((a, i) => a == 0 || a == '' || a == undefined);
    typeof empty == 'number' && empty > 0 && setTarget(empty + 1)
    if (empty == -1) {
      cartHandler(ev, field);
      setField(defaultdata);
    }
  }


  return (
    <section>
      <form>
  <table class="form-table">
    <tr>
      <td class="form-row">
        <label>Stock</label>
        <Autocomplete
          options={source}
          disableClearable={true}
          required
          getOptionLabel={(option) => option.name}
          onChange={(ev, value) => { handelChange(ev, value, 'stock') }}
          placeholder='Search stock here'
        />
        {(target == 'all' || target == 1) && <div className='text-danger text-capitalize text-sm'>Stock is required and must be field</div>}
      </td>
    </tr>
    <tr>
      <td class="form-row">
        <label>Supplier</label>
        <Autocomplete
          options={suppliers}
          required
          getOptionLabel={(option) => option.name}
          onChange={(ev, value) => { handelChange(ev, value, 'supplier') }}
          placeholder='Search supplier here'
        />
        {(target == 'all' || target == 2) && <div className='text-danger text-sm text-capitalize'>Supplier is required and must be field</div>}
      </td>
    </tr>
    <tr>
      <td class="form-row">
        <label>Purchase Unit</label>
        <Autocomplete
          options={purchaseunit}
          required
          getOptionLabel={(option) => option}
          onChange={(ev, value) => { handelChange(ev, value, 'purchaseunit') }}
          placeholder='Search purchase unit here'
        />
        {(target == 'all' || target == 3) && <div className='text-danger text-sm text-capitalize'>Unit of purchase is required and must be field</div>}
      </td>
    </tr>
    <tr>
      <td class="form-row">
        <label>Quantity</label>
        <input className='custom-input'
          value={field.quantity}
          onChange={(ev) => { handelChange(ev, ev.target.value, 'qty') }}
          required placeholder='Quantity' type='number' />
        {(target == 'all' || target == 4) && <div className='text-danger text-sm text-capitalize'>Quantity must be field</div>}
      </td>
    </tr>
    <tr>
      <td>
        <button type='button' onClick={(ev) => { handleAddCart(ev) }} className='btn btn-primary btn-sm btn-add-cart'>
          Add to Cart
        </button>
      </td>
    </tr>
  </table>
</form>
    </section>
  );
}


