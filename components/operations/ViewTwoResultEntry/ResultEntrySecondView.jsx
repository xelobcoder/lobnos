import { useSearchParams } from "next/navigation"
import { getTestComponent } from "../../LabTestForms/ComponentsTestFormsList"
import Loader from "../../accessories/Loader"
import { useEffect, useState } from "react"
export default function ResultEntryPanelSecondView() {
  const testname = useSearchParams().get("testname")
  const employeeid = useSearchParams().get("employeeid")
  const billingid = useSearchParams().get("billingid")
  const view = useSearchParams().get("view")
  const testid = useSearchParams().get("testid")
  const patientid = useSearchParams().get("patientid")
  const [tests, setTestNames] = useState([])
  const [multipleView, setMultipleView] = useState(null)
  const clientdata = { test: testname, employeeid, testid, patientid, billingid }

  useEffect(() => {
    if (view == "multiple") {
      setMultipleView(true)
      if (testname.includes(",") && testid.includes(",")) {
        const testids = testid.split(",").map((item, index) => parseInt(item))
        const testCollection = testname.split(",").map((item, index) => {
          return { testname: item, testid: testids[[index]] }
        })
        setTestNames(testCollection)
      }
    } else if (view === "single") {
      setMultipleView(false)
    } else {
      setMultipleView(null)
    }
  }, [view, testid, testname])


  const rendering = () => {
    if (!testname) {
      return <Loader />
    } else {
      if (multipleView === false) {
        let Component = getTestComponent(testname.toLowerCase())
        return <div className="mt-2">{multipleView === false && <Component employeeid={employeeid} clientdata={clientdata} />}</div>
      } else if (multipleView === true) {
        return (
          <div className="grid-50 mx-2 py-3 bg-secondary ">
            {tests.map((item, index) => {
              const { testname, testid } = item
              let Component = getTestComponent(testname.toLowerCase())
              const clientdata = { employeeid, test: testname, testid, patientid, billingid }
              return (
                <div key={index + 1}>
                  <Component employeeid={employeeid} clientdata={clientdata} />
                </div>
              )
            })}
          </div>
        )
      } else {
        return <h3>Multiple View Null</h3>
      }
    }
  }
  return <div>{rendering()}</div>
}
