import React, { useCallback, useEffect, useState } from "react";

export default function TrendSingleList({ dataSet, parameters }) {
  const [displayData, setDisplayData] = useState([]);
  const { date, billingid, data } = dataSet;

  const filtAndDisplay = useCallback(async (parameters, data) => {
    const xxi = parameters.map((item, index) => {
      const filtered = data.filter((u, t) => {
        return u.parameter == item;
      });
      return filtered.length > 0
        ? filtered[0]
        : { upper: null, lower: null, value: "Nil" };
    });
    setDisplayData(xxi);
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
              className={
                parseInt(value) > parseInt(upper) ||
                parseInt(value) < parseInt(lower) 
                  ? "light-x-trend text-danger"
                  : value == 'Nil' ? '' : "light-x-trend text-success"
              }
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
