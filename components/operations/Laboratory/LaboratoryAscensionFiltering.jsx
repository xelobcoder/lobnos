import React, { useEffect, useId, useRef, useState } from "react";
import { RiFilter3Line, RiFlaskLine, RiRestartLine, RiSearchLine } from "@remixicon/react";
import dayjs from "dayjs";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import DateFilterReusable from "./ResuableFilter/DateFilterReusable";
import styles from "./LaboratoryAscensionFiltering.module.css";

const searchFields = {
       ascensionid: "Ascension ID",
       patientname: "Patient name",
       patientid: "Patient ID",
       billingid: "Billing ID",
       testid: "Laboratory test",
};

const emptySearch = { ascensionid: "", patientname: "", patientid: "", billingid: "", testid: "" };

export default function LaboratoryAscensionFiltering({ ascension_stage, clinicianId, employeeid, branchid }) {
       const { queryParams, setQueryParams, _getAscensionData, hasSpecificUrlFilter, isLoading } = useLaboratoryContext();
       const [field, setField] = useState(() => Object.keys(searchFields).find(key => queryParams[key]) || "patientname");
       const [dateFilter, setDateFilter] = useState(() => {
              const today = dayjs().format("YYYY-MM-DD");
              if (queryParams._dateFrom === today && queryParams._dateEnd === today) return "Today";
              return queryParams._dateFrom || queryParams._dateEnd ? "Custom Range" : "";
       });
       const [testName, setTestName] = useState("");
       const [popupBlocked, setPopupBlocked] = useState(false);
       const popupRef = useRef(null);
       const id = useId();

       useEffect(() => {
              setQueryParams(prev => prev.clinicianId === (clinicianId || null)
                     ? prev
                     : { ...prev, clinicianId: clinicianId || null });
       }, [clinicianId, setQueryParams]);

       useEffect(() => {
              _getAscensionData(ascension_stage, employeeid, branchid, { clinicianId: clinicianId || null });
       }, [ascension_stage, employeeid, branchid, clinicianId, queryParams.page, queryParams.count]);

       const applyFilters = (filters = {}) => {
              setQueryParams(prev => ({ ...prev, ...filters, page: 1, clinicianId: clinicianId || null }));
              if (queryParams.page === 1) {
                     _getAscensionData(ascension_stage, employeeid, branchid, { ...filters, clinicianId: clinicianId || null });
              }
       };

       useEffect(() => {
              const receiveTest = event => {
                     if (event.origin !== window.location.origin || !popupRef.current || event.source !== popupRef.current ||
                            event.data?.type !== "TEST_PANEL_SELECTED") return;
                     const test = event.data.payload;
                     if (!Number.isSafeInteger(Number(test?.id)) || Number(test.id) < 1) return;
                     setTestName(String(test.name || test.testname || "Test #" + test.id));
                     applyFilters({ ...emptySearch, testid: test.id });
              };
              window.addEventListener("message", receiveTest);
              return () => window.removeEventListener("message", receiveTest);
       });

       const openTestPicker = () => {
              const query = new URLSearchParams({ employeeid, branchid });
              const popup = window.open("/labtestfilter?" + query, "LabTestFilter", "width=600,height=450,scrollbars=yes");
              popupRef.current = popup;
              setPopupBlocked(!popup);
              popup?.focus();
       };

       if (hasSpecificUrlFilter) return null;

       return (
              <form className={styles.panel} aria-labelledby={id + "-title"} onSubmit={event => {
                     event.preventDefault();
                     if (!isLoading && (field !== "testid" || queryParams.testid)) applyFilters();
              }}>
                     <div className={styles.heading}>
                            <span className={styles.icon}><RiFilter3Line size={20} aria-hidden="true" /></span>
                            <h2 id={id + "-title"}>Filter laboratory requests</h2>
                     </div>
                     <div className={styles.fields}>
                            <div className={styles.field}>
                                   <label htmlFor={id + "-field"}>Search by</label>
                                   <select id={id + "-field"} className="form-select" value={field} onChange={event => {
                                          setField(event.target.value);
                                          setTestName("");
                                          setPopupBlocked(false);
                                          setQueryParams(prev => ({ ...prev, ...emptySearch }));
                                   }}>
                                          {Object.entries(searchFields).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                   </select>
                            </div>
                            <div className={styles.field}>
                                   {field === "testid" ? <>
                                          <label htmlFor={id + "-test"}>Laboratory test</label>
                                          <button id={id + "-test"} type="button" className={"btn btn-outline-secondary " + styles.testPicker} onClick={openTestPicker}>
                                                 <RiFlaskLine size={17} aria-hidden="true" /> <span>{testName || "Choose a test"}</span>
                                          </button>
                                          {popupBlocked && <small role="status">Allow pop-ups to open the test picker.</small>}
                                   </> : <>
                                          <label htmlFor={id + "-value"}>{searchFields[field]}</label>
                                          <input id={id + "-value"} className="form-control"
                                                 inputMode={field === "patientname" ? "search" : undefined}
                                                 placeholder={field === "patientname" ? "e.g. Ama Mensah" : "Enter " + searchFields[field]}
                                                 value={queryParams[field] ?? ""}
                                                 onChange={event => setQueryParams(prev => ({ ...prev, [field]: event.target.value }))} />
                                   </>}
                            </div>
                            <div className={styles.field}>
                                   <label htmlFor={id + "-date"}>Date range</label>
                                   <DateFilterReusable id={id + "-date"} value={dateFilter} onChange={setDateFilter} className="w-100" clearOnEmpty
                                          label="Any date" startDate={queryParams._dateFrom} endDate={queryParams._dateEnd}
                                          onDateRangeChange={(_dateFrom, _dateEnd) => setQueryParams(prev => ({ ...prev, _dateFrom, _dateEnd }))} />
                            </div>
                            <div className={styles.field}>
                                   <label htmlFor={id + "-sort"}>Sort order</label>
                                   <select id={id + "-sort"} className="form-select" value={queryParams.sortby}
                                          onChange={event => setQueryParams(prev => ({ ...prev, sortby: event.target.value }))}>
                                          <option value="DESC">Newest first</option>
                                          <option value="ASC">Oldest first</option>
                                   </select>
                            </div>
                     </div>
                     <div className={styles.actions}>
                            <button type="button" className="btn btn-outline-secondary" disabled={isLoading} onClick={() => {
                                   setField("patientname");
                                   setTestName("");
                                   setPopupBlocked(false);
                                   setDateFilter("");
                                   applyFilters({ ...emptySearch, _dateFrom: "", _dateEnd: "", sortby: "DESC" });
                            }}><RiRestartLine size={16} aria-hidden="true" /> Reset</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading || (field === "testid" && !queryParams.testid)}>
                                   <RiSearchLine size={16} aria-hidden="true" /> {isLoading ? "Loading…" : "Apply filters"}
                            </button>
                     </div>
              </form>
       );
}
