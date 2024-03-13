import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"

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
        return (
          <div>
            <div className={haslimits ? "grid grid-4" : "grid grid-50"}>
              <div>
                <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">parameter</span>
              </div>
              <div>
                <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">value</span>
              </div>
              {haslimits && (
                <div>
                  <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">units</span>
                </div>
              )}
              {haslimits && (
                <div>
                  <span className="text-uppercase text-dark  fw-bold border-bottom border-secondary border-0">reference ranges</span>
                </div>
              )}
            </div>
            {result.map((item, index) => {
              return (
                <div key={index} className={haslimits ? "grid grid-4" : "grid grid-50"}>
                  <div className="text-capitalize">{item.name}</div>
                  <div>{item.value}</div>
                  {item.haslimits && <div>{item.units}</div>}
                  {item.haslimits && (
                    <div>
                      <span>{item.upperlimit}</span>
                      <span>{"-"}</span>
                      <span>{item.lowerlimit}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
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
