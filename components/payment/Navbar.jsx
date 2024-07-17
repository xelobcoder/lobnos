export default function Navbar({ query, handleChange, clearQuery }) {

  return (
    <div className="grid-70-30">
      <div className="d-flex">
        <div className="form-row d-flex col-3">
          {/* <label className="my-1 mx-2">From</label> */}
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
          {/* <label className="my-1">To</label> */}
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
        <button className="btn btn-outline-secondary btn-sm py-0" onClick={clearQuery}>
          clear fields
        </button>
      </div>
    </div>
  )
}
