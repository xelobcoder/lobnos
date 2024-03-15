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
      <div className='card my-2'>
        <div className='card-header bg-secondary text-white'>
          <h4>Stock Purchase</h4>
        </div>
        <div className='card-body'>
          <form className='grid-50 grid'>
            <div className='form-row'>
              <label>stock</label>
              <Autocomplete
                options={source}
                inputValue={field.name}
                disableClearable={true}
                required
                getOptionLabel={(option) => option.name}
                onChange={(ev, value) => { handelChange(ev, value, 'stock') }}
                placeholder='search stock here'
              />
              {(target == 'all' || target == 1) && <div className='text-danger text-capitalize text-sm mx-2'>stock is required and must be field</div>}
            </div>

            <div className='form-row'>
              <label>supplier</label>
              <Autocomplete
                options={suppliers}
                inputValue={field.suppliername}
                required
                getOptionLabel={(option) => option.name}
                onChange={(ev, value) => { handelChange(ev, value, 'supplier') }}
                placeholder='search supplier here'
              />
              {(target == 'all' || target == 2) && <div className='text-danger text-sm mx-2 text-capitalize'>supplier is required and must be field</div>}
            </div>

            <div className='form-row'>
              <label>purchase unit</label>
              <Autocomplete
                options={purchaseunit}
                required
                inputValue={field.purchaseunit}
                getOptionLabel={(option) => option}
                onChange={(ev, value) => { handelChange(ev, value, 'purchaseunit') }}
                placeholder='search supplier here'
              />
              {(target == 'all' || target == 3) && <div className='text-danger text-sm mx-2 text-capitalize'>unit of purchase is required and must be field</div>}

            </div>
            <div className='form-row'>
              <label>quantity</label>
              <input className='custom-input'
                value={field.quantity}
                onChange={(ev) => { handelChange(ev, ev.target.value, 'qty') }}
                required placeholder='quantity' type='number' />
              {(target == 'all' || target == 4) && <div className='text-danger text-sm mx-2 text-capitalize'>quantity must be field</div>}
            </div>
            <div>
              <button type='button' onClick={(ev) => { handleAddCart(ev) }} className='btn btn-primary btn-sm' style={{ padding: '6px' }}>
                Add to Cart
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


