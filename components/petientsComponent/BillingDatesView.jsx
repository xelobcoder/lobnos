import { useState, useCallback, useEffect } from "react"
import Loader from "../accessories/Loader"
import { customFetch } from "../Auth/customFetch"

export default function BillingDatesView({ patientid, updateselection, isSearch }) {
  const [billingdates, setBillingDates] = useState([])
  const [isLoading, setLoading] = useState(false)

  const getTransactionDates = useCallback(
    async function () {
      try {
        if (patientid && isSearch) {
          setLoading(true)
          const getResponse = await customFetch(`patients/analytics/date?patientid=${patientid}`)
          const { statusCode, result } = getResponse
          if (statusCode == 200) {
            setBillingDates(result)
          } else {
            setBillingDates([])
          }
          setLoading(false)
        }
      } catch (err) {
        setLoading(false)
        setBillingDates([])
      }
    },
    [isSearch, patientid]
  )

  useEffect(() => {
    getTransactionDates()
  }, [getTransactionDates])

  const rendering = () => {
    if (isLoading) return <Loader />
    else {
      return (
        <div className="list-group">
          {billingdates.map((item, index) => {
            return (
              <div
                className="list-group-item p-1 ml-3"
                key={index}
                onClick={(e) => {
                  updateselection(e.target)
                }}>
                {new Date(item.TransactionsDate).toLocaleDateString()}
              </div>
            )
          })}
        </div>
      )
    }
  }

  return <>{rendering()}</>
}
