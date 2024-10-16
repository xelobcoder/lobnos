import { useEffect } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useUltrasoundContext } from "./UltrasoundContext";


export default function UltrasoundAscensionFiltering({ ascension_stage }) {
       const { queryParams, setQueryParams, _getAscensionData, canLoadPage, loadCounter, setLoadCounter, } = useUltrasoundContext();


       useEffect(() => {
              _getAscensionData(ascension_stage);
              setLoadCounter(loadCounter + 1);
       }, [])



       useEffect(() => {
              if (loadCounter > 0) {
                     _getAscensionData(ascension_stage)
              }
       }, [queryParams.page, queryParams.count])





       const updateDateValues = (values) => {
              const [start, end] = values;
              setQueryParams(prev => ({ ...prev, _dateFrom: start, _dateEnd: end }));
       };



       return (
              <div className="container-fluid d-lg-flex my-2">
                     <div className="col-12-sm ">
                            <DatePickerRange
                                   start={queryParams._dateFrom}
                                   end={queryParams._dateEnd}
                                   getRange={updateDateValues}
                            />
                     </div>
                     <div className="col-8 mx-3">
                            <input
                                   className="form-control p-3"
                                   value={queryParams.searchString}
                                   onChange={(ev) => { setQueryParams({ ...queryParams, searchString: ev.target.value }) }}
                                   placeholder="type in your search here "
                            />
                     </div>
                     <div className="mx-3 ">
                            <button onClick={(ev) => { _getAscensionData(ascension_stage) }} className="btn btn-primary btn-sm p-3 px-5 text-uppercase">
                                   {"<"}Load Data{"/>"}
                            </button>
                     </div>
              </div>
       );
}
