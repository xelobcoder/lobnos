import { useCallback, useEffect, useState } from "react"
import { customFetch } from "../../Auth/customFetch"
import TrendSingleList from "./TrendSingleList"
import { ToastContainer, toast } from "react-toastify"
import Loader from "../../accessories/Loader"
import PatientTrendChart from "./PatientTrendChart"
export default function PatientTrendModalJsx({ data }) {
  const { test, patientid, billingid, testid } = data
  const [instances, setInstances] = useState(5) // [5,6,7,8,9]
  const [chartOptions, setChartOptions] = useState("bar") // [5,6,7,8,9
  const [loading, setLoading] = useState(true)
  const [dataSet, setDataSet] = useState([])

  const handleTrendView = useCallback(async () => {
    if (instances && patientid && testid) {
      setLoading(true)
      const response = await customFetch(
        `result/patientrend/single?billingid=${billingid}&&patientid=${patientid}&&test=${test}&&testid=${testid}&&instances=${instances}`
      )
      const { statusCode, status, result } = response
      if (Array.isArray(result)) {
        setDataSet(result)
      } else if (typeof result == "string") {
        toast.warning(result, { autoClose: 5000, position: "top-center" })
      } else {
        
      }
      setLoading(false)
    }
  }, [instances, patientid, testid, test, billingid])

  useEffect(() => {
    handleTrendView()
  }, [handleTrendView])

  const renderingChart = () => {
    if (loading) return <Loader />
    else {
      if (dataSet.length == 0) {
        return <h5>No data found</h5>
      } else {
        return <PatientTrendChart chart={chartOptions} parameters={dataSet.map((item, index) => item.field)} data={dataSet} />
      }
    }
  }

  return (
    <div>
      <ToastContainer theme="dark" style={{ width: "80%" }} />
      <div className="mx-2">
        <h3>
          Trend Analysis for {test.includes("_") ? test.split("_").join(" ") : test} ====={">>>"} PATIENTID:{patientid}
        </h3>
      </div>
      <div className="d-flex">
        <div className="col-3">
          <select
            className="custom-select mx-2 "
            value={instances}
            onChange={(ev) => {
              setInstances(parseInt(ev.target.value))
            }}>
            <option>select number of instance</option>
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
          </select>
        </div>
        <div className="mx-3 col-4">
          <select value={chartOptions} className="custom-select" onChange={(ev) => setChartOptions(ev.target.value)}>
            <option>select chart type</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
      </div>
      <section>
        <>
          {/* {dataSet.parameters.length > 0 && dataSet.trend.length > 0 ? (
              <table className="d-flex billing-cart-table x-trend br-5" style={{ border: "0px !important" }}>
                <tbody>
                  <tr className="d-flex flex-column">
                    <td>parameters</td>
                    {dataSet.parameters.map((item, index) => {
                      return <td key={index}>{item}</td>
                    })}
                  </tr>
                </tbody>
                {dataSet.trend.length > 0 ? (
                  dataSet.trend.map((item, index) => {
                    return <TrendSingleList parameters={dataSet.parameters} key={index} dataSet={item} />
                  })
                ) : (
                  <h3 className="text-center">No Data Found</h3>
                )}
              </table>
            ) : (
              <h3 className="text-center">No Data Found</h3>
            )} */}
        </>

        {renderingChart()}
      </section>
    </div>
  )
}
