import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { handleDateRangeSelection } from "./AscensionFilteringComponent";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { date } from "zod";

export default function LaboratoryAscensionFiltering({ ascension_stage, employeeid, branchid }) {

       const router = useRouter();
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

       const [dateFilter, setDateFilter] = useState('');


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
                                   setQueryParams((prev) => ({ ...prev, testid: event.data.payload.id }));
                                   handleSettingCategory("none", "");
                            }
                     }
              }

              window.addEventListener("message", listener)
              return () => window.removeEventListener("message", listener)
       }, [])

       useEffect(() => {
              const handleKeyDown = (event) => {
                     if (event.key === 'Enter') {
                            event.preventDefault();
                            _getAscensionData(ascension_stage, employeeid, branchid, {
                                   ascensionid: queryParams.ascensionid,
                                   patientid: queryParams.patientid,
                                   billingid: queryParams.billingid,
                                   [category.section]: category.value,
                                   testid: queryParams.testid
                            });
                     }
              };

              window.addEventListener("keydown", handleKeyDown);
              return () => window.removeEventListener("keydown", handleKeyDown);
       }, [ascension_stage, employeeid, branchid, queryParams, category]);

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

       const handleResetFilters = () => {
              // Reset all filter states
              setCategory({ section: '', value: '' });
              setDateFilter('');

              // Reset query params
              setQueryParams((prev) => ({
                     ...prev,
                     ascensionid: '',
                     patientid: '',
                     testid: '',
                     billingid: '',
                     patientname: "",
                     _dateFrom: "",
                     _dateEnd: "",
              }));

              // Clean URL by removing query string
              const pathname = window.location.pathname;
              if (window.location.search) {
                     window.history.replaceState({}, '', pathname);
                     router.replace(pathname);
              }
       };





       return (
              <div className="mb-2">
                     <div className="row g-2 align-items-end">
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
                                          <option value="DESC">Newest data first </option>
                                          <option value="ASC">Oldest data first</option>
                                   </select>
                            </div>
                            <div className="col-12 col-lg-2 d-flex gap-2">
                                   <button
                                          onClick={() => _getAscensionData(ascension_stage, employeeid, branchid, {
                                                 ascensionid: queryParams.ascensionid,
                                                 patientid: queryParams.patientid,
                                                 billingid: queryParams.billingid,
                                                 [category.section]: category.value,
                                                 grouped: queryParams.grouped ||
                                                        "grouped",
                                                 testid: queryParams.testid
                                          })}
                                          className="btn btn-primary flex-grow-1 text-uppercase"
                                          title="Press Enter key anywhere on the page to load data"
                                   >
                                          Load Data
                                   </button>
                                   <button
                                          onClick={handleResetFilters}
                                          className="btn btn-danger flex-grow-1 text-uppercase fw-bold"
                                          title="Clear all filters and URL query string"
                                   >
                                          🔄 Reset
                                   </button>
                            </div>
                     </div>
                     <div className="mt-2">
                            <small className="text-muted">
                                   <span className="badge badge-info">💡 Tip:</span> Press <kbd>Enter</kbd> key anywhere on this page to load data with your filters
                            </small>
                     </div>
              </div>
       );
}
