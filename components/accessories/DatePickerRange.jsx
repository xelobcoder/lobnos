import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { getDateRange } from "../Auth/customFetch";
export default function DatePickerRange({ getRange, start, end,...props }) {
  const [dateRange, setDateRange] = useState([start, end]);
  const [startDate, endDate] = dateRange;

  return (
    <DatePicker 
      selectsRange={true}
      title="date range from start to date"
      startDate={startDate}
      endDate={endDate}
      className="custom-input"
      placeHolder="date range"
      onChange={(update) => {
        setDateRange(update);
        const range = getDateRange(update);
        getRange(range);
      }}
    />
  );
}
