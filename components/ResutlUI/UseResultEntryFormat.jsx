import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"

export default function UseResultEntryScientist({ testid, billingid }) {
  const [isloading, setLoading] = useState(true)
  const [data, setData] = useState({ resultentry: "", validatedBy: "" })

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true)
      customFetch(`result/preview/entry/scientist?billingid=${billingid}&&testid=${testid}`)
        .then((data) => setData(data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }
  }, [billingid, testid])

  const rendering = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div className="grid grid-30-30-30">
          <span className="text-capitalize">Entered By:{data?.resultentry}</span>
          <span className="text-capitalize">Validated By: {data?.validatedBy}</span>
          <span className="text-capitalize">Signature: ................................................</span>
        </div>
      )
    }
  }
  return <div>{rendering()}</div>
}
