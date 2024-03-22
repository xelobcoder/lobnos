import { useEffect, useState } from "react";
import {
  LineChart, Bar, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, BarChart
} from "recharts";

export default function PatientTrendChart({ data, parameters, chart }) {
  const [trenddata, setTrendData] = useState(data || [])
  console.log(data, parameters)

  return (
    <div className="grid grid-50 mx-2">
      {trenddata.map((item, index) => {
        return (
          <div key={index}>
            <div className="card mt-2 br-0">
              <div className="card-header modal-color">
                <h5 className="text-uppercase">Field/parameter: {item?.field}</h5>
              </div>
              <div className="card-body">
                {chart === "bar" ? (
                  <BarChart width={700} height={400} data={item.data} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar type="monotone" dataKey="value" fill="#8884d8" barSize={20} />
                  </BarChart>
                ) : (
                  <LineChart width={700} height={400} data={item.data} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
