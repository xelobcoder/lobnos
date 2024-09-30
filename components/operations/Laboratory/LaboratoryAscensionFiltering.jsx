import DatePickerRange from "../../../components/accessories/DatePickerRange";
export default function LaboratoryAscensionFiltering({ queryParams, setSearchString, searchString, getAscensionData, updateDateValues }) {
       return (
              <div className="container-fluid  d-lg-flex my-2">
                     <div className="col-12-sm ">
                            <DatePickerRange
                                   start={queryParams._dateFrom}
                                   end={queryParams._dateEnd}
                                   getRange={updateDateValues}
                            />
                     </div>
                     <div className="col-6  mx-3">
                            <input className="form-control p-3"
                                   value={searchString}
                                   onChange={(ev) => { setSearchString(ev.target.value) }}
                                   placeholder="type in your search here " />
                     </div>
                     <div className="mx-3 ">
                            <button onClick={(ev) => { getAscensionData() }} className="btn btn-primary btn-sm  p-3 px-5 text-uppercase">
                                   {"<"}Load Data{"/>"}
                            </button>
                     </div>
              </div>
       )
}