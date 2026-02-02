import { useEffect } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { handleDateRangeSelection } from "./AscensionFilteringComponent";

export default function LaboratoryAscensionFiltering({ ascension_stage, employeeid, branchid }) {

       const {
              queryParams,
              setQueryParams,
              _getAscensionData,
              loadCounter,
              setLoadCounter,
       } = useLaboratoryContext();



       useEffect(() => {
              _getAscensionData(ascension_stage, employeeid, branchid);
              setLoadCounter((prev) => prev + 1);
       }, [ascension_stage, employeeid]);

       useEffect(() => {
              if (loadCounter > 0) {
                     _getAscensionData(ascension_stage, employeeid, branchid);
              }
       }, [queryParams.page, queryParams.count, ascension_stage, employeeid]);

       const updateDateValues = (values) => {
              const [start, end] = values;
              setQueryParams((prev) => ({ ...prev, _dateFrom: start, _dateEnd: end }));
       };



      


       return (
              <div className="container-fluid py-2">
                     <div className="row g-2 align-items-center">
                            <div className="col-12 col-md-2">
                                   <select
                                          className="form-select"
                                          value={queryParams.status}
                                          onChange={(ev) => {
                                                 handleDateRangeSelection(ev.target.value,setQueryParams);
                                          }}
                                   >
                                          <option value="">Filter by  </option>
                                          <option value='Today'>Today</option>
                                          <option value='Yesterday'>Yesterday</option>
                                          <option value='This Week'>This Week</option>
                                          <option value='last week'>Last Week</option>
                                          <option value='This Month'>This Month</option>
                                          <option value='This Year'>This Year</option>
                                          <option value='last Year'>Last Year</option>
                                          <option value='last 30 Days'>Last 30 Days</option>
                                          <option value='this quarter'>This Quarter</option>
                                          <option value='last 7 days from now'>Last 7 Days</option>
                                          <option value='last month'>Last Month</option>
                                          <option value='All'>All</option>
                                   </select>
                            </div>
                            <div className="col-12 col-md-2">
                                   <DatePickerRange
                                          start={queryParams._dateFrom}
                                          end={queryParams._dateEnd}
                                          getRange={updateDateValues}
                                   />
                            </div>
                            <div className="col-12 col-md-4">
                                   <input
                                          className="form-control"
                                          value={queryParams.searchString}
                                          onChange={(ev) =>
                                                 setQueryParams((prev) => ({
                                                        ...prev,
                                                        searchString: ev.target.value,
                                                 }))
                                          }
                                          placeholder="Type in your search here"
                                   />
                            </div>
                            <div className="col-12 col-md-2">
                                   <select
                                          className="form-select form-select-sm"
                                          value={queryParams.sortby}
                                          onChange={(ev) =>
                                                 setQueryParams((prev) => ({
                                                        ...prev,
                                                        sortby: ev.target.value,
                                                 }))
                                          }
                                   >
                                          <option value="DESC">Sort by Date (Newest First)</option>
                                          <option value="ASC">Sort by Date (Oldest First)</option>
                                   </select>
                            </div>
                            <div className="col-12 col-md-2 d-flex justify-content-md-start justify-content-center">
                                   <button
                                          onClick={() => _getAscensionData(ascension_stage, employeeid, branchid)}
                                          className="btn btn-primary btn-sm w-100 text-uppercase"
                                   >
                                          {"<"} Load Data {"/>"}
                                   </button>
                            </div>
                     </div>
              </div>
       );
}
