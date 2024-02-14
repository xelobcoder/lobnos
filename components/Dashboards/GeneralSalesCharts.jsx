import  { useState ,useEffect} from 'react';
import { currencyFormatter, getBranches, monthCollection } from "../../components/Auth/customFetch"
import PerformanceChartGeneral from "../../components/salesSummary/PerformanceChartGeneral"
import CardRacks from "../accessories/CardRacks"
import { useRouter } from 'next/navigation';

export default function GeneralSalesChart() {
  const [branches, setBranches] = useState([])
  const [active, setActive] = useState(null)
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
    } else setYear(0)
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
    } else setMonth(0)
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
    } else {
      setToday(0)
    }
  }

  const determineWeek = (value, startdate = false, enddate = false) => {
    let week = ""
    let start = 0
    let end = 0
    if (value < 8) {
      week = "First Week"
      end = 7
    } else if (value >= 8 && value <= 14) {
      week = "Second Week"
      start = 8
      end = 14
    } else if (value > 14 && value <= 21) {
      week = "Third Week"
      start = 15
      end = 21
    } else {
      start = 16
      end = null
      week = "Fourth Week"
    }
    if (!startdate && !enddate) {
      return week
    }
    return { start, end, week }
  }

  const handleWeekSummary = (data) => {
    const today = new Date().getDate()
    let week = determineWeek(today)
    if (data.length > 0 && today) {
      const sales = data.filter((item, index) => item.Week === week)
      if (sales.length <= 0) setWeek(0)
      else {
        const { salesAmount } = sales[0]
        setWeek(salesAmount)
      }
    } else {
      setWeek(0)
    }
  }

  const router = useRouter()
  const handleClickSum = (value) => {
    setActive(value)
    if (value > 3) return
    const isViewDetails = confirm("Do you want to view details of this summary?")
    if (isViewDetails) {
      let today = new Date()
        .toLocaleDateString()
        .toString()
        .split("/")
        .map((item) => (item === "/" ? "-" : item))
      if (value === 1) {
        today = today.reverse().join("-")
        router.push(`/billing/payment?from=${today}&&to=${today}`)
      } else if (value === 2) {
        const n = determineWeek(today[0], true, true)
        let start = [...today]
        start[0] = n["start"]
        start = start.reverse().join("-")
        let end = [...today]
        end[0] = n["end"]
        end = end.reverse().join("-")
        router.push(`/billing/payment?from=${start}&&to=${end}`)
      } else if (value === 3) {
        let start = [...today]
        start[0] = 1
        start = start.reverse().join("-")
        let end = [...today]
        end[0] = 31
        end = end.reverse().join("-")
        router.push(`/billing/payment?from=${start}&&to=${end}`)
      } else {
        return
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
        <CardRacks
          activestate={active == 1}
          body={
            <h4
              onClick={(ev) => {
                handleClickSum(1)
              }}
              className="mx-2 mt-2">
              {currencyFormatter.format(today)}
            </h4>
          }
          header={<h6 className="m-0">Today Sales</h6>}
        />
        <CardRacks
          activestate={active === 2}
          body={
            <h4
              onClick={(ev) => {
                handleClickSum(2)
              }}
              className="mx-2 mt-2">
              {currencyFormatter.format(week)}
            </h4>
          }
          header={<h6 className="m-0">week sales</h6>}
        />
        <CardRacks
          activestate={active === 3}
          body={
            <h4
              onClick={(ev) => {
                handleClickSum(3)
              }}
              className="mx-2 mt-2">
              {currencyFormatter.format(month)}
            </h4>
          }
          header={<h6 className="m-0">Month sales</h6>}
        />
        <CardRacks
          activestate={active === 4}
          body={
            <h4
              onClick={(ev) => {
                handleClickSum(4)
              }}
              className="mx-2 mt-2">
              {currencyFormatter.format(yearly)}
            </h4>
          }
          header={<h6 className="m-0">Year Sales</h6>}
        />
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
