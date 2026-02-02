import { useEffect } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useUltrasoundContext } from "./UltrasoundContext";
import { handleDateRangeSelection } from "../Laboratory/AscensionFilteringComponent";

export default function UltrasoundAscensionFiltering({ ascension_stage, employeeid }) {
       const { queryParams, setQueryParams, _getAscensionData, loadCounter, setLoadCounter } =
              useUltrasoundContext();

       useEffect(() => {
              _getAscensionData(ascension_stage, employeeid, queryParams);
              setLoadCounter(loadCounter + 1);
       }, []);

       useEffect(() => {
              if (loadCounter > 0) {
                     _getAscensionData(ascension_stage, employeeid, queryParams);
              }
       }, [queryParams.page, queryParams.count]);

       const updateDateValues = (values) => {
              const [start, end] = values;
              setQueryParams((prev) => ({ ...prev, _dateFrom: start, _dateEnd: end }));
       };

       const handleLoadData = () => {
              _getAscensionData(ascension_stage, employeeid, queryParams);
       };

       return (
              <div className="container-fluid py-2">
                   <div className="row g-2 align-items-center">
                       <div className="col-12 col-md-2 me-2 ">
                            <select
                                   className="form-select"
                                   value={queryParams.status}
                                   onChange={(ev) => {
                                          handleDateRangeSelection(ev.target.value, setQueryParams);
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
                     <div className="col-12 col-lg-2 mb-2 mb-lg-0">
                            <DatePickerRange
                                   start={queryParams._dateFrom}
                                   end={queryParams._dateEnd}
                                   getRange={updateDateValues}
                            />
                     </div>
                     <div className="col-12 mx-lg-2 col-lg-5 mb-2 mb-lg-0">
                            <input
                                   className="custom-input p-3"
                                   value={queryParams.searchString || ""}
                                   onChange={(ev) => {
                                          setQueryParams({ ...queryParams, searchString: ev.target.value });
                                   }}
                                   placeholder="Type in your search here"
                            />
                     </div>
                     <div className="col-12 mx-lg-2 col-lg-2 d-flex justify-content-center justify-content-lg-start">
                            <button
                                   onClick={handleLoadData}
                                   className="btn btn-primary btn-sm p-2 px-5 text-uppercase"
                            >
                                   {"<"} Load Data {"/>"}
                            </button>
                     </div>
                   </div>
              </div>
       );
}
