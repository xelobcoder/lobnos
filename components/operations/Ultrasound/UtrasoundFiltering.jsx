import { useEffect, useState } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import DateFilterReusable from "../Laboratory/ResuableFilter/DateFilterReusable";
import { useUltrasoundContext } from "./UltrasoundContext";
import { handleDateRangeSelection } from "../Laboratory/AscensionFilteringComponent";

export default function UltrasoundAscensionFiltering({ ascension_stage, employeeid, branchid }) {
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
              _getAscensionData(ascension_stage, employeeid, {
                     ascensionid: queryParams.ascensionid,
                     patientid: queryParams.patientid,
                     billingid: queryParams.billingid,
                     [category.section]: category.value,
              });
       };


       const [category, setCategory] = useState({
              section: '', value: ''
       });
       const [dateFilter, setDateFilter] = useState("");

       useEffect(() => {
              const listener = (event) => {
                     if (event.data?.type !== "TEST_PANEL_SELECTED") {
                            return;
                     }

                     const selectedTestId = event.data.payload?.id;
                     if (!selectedTestId) {
                            return;
                     }

                     setQueryParams((prev) => ({
                            ...prev,
                            ascensionid: "",
                            patientid: "",
                            billingid: "",
                            patientname: "",
                            testid: selectedTestId,
                     }));
                     _getAscensionData(ascension_stage, employeeid, {
                            ascensionid: queryParams.ascensionid,
                            patientid: queryParams.patientid,
                            billingid: queryParams.billingid,
                            patientname: queryParams.patientname,
                            testid: selectedTestId,
                     });
              };

              window.addEventListener("message", listener);
              return () => window.removeEventListener("message", listener);
       }, [ascension_stage, employeeid, queryParams, _getAscensionData, setQueryParams]);

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

       const handleSettingCategory = (section, value) => {
              setCategory({ section, value });
              setQueryParams((prev) => ({
                     ...prev,
                     ascensionid: '',
                     patientid: '',
                     billingid: '',
                     patientname: "",
                     [section]: value,
                     _dateFrom: "",
                     _dateEnd: ""
              }));
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
                                   <DatePickerRange
                                          start={queryParams._dateFrom}
                                          end={queryParams._dateEnd}
                                          getRange={updateDateValues}
                                   />
                            </div>
                            <div className="col-12 col-lg-2">
                                   <DateFilterReusable
                                          value={dateFilter}
                                          onChange={setDateFilter}
                                          onDateRangeChange={(startDate, endDate) => {
                                                 setQueryParams((prev) => ({
                                                        ...prev,
                                                        _dateFrom: startDate,
                                                        _dateEnd: endDate
                                                 }));
                                          }}
                                          label="Filter by"
                                          className="w-100"
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
                            <div className="col-12  col-lg-2 ">
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
