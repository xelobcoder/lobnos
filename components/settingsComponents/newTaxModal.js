import { useEffect, useState } from 'react'
import { customPost, handleChangeWithState } from '../Auth/customFetch';

export default function Application_Tax_Inclusion({ isEdit, editdata }) {
  const defaultx = { name: '', value: '' }
  const [tax, setTax] = useState(defaultx);

  const handleSubmit = async () => {
    if (tax.name && tax.value) {
      try {
        const pushResponse = await customPost('application/tax', 'POST', tax)
        const { status, statusCode, message } = pushResponse;
        if (status === 'success' && statusCode == 200) {
          setTax(defaultx);
        }
        alert(message);
      } catch (err) {
        console.log(err)
      }
    } else alert ('all fields required')
  }

  useEffect(() => {
    if (isEdit === true && Object.keys(editdata).length > 0) setTax(editdata);
  }, [isEdit, editdata])
  return (
    <div className="card">
      <div className="card-header p-0  bg-secondary text-white">
        <h5 className="mx-2 mt-1">Add new tax</h5>
      </div>
      <div className="card-body">
        <form className="d-flex">
          <div className="form-row col-5">
            <label className="text-primary">Tax name</label>
            <input
              className="custom-input"
              onChange={(ev) => {
                handleChangeWithState(ev, "name", setTax, tax)
              }}
              value={tax.name}
              placeholder="eg.VAT"
              type="text"
            />
          </div>
          <div className="form-row mx-2">
            <label className="text-primary">
              Tax <span className="label-helper">(All values should be in percentage)</span>
            </label>
            <input
              type="number"
              placeholder="10%"
              onChange={(ev) => {
                handleChangeWithState(ev, "value", setTax, tax)
              }}
              value={tax.value}
              className="custom-input"
            />
          </div>
          <div className="mt-1">
            <button type="button" onClick={handleSubmit} className="btn btn-success btn-sm mt-3">
              save info
            </button>
            <button
              onClick={(ev) => {
                setTax(defaultx)
              }}
              type="button"
              className="btn mx-2 btn-danger btn-sm mt-3">
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
