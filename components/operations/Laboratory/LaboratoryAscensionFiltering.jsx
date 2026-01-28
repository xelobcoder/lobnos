import { useEffect } from "react";
import DatePickerRange from "../../../components/accessories/DatePickerRange";
import { useLaboratoryContext } from "./LaboratoryStagesContext";

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



       const getCurrentYear = () => {
              const currentDate = new Date();
              const currentYear = currentDate.getFullYear();
              return { startdate: '' + currentYear + '-01-01', enddate: '' + currentYear + '-12-31' };
       }



       const getThisWeekDateRange = () => {
              const currentDate = new Date();
              const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
              const lastDayOfWeek = new Date(currentDate.setDate(firstDayOfWeek.getDate() + 6));
              return { startdate: firstDayOfWeek.toISOString().split('T')[0], enddate: lastDayOfWeek.toISOString().split('T')[0] };
       }


       const getThisMonthDateRange = () => {
              const currentDate = new Date();
              const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
              return { startdate: firstDayOfMonth.toISOString().split('T')[0], enddate: lastDayOfMonth.toISOString().split('T')[0] };
       }
       const getTodayDateRange = () => {
              const currentDate = new Date();
              const todayDate = currentDate.toISOString().split('T')[0];
              return { startdate: todayDate, enddate: todayDate };
       }


       const handleDateRangeSelection = (value) => {
              if (value === 'This Year') {
                     const { startdate, enddate } = getCurrentYear();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'This Week') {
                     const { startdate, enddate } = getThisWeekDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'This Month') {
                     const { startdate, enddate } = getThisMonthDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'Today') {
                     const { startdate, enddate } = getTodayDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'All') {
                     setQueryParams((prev) => ({ ...prev, _dateFrom: null, _dateEnd: null }));
              } else if (value === 'last 30 Days') {
                     const { startdate, enddate } = last30DaysDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'last week') {
                     const { startdate, enddate } = getLastWeekDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'last 7 days from now') {
                     const { startdate, enddate } = getLast7DaysDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'last month') {
                     const { startdate, enddate } = getLastMonthDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'Yesterday') {
                     const { startdate, enddate } = YesterdayDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'this quarter') {
                     const { startdate, enddate } = lastQuarterDateRange();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              } else if (value === 'last Year') {
                     const { startdate, enddate } = lastYear();
                     setQueryParams((prev) => ({ ...prev, _dateFrom: startdate, _dateEnd: enddate }));
              }
               else {
                     setQueryParams((prev) => ({ ...prev, _dateFrom: null, _dateEnd: null }));
              }
       }


       const last30DaysDateRange = () => {
              const currentDate = new Date();
              const pastDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
              return { startdate: pastDate.toISOString().split('T')[0], enddate: new Date().toISOString().split('T')[0] };
       }

       const getLast7DaysDateRange = () => {
              const currentDate = new Date();
              const pastDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
              return { startdate: pastDate.toISOString().split('T')[0], enddate: new Date().toISOString().split('T')[0] };
       }

       const getLastWeekDateRange = () => {
              const currentDate = new Date();
              const firstDayOfLastWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 6));
              const lastDayOfLastWeek = new Date(currentDate.setDate(firstDayOfLastWeek.getDate() + 6));
              return { startdate: firstDayOfLastWeek.toISOString().split('T')[0], enddate: lastDayOfLastWeek.toISOString().split('T')[0] };
       }
       const getLastMonthDateRange = () => {
              const currentDate = new Date();
              const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
              const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
              return { startdate: firstDayOfLastMonth.toISOString().split('T')[0], enddate: lastDayOfLastMonth.toISOString().split('T')[0] };
       }

       const YesterdayDateRange = () => {
              const currentDate = new Date();
              const yesterdayDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
              const formattedDate = yesterdayDate.toISOString().split('T')[0];
              return { startdate: formattedDate, enddate: formattedDate };
       }


       const lastQuarterDateRange = () => {
              const currentDate = new Date();
              const currentMonth = currentDate.getMonth();
              const quarterStartMonth = currentMonth - (currentMonth % 3);
              const quarterEndMonth = quarterStartMonth + 2;
              const firstDayOfQuarter = new Date(currentDate.getFullYear(), quarterStartMonth, 1);
              const lastDayOfQuarter = new Date(currentDate.getFullYear(), quarterEndMonth + 1, 0);
              return { startdate: firstDayOfQuarter.toISOString().split('T')[0], enddate: lastDayOfQuarter.toISOString().split('T')[0] };
       }


       const lastYear = () => {
              const currentDate = new Date();
              const lastYear = currentDate.getFullYear() - 1;
              return { startdate: '' + lastYear + '-01-01', enddate: '' + lastYear + '-12-31' };
       }




       return (
              <div className="container-fluid py-2">
                     <div className="row g-2 align-items-center">
                            <div className="col-12 col-md-2">
                                   <select
                                          className="form-select"
                                          value={queryParams.status}
                                          onChange={(ev) => {
                                                 handleDateRangeSelection(ev.target.value);
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
