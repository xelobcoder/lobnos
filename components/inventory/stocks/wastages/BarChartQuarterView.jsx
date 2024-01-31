import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts"
export default function BarChartQuarterView({ data, quarter }) {
  const monthCollection = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  }

  const monthlyData = function () {
    let flow = []
    if (quarter == 1) {
      flow = [1, 2, 3, 4]
    } else if (quarter == 2) {
      flow = [5, 6, 7, 8]
    } else {
      flow = [9, 10, 11, 12]
    }

    return flow.map((a, monthIndex) => {
      const filteredData = data.filter((item) => item.month === monthIndex + 1)
      const totalDebitAmount = filteredData.reduce((total, item) => total + item.debitAmount, 0)
      return { month: monthCollection[flow[monthIndex]], wastages: totalDebitAmount }
    })
  }
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#8884d8",
    "#8884d8",
    "#8884d8",
    "#8884d8",
    "#8884d8",
    "#8884d8",
    "#8884d8",
  ]

  const renderer = () => {
    if (data.length === 0) {
      return (
        <div className="alert alert-info mx-2">
          <h3>No Data Available for Chart</h3>
        </div>
      )
    } else {
      return (
        <BarChart width={600} height={400} data={monthlyData()}>
          <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom" }} />
          <YAxis dataKey="wastages" label={{ value: "Losess/Wastages", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="wastages" barSize={50}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      )
    }
  }

  return <div>{renderer()}</div>
}
