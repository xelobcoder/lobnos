import React, { useCallback, useEffect, useState } from "react";
import { LineChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart } from "recharts";

export default function PatientTrendChart({ data, parameters, chart }) {
  const [trenddata, setTrendData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      let chartdata = [];
      parameters.map((item, index) => {
        data.map((trend, key) => {
          const { billingid, data, date } = trend;
          const filteredparam = data.filter((params) => item == params?.parameter);
          // if chartdata is empty then add first data
          const dataset = { parameter: item, data: filteredparam[0]?.value, date: new Date(date).toLocaleDateString() };
          if (chartdata.length === 0) {
            chartdata.push({ parameter: item, data: [dataset] });
          } else {
            // check if paramerter is already added or not
            const isParamExist = chartdata.find((param) => param?.parameter === item);
            if (isParamExist) {
              const index = chartdata.findIndex((param) => param?.parameter === item);
              chartdata[index].data.push(dataset);
            } else {
              chartdata.push({ parameter: item, data: [dataset] });
            }
          }
        });
      });
      setTrendData(chartdata);
    }
  }, [data]);


  return (
    <div style={{ width: "100%", height: "max-content", overflowY: "auto" }}>
      {trenddata.length > 0 &&
        trenddata.map((item, index) => {
          return (
            <div key={index} style={{ width: "100%", height: "300" }}>
              <div className="card mt-2">
                <div className="card-header modal-color">
                  <h5 className="text-uppercase">{item?.parameter}</h5>
                </div>
                <div className="card-body">
                  {chart === "bar" ? (
                    <BarChart width={800} height={400} data={item.data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar type="monotone" dataKey="data" fill="#8884d8" />
                    </BarChart>
                  ) : (
                    <LineChart width={800} height={400} data={item.data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="data" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
