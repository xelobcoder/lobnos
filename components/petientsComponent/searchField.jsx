import {useState } from "react"
import BillingDatesView from "./BillingDatesView"

export default function SearchFieldPatients({ updatesearchValue,updateSelection}) {
  const [query, searchQuery] = useState("")
  const [isSearch, setSearch] = useState(false)



  return (
    <div>
      <div className="d-flex justify-content-around">
        <input
          value={query}
          className="custom-input"
          placeholder="Please enter Patient membership code"
          type="number"
          maxLength={20}
          minLength={14}
          onChange={(ev) => {
            searchQuery(ev.target.value)
            updatesearchValue(ev)
          }}
        />
        <button
          className="btn btn-dark btn-sm"
          style={{ marginLeft: "4px" }}
          onClick={(e) => {
            setSearch(true);
            console.log(query)
          }}>
          search
        </button>
      </div>
      <span className="text-capitalize text-dark lead">
        Transactions 
      </span>
      <BillingDatesView patientid={parseInt(query)} isSearch={isSearch} updateselection={updateSelection} />
    </div>
  )
}
