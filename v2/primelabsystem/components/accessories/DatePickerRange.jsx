import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { getDateRange } from "../Auth/customFetch";
import { CalendarMonth } from "@mui/icons-material";
export default function
  DatePickerRange({ getRange, start, end, ...props }) {
  const [dateRange, setDateRange] = useState([start, end]);
  const [startDate, endDate] = dateRange;



  

  return (
    <DatePicker
      icon={<CalendarMonth fontSize="sm" />}
      selectsRange={true}
      title="date range from start to date"
      startDate={startDate}
      isClearable
      withPortal
      endDate={endDate}
      className="custom-input  col-sm-12"
      showIcon={false}
      placeholderText="Please Pick A Date Range Here"
      onChange={(update) => {
        setDateRange(update);
        const range = getDateRange(update);
        getRange(range);
      }}
    />
  );
}
