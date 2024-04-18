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
         return (
           <table className="result-table" style={{ width: "100%" }}>
             <thead>
               <tr>
                 <th scope="col ">
                   Parameter
                 </th>
                 <th scope="col ">
                   Value
                 </th>
                 <th scope="col ">
                   Units
                 </th>
                 <th scope="col ">
                   Reference Ranges
                 </th>
                 <th>Flags</th>
               </tr>
             </thead>
             <tbody>
               {result.map((item, index) => {
                 return <HasLimitReference key={index} item={item} />
               })}
             </tbody>
           </table>
         )
        } else if (hasPlain) {
          return (
            <table className="result-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th >
                    Parameter
                  </th>
                  <th >
                    Value
                  </th>
                  <th >
                    Units
                  </th>
                  <th >
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
            <>
              <table className="result-table mt-2">
                <thead>
                  <tr>
                    <th className="text-capitalize">parameter</th>
                    <th className="text-capitalize">value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="text-capitalize">{item.name}</td>
                        <td>{item.value}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
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
