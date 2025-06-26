import { useEffect } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useUltrasoundContext } from "./UltrasoundContext";

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
              <div className="container-fluid d-lg-flex p-2 pls-color">
                     <div className="col-12 col-lg-2 mb-2 mb-lg-0">
                            <DatePickerRange
                                   start={queryParams._dateFrom}
                                   end={queryParams._dateEnd}
                                   getRange={updateDateValues}
                            />
                     </div>
                     <div className="col-12 mx-lg-2 col-lg-7 mb-2 mb-lg-0">
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
       );
}
