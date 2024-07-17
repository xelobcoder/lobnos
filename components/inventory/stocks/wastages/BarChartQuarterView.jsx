import { useCallback, useEffect, useMemo, useState } from "react"
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { customFetch } from "../../../Auth/customFetch"
import Loader from "../../../accessories/Loader"
export default function BarChartQuarterView({ quarter, departmentid }) {
  const [data, setData] = useState([])
  const [isloading, setisloading] = useState(true)

  const monthCollection = useMemo(() => {
    return {
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
  }, [])

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

  const getQuarterChartSummary = useCallback(async () => {
    const monthlyData = function (data) {
      let flow = []
      if (quarter == 1) {
        flow = [1, 2, 3, 4]
      } else if (quarter == 2) {
        flow = [5, 6, 7, 8]
      } else {
        flow = [9, 10, 11, 12]
      }

      if (data.length === 0) {
        setData([])
      } else {
        const nw = flow.map((a, monthIndex) => {
          const filteredData = data.filter((item) => item.month === a)
          const totalDebitAmount = filteredData.reduce((total, item) => total + item.debitAmount, 0)
          return { month: monthCollection[a], wastages: totalDebitAmount }
        })

        const allWastageZero = nw.some((a, index) => a.wastages != 0)

        allWastageZero ? setData(nw) : setData([])
      }
    }

    setisloading(true)
    let endpoint = `inventory/wastages/data/quarters/summary?quarters=${quarter}`

    if (departmentid) {
      endpoint += `&&departmentid=${departmentid}`
    }
    customFetch(endpoint)
      .then((data) => {
        data?.status === "success" && monthlyData(data?.result)
        setisloading(false)
      })
      .catch((err) => {
        setisloading(false)
        setData([])
      })
  }, [quarter, monthCollection, departmentid]);
  

  useEffect(() => {
    getQuarterChartSummary()
  }, [getQuarterChartSummary])

  const renderer = () => {
    if (isloading) {
      return <Loader />
    } else {
      if (data.length === 0) {
        return (
          <div className="alert alert-info mx-2">
            <h3>No Data Available for Chart</h3>
          </div>
        )
      } else {
        return (
          <BarChart width={600} height={400} data={data}>
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
  }

  return <div>{renderer()}</div>
}
