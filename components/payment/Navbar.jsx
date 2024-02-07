import { useRouter } from "next/navigation"
import { Email, MonetizationOn, Print } from "@mui/icons-material"
import { forwardEmailReceipt } from "../Auth/customFetch"

export default function Navbar({ query, updateBill, handleChange, clearQuery, selectedBilling }) {
  const navigate = useRouter()

  return (
    <div className="grid-70-30">
      <div className="d-flex">
        <div className="form-row d-flex col-3">
          <label className="my-1 mx-2">From</label>
          <input
            className="custom-input mx-2"
            type="date"
            placeholder="date"
            value={query.from}
            onChange={(e) => {
              handleChange(e, "from")
            }}
          />
        </div>
        <div className="form-row d-flex col-3">
          <label className="my-1">To</label>
          <input
            className="custom-input mx-2"
            type="date"
            placeholder="date"
            value={query.to}
            onChange={(e) => {
              handleChange(e, "to")
            }}
          />
        </div>
        <input
          className="custom-input col-3 mx-2"
          value={query.patientid}
          onChange={(e) => {
            handleChange(e, "patientid")
          }}
          placeholder="Enter clientid here"
          type="number"
        />
        <button className="btn btn-danger btn-sm py-0" onClick={clearQuery}>
          clear fields
        </button>
      </div>
      <div>
        <div className="d-flex justify-content-end">
          {/* <button className="btn btn-primary btn-sm" onClick={updateBill}>
            update
          </button>
          <button
            startIcon={<Print />}
            className="btn btn-primary btn-sm mx-1"
            onClick={(e) => {
              navigate.push(`payment/invoice/${selectedBilling}`)
            }}>
            invoice
          </button> */}
          {/* <button
            startIcon={<Email />}
            className="btn btn-primary btn-sm mx-1"
            onClick={(ev) => {
              forwardEmailReceipt(selectedBilling)
            }}>
            Email
          </button> */}
          <button startIcon={<MonetizationOn />} className="btn btn-primary btn-sm mx-1">
            sales summary
          </button>
        </div>
      </div>
    </div>
  )
}
