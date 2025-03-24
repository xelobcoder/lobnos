import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { getDateRange } from "../../Lib/fetcher";
import "../../node_modules/react-toastify/dist/ReactToastify.min.css"
export default function DatePickerRange({ getRange, start, end, ...props }) {
    const [dateRange, setDateRange] = useState([start, end]);
    const [startDate, endDate] = dateRange;

    return (
        <DatePicker
            selectsRange={true}
            title="date range from start to date"
            startDate={startDate}
            endDate={endDate}
            className="custom-input"
            placeholderText="date range"
            onChange={(update) => {
                setDateRange(update);
                const range = getDateRange(update);
                getRange(range);
            }}
            {...props}
        />

    );
}
