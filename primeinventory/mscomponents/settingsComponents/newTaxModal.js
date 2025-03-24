import { handleChangeWithState } from '../Auth/customFetch';

export default function Application_Tax_Inclusion({ handleSubmit, stopedit, setTax, tax }) {

  return (
    <div className="card mt-2 mx-2">
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
            <button type="button" onClick={(ev) => { handleSubmit() }} className="btn btn-primary btn-sm mt-3">
              save info
            </button>
            <button
              onClick={(ev) => { stopedit(); }}
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
