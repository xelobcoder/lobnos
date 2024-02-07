import { useRouter } from "next/navigation"
import { Dropdown } from "react-bootstrap"
import { Email, MonetizationOn, Print } from "@mui/icons-material"
import { forwardEmailReceipt } from "../Auth/customFetch"

export default function Navbar({ query, updateBill, handleChange, clearQuery, selectedBilling }) {
  const navigate = useRouter()

  return (
    <div className="d-flex justify-content-between">
      <div className="d-flex">
        <div className="form-row d-flex col-4">
          <label className="my-1">From</label>
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
        <div className="form-row d-flex col-4">
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
          clear
        </button>
      </div>
      <div>
        <div className="d-flex" style={{ marginLeft: "30px" }}>
          <button className="btn btn-primary btn-sm" onClick={updateBill}>
            update
          </button>
          <button
            startIcon={<Print />}
            className="btn btn-primary btn-sm mx-1"
            onClick={(e) => {
              navigate.push(`payment/invoice/${selectedBilling}`)
            }}>
            invoice
          </button>
          <button
            startIcon={<Email />}
            className="btn btn-primary btn-sm mx-1"
            onClick={(ev) => {
              forwardEmailReceipt(selectedBilling)
            }}>
            Email
          </button>
          <button startIcon={<MonetizationOn />} className="btn btn-primary btn-sm mx-1">
            sales summary
          </button>
        </div>
      </div>
    </div>
  )
}
