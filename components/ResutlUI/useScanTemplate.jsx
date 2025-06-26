import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
export default function UseScanResultTemplate({ billingid, testid, test, patientid }) {
  const [result, setResult] = useState("")
  const [isloading, setLoading] = useState(true)

  useEffect(() => {
    try {
      async function getData() {
        if (billingid && test && testid && patientid) {
          setLoading(true)
          const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}`)
          const { result, sampling, testcategory } = response
          setResult(result?.value)
          setLoading(false)
        }
      }
      getData()
    } catch (err) {
      setResult([])
      setLoading(false)
    }
  }, [billingid, test, testid, patientid])

  return (
    <div>
      <h5 className="text-uppercase text-center border-bottom border-top border-2 border-secondary">
        {test && test.includes("_") ? test.split("_").join(" ") : test}
      </h5>
      <div dangerouslySetInnerHTML={{ __html: result }} />
    </div>
  )
}
