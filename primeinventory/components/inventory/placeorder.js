import { useEffect, useState } from 'react';
import Select from 'react-select';

export default function PLACE_ORDER({ source, cartHandler, suppliers, editdata, cart }) {
  const purchaseunit = ['kg', 'g', 'litre', 'unit', 'Box', 'Bottle'];
  const defaultdata = { name: '', purchaseunit: '', quantity: '', suppliername: '' }
  const [field, setField] = useState(defaultdata);
  const [target, setTarget] = useState(0);

  const handleChange = (value, target) => {
    if (!value || typeof target != 'string') return;
    if (target === 'stock') {
      const { stockid, name } = value;
      setField({ ...field, stockid, name });
    }
    if (target === 'supplier') {
      const { supplierid, name } = value;
      setField({ ...field, supplierid, suppliername: name });
    }
    if (target === 'purchaseunit') {
      setField({ ...field, purchaseunit: value });
    }
    if (target === 'qty') {
      setField({ ...field, quantity: value });
    }
  }

  useEffect(() => {
    if (Object.keys(editdata).length > 0) setField(editdata);
  }, [editdata]);

  const handleAddCart = (ev) => {
    ev.preventDefault();
    setTarget(0);
    const { stockid, supplierid, purchaseunit, quantity } = field;
    if (Object.keys(field).length === 0) setTarget('all');
    const empty = [stockid, supplierid, purchaseunit, quantity].findIndex((a, i) => a == 0 || a == '' || a == undefined);
    typeof empty === 'number' && empty > 0 && setTarget(empty + 1);
    if (empty === -1) {
      cartHandler(ev, field);
      setField(defaultdata);
    }
  }

  return (
    <section>
      <form style={{ height: cart.length == 0 ? '500px' : "" }}>
        <table className="table table-responsive table-secondary">
          <thead>
            <tr>
              <th>
                <label>Stock</label>
                <Select
                  className='custom-autocomplete'
                  options={source}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.stockid}
                  value={source.find(option => option.stockid === field.stockid)}
                  onChange={(value) => handleChange(value, 'stock')}
                  placeholder='Search stock here'
                  isClearable
                />
                {(target === 'all' || target === 1) && <div className='text-danger text-capitalize text-sm'>Stock is required and must be filled</div>}
              </th>
              <th>
                <label>Supplier</label>
                <Select
                  className='custom-autocomplete'
                  options={suppliers}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.supplierid}
                  value={suppliers.find(option => option.supplierid === field.supplierid)}
                  onChange={(value) => handleChange(value, 'supplier')}
                  placeholder='Search supplier here'
                  isClearable
                />
                {(target === 'all' || target === 2) && <div className='text-danger text-sm text-capitalize'>Supplier is required and must be filled</div>}
              </th>
              <th>
                <label>Purchase Unit</label>
                <Select
                  className='custom-autocomplete'
                  options={purchaseunit.map(unit => ({ label: unit, value: unit }))}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  value={{ label: field.purchaseunit, value: field.purchaseunit }}
                  onChange={(value) => handleChange(value.value, 'purchaseunit')}
                  placeholder='Search purchase unit here'
                  isClearable
                />
                {(target === 'all' || target === 3) && <div className='text-danger text-sm text-capitalize'>Unit of purchase is required and must be filled</div>}
              </th>
              <th>
                <label>Quantity</label>
                <input className='custom-input' style={{height:37}}
                  value={field.quantity}
                  onChange={(ev) => handleChange(ev.target.value, 'qty')}
                  required placeholder='Quantity' type='number' />
                {(target === 'all' || target === 4) && <div className='text-danger text-sm text-capitalize'>Quantity must be filled</div>}
              </th>
              <th>
                <button type='button' onClick={handleAddCart} className='btn btn-primary btn-add-cart'>
                  Add to Cart
                </button>
              </th>
            </tr>
          </thead>
        </table>
      </form>
    </section>
  );
}
