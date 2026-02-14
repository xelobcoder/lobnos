import { useEffect, useState } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { handleDateRangeSelection } from "./AscensionFilteringComponent";
import { date } from "zod";

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


       const [category, setCategory] = useState({
              section: '', value: ''
       });


       const handleSettingCategory = (section, value) => {
              setCategory({ section, value });
              setQueryParams((prev) => ({
                     ...prev,
                     ascensionid: '',
                     patientid: '',
                     testid: '',
                     billingid: '',
                     patientname: "",
                     [section]: value,
                     _dateFrom: "",
                     _dateEnd: "",
              }));
       }

       useEffect(() => {
              const listener = (event) => {
                     if (event.data?.type === "TEST_PANEL_SELECTED") {
                            if (event.data.payload && event.data.payload.id) {
                                   // handleSettingCategory("testid", event.data.payload.id);
                                   _getAscensionData(ascension_stage, employeeid, branchid, {
                                          ascensionid: queryParams.ascensionid,
                                          patientid: queryParams.patientid,
                                          billingid: queryParams.billingid,
                                          [category.section]: category.value,
                                          testid: event.data.payload.id
                                   })
                                   handleSettingCategory("none", "");
                            }
                     }
              }

              window.addEventListener("message", listener)
              return () => window.removeEventListener("message", listener)
       }, [])

       const handleFilterByLabTest = () => {
              const popup = window.open(
                     `/labtestfilter?employeeid=${employeeid}&&branchid=${branchid}`,
                     "LabTestFilter",
                     "width=600,height=450,resizable=no,scrollbars=yes"
              )

              if (popup) {
                     popup.focus()
              }
       }





       return (
              <div className="mb-2">
                     <div className="row g-2 align-items-center">
                            <div className="col-12 col-lg-2">
                                   <select onChange={(ev) => {
                                          if (ev.target.value == "none") {
                                                 handleSettingCategory("none", "");
                                          } else {
                                                 setCategory({ section: ev.target.value, value: '' });
                                                 if (ev.target.value == "testname") {
                                                        handleFilterByLabTest(ev.target.value);
                                                 }
                                          }

                                   }} className="form-select ">
                                          <option value="none">Filter By</option>
                                          <option value="ascensionid">Ascension ID</option>
                                          <option value="patientname">Patient Name</option>
                                          <option value="patientid">Patient ID</option>
                                          <option value="billingid">Billing ID</option>
                                          <option value="testname">Laboratory Test</option>
                                   </select>
                            </div>
                            <div className="col-12 col-lg-2">
                                   <input className="form-control "
                                          value={category.value}
                                          onChange={(ev) => {
                                                 handleSettingCategory(category.section, ev.target.value);

                                          }}
                                          placeholder="Enter Value to Filter" />
                            </div>
                            <div className="col-12 col-lg-2">
                                   <select
                                          className="form-select"
                                          value={queryParams.status}
                                          onChange={(ev) => {
                                                 handleDateRangeSelection(ev.target.value, setQueryParams);
                                          }}
                                   >
                                          <option value="">Filter by</option>
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
                            <div className="col-12 col-lg-2">
                                   <DatePickerRange
                                          start={queryParams._dateFrom}
                                          end={queryParams._dateEnd}
                                          getRange={updateDateValues}
                                   />
                            </div>
                            <div className="col-12 col-lg-2">
                                   <select
                                          className="form-select "
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
                            <div className="col-12 col-lg-2">
                                   <button
                                          onClick={() => _getAscensionData(ascension_stage, employeeid, branchid, {
                                                 ascensionid: queryParams.ascensionid,
                                                 patientid: queryParams.patientid,
                                                 billingid: queryParams.billingid,
                                                 [category.section]: category.value,
                                                 testid: queryParams.testid
                                          })}
                                          className="btn btn-primary btn-sm w-100 text-uppercase"
                                   >
                                          Load Data
                                   </button>
                            </div>
                     </div>
              </div>
       );
}
