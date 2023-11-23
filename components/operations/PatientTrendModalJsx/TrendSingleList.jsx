import React, { useCallback, useEffect, useState } from "react";
import { filterTrendData } from "../../Auth/customFetch";

export default function TrendSingleList({ dataSet, parameters }) {
  const [displayData, setDisplayData] = useState([]);
  const { date, billingid, data } = dataSet;

  const filtAndDisplay = useCallback(async function (parameters, data) {
    const filteredData = await filterTrendData(parameters, data);
    setDisplayData(filteredData);
  }, []);

  useEffect(() => {
    filtAndDisplay(parameters, data);
  }, []);

  return (
    <tbody>
      <tr className="d-flex flex-column">
        <td>{new Date(date).toLocaleDateString()} { new Date(date).toLocaleTimeString()}</td>
        {displayData.map((item, index) => {
          const { upper, lower, unit, value } = item;
          return (
            <td
              // className={
              //   parseInt(value) > parseInt(upper) ||
              //   parseInt(value) < parseInt(lower) 
              //     ? "light-x-trend text-danger"
              //     : value == 'Nil' ? '' : "light-x-trend text-success"
              // }
              key={index} 
            >
              {value} {unit ? `(${unit})` : ''}
            </td>
          );
        })}
      </tr>
    </tbody>
  );
}
