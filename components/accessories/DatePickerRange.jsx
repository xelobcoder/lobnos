import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { getDateRange } from "../Auth/customFetch";
export default function DatePickerRange({ getRange, start, end }) {
  const [dateRange, setDateRange] = useState([start, end]);
  const [startDate, endDate] = dateRange;

  return (
    <DatePicker
      selectsRange={true}
      title="tiifu"
      startDate={startDate}
      endDate={endDate}
      className="custom-input"
      onChange={(update) => {
        setDateRange(update);
        const range = getDateRange(update);
        getRange(range);
      }}
    />
  );
}
