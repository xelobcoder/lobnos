import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"
import HasLimitReference from "./hasLimitsReference"

export default function UseCustomResultTemplating({ billingid, testid, test, patientid }) {
  const [haslimits, setHaslimits] = useState(true)
  const [result, setResult] = useState([])
  const [isloading, setLoading] = useState(true)

  useEffect(() => {
    try {
      async function getData() {
        if (billingid && test && testid) {
          setLoading(true)
          const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}`)
          const { result, sampling, testcategory } = response
          if (result.length > 0) {
            const haslimits = result.some((item, index) => item.haslimits == true)
            setHaslimits(haslimits)
          } else {
            setHaslimits(false)
          }
          setResult(result || [])
          setLoading(false)
        }
      }
      getData()
    } catch (err) {
      setResult([])
      setLoading(false)
    }
  }, [billingid, test, testid, patientid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      if (Array.isArray(result) === false || result.length == 0) return <h4>No data provided</h4>
      else {
        const hasLimits = result.some((item, index) => item.haslimits == true)
        const hasPlain = result.some((item, index) => item.useplain == true)

        if (hasLimits) {
          <table className="table table-dark stripped">
            <thead>
              <tr>
                <th className="border-receipt px-1 py-2" scope="col ">
                  Parameter
                </th>
                <th className="border-receipt px-1 py-2" scope="col ">
                  Value
                </th>
                <th className="border-receipt px-1 py-2" scope="col ">
                  Units
                </th>
                <th className="border-receipt px-1 py-2" scope="col ">
                  Reference Ranges
                </th>
              </tr>
              <tbody>
                {result.map((item, index) => {
                  return <HasLimitReference key={index} item={item} />
                })}
              </tbody>
            </thead>
          </table>
        } else if (hasPlain) {
          return (
            <table className="receipt-border" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th className="border-receipt px-1 py-2" scope="col">
                    Parameter
                  </th>
                  <th className="border-receipt px-1 py-2" scope="col">
                    Value
                  </th>
                  <th className="border-receipt px-1 py-2" scope="col">
                    Units
                  </th>
                  <th className="border-receipt px-1 py-2" scope="col">
                    Reference Ranges
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.map((item, index) => {
                  return <HasLimitReference key={index} item={item} />
                })}
              </tbody>
            </table>
          )
        } else {
          return (
            <div className={"grid grid-50"}>
              <div>
                <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">parameter</span>
              </div>
              <div>
                <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">value</span>
              </div>
              {result.map((item, index) => {
                return (
                  <div key={index} className={haslimits ? "grid grid-4" : "grid grid-50"}>
                    <div className="text-capitalize">{item.name}</div>
                    <div>{item.value}</div>
                  </div>
                )
              })}
            </div>
          )
        }

      }
    }
  }

  return (
    <div>
      <h5 className="text-uppercase text-center border-bottom border-top border-2 border-secondary">
        {test && test.includes("_") ? test.split("_").join(" ") : test}
      </h5>
      <section className="main-result">{renderingView()}</section>
    </div>
  )
}
