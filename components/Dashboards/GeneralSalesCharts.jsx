import  { useState ,useEffect} from 'react';
import { currencyFormatter, getBranches, monthCollection } from "../../components/Auth/customFetch"
import PerformanceChartGeneral from "../../components/salesSummary/PerformanceChartGeneral"
import CardRacks from "../accessories/CardRacks"

export default function GeneralSalesChart() {
  const [branches, setBranches] = useState([])
  const [yearly, setYear] = useState(0)
  const [week, setWeek] = useState(0)
  const [today, setToday] = useState(0)
  const [month, setMonth] = useState(0)
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [show, setShow] = useState("salesAmount")
  const [type, setType] = useState("Bar")
  useEffect(() => {
    getBranches(setBranches)
  }, [])

  const year = new Date().getFullYear()

  const handleYearSummary = (data) => {
    const currentYear = new Date().getFullYear()
    if (currentYear && data.length > 0) {
      const sales = data.filter((item, index) => item.Year === currentYear)
      if (sales.length <= 0) setYear(0)
      else {
        const { salesAmount } = sales[0]
        setYear(salesAmount)
      }
    }
  }

  const handleMonthSummary = (data) => {
    const currentMonth = monthCollection[new Date().getMonth()]
    if (data.length > 0 && currentMonth) {
      const sales = data.filter((item, index) => item.Month == currentMonth)
      if (sales.length <= 0) setMonth(0)
      else {
        const { salesAmount } = sales[0]
        setMonth(salesAmount)
      }
    }
  }

  const handleTodaySummary = (data) => {
    const today = new Date().getDate()
    if (data.length > 0 && today) {
      const sales = data.filter((item, index) => new Date(item?.date).getDate() === today)
      if (sales.length <= 0) setToday(0)
      else {
        const { salesAmount } = sales[0]
        setToday(salesAmount)
      }
    }
  }

  const handleWeekSummary = (data) => {
    const today = new Date().getDate()
    let week = "First Week"
    if (today < 8) {
      week = "First Week"
    } else if (today >= 8 && today <= 14) {
      week = "Second Week"
    } else if (today > 14 && today <= 21) {
      week = "Third Week"
    } else {
      week = "Fourth Week"
    }
    console.log(data)
    if (data.length > 0 && today) {
      const sales = data.filter((item, index) => item.Week === week)
      if (sales.length <= 0) setWeek(0)
      else {
        const { salesAmount } = sales[0]
        setWeek(salesAmount)
      }
    }
  }
  return (
    <>
      <div className="d-flex gap-3 px-2 py-2">
        <select
          onChange={(ev) => {
            setSelectedBranch(ev.target.value)
          }}>
          <option> select branch</option>
          <option value={"all"}>all</option>
          {branches.map((item, index) => {
            return (
              <option key={index + 1} value={item.branchid}>
                {item.name}
              </option>
            )
          })}
        </select>
        <select
          onChange={(ev) => {
            setShow(ev.target.value)
          }}>
          <option>select what to show</option>
          <option value="salesAmount">sales </option>
          <option value="totalCases">cases count</option>
        </select>
        <select
          onChange={(ev) => {
            setType(ev.target.value)
          }}>
          <option value="Bar">Bar Chart</option>
          <option value="Line">Line Chart</option>
        </select>
      </div>
      <div className="grid-5">
        <CardRacks body={<h4 className="mx-2 mt-2">{currencyFormatter.format(today)}</h4>} header={<h6 className="m-0">Today Sales</h6>} />
        <CardRacks body={<h4 className="mx-2 mt-2">{currencyFormatter.format(week)}</h4>} header={<h6 className="m-0">week sales</h6>} />
        <CardRacks body={<h4 className="mx-2 mt-2">{currencyFormatter.format(month)}</h4>} header={<h6 className="m-0">Month sales</h6>} />
        <CardRacks body={<h4 className="mx-2 mt-2">{currencyFormatter.format(yearly)}</h4>} header={<h6 className="m-0">Year Sales</h6>} />
        <CardRacks header={<h6 className="m-0">Month sales</h6>} />
      </div>
      <div className="sales_summary">
        <PerformanceChartGeneral
          type={type}
          branchid={selectedBranch}
          target={"yearly"}
          show={show}
          subtarget="Year"
          title={"Annual sales performance chart"}
          upcall={true}
          upCallReceiver={handleYearSummary}
        />
        <PerformanceChartGeneral
          type={type}
          branchid={selectedBranch}
          target={"monthly"}
          show={show}
          upCallReceiver={handleMonthSummary}
          upcall={true}
          subtarget="Month"
          title={`${year} Monthly sales`}
        />
        <PerformanceChartGeneral
          type={type}
          branchid={selectedBranch}
          show={show}
          upCallReceiver={handleWeekSummary}
          upcall={true}
          target={"weekly"}
          subtarget="Week"
          title={"Month Weekly sales"}
        />
        <PerformanceChartGeneral
          type={type}
          upCallReceiver={handleTodaySummary}
          upcall={true}
          branchid={selectedBranch}
          show={show}
          target={"daily"}
          subtarget="Day"
          title={"Daily sales of the month"}
        />
      </div>
    </>
  )
}
