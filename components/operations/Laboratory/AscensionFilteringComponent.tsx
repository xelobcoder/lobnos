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


export const handleDateRangeSelection = <T extends {_dateFrom?: string | null; _dateEnd?: string | null}>(value: string, setQueryParams: React.Dispatch<React.SetStateAction<T>>) => {
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

