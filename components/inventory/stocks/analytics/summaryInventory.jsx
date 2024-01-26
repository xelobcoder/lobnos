import { useEffect, useState } from "react"
import { customFetch } from "../../../Auth/customFetch"
import CardsRack from "../../../accessories/CardRacks"
import Loader from "../../../accessories/Loader"
export default function SummaryInventoryAnalytics() {
  const [isLoading, setisLoading] = useState(true)
  const [summary, setSummary] = useState({})

  useEffect(() => {
    customFetch("inventory/analytics/summary")
      .then((data) => {
        setSummary(data?.result || {})
        setisLoading(false)
      })
      .catch((err) => setSummary([]))
  }, [])

  const urgencActions = (data) => {
    if (isLoading) {
      return <Loader w={"50px"} h={"50px"} />
    } else {
      return (
        <>
          <div className="px-3">
            <div className="border-bottom p-1 d-flex justify-content-between">
              <span className="fw-bold">Near expiry count</span>
              <span>{data?.nearExpiryCount}</span>
            </div>
            <div className="border-bottom p-1 d-flex justify-content-between">
              <span className="fw-bold">Expired Stocks Count</span>
              <span>{data?.expiredCount}</span>
            </div>
            <div className="border-bottom p-1 d-flex justify-content-between">
              <span className="fw-bold">Below Alert Level</span>
              <span>{data?.belowAlertLevel}</span>
            </div>
          </div>
        </>
      )
    }
  }

  const ordersSummary = (data) => {
    if (isLoading) return <Loader  w={"50px"} h={"50px"} />
    else {
      return (
        <>
          <div className="px-3">
            <div className="border-bottom p-1 d-flex justify-content-between">
              <span className="fw-bold">incomplete Orderst</span>
              <span>{data?.incompleteOrders}</span>
            </div>
            <div className="border-bottom p-1 d-flex justify-content-between">
              <span className="fw-bold">incomplete Orderst</span>
              <span>{data?.incompleteOrders}</span>
            </div>
          </div>
        </>
      )
    }
  }
  return (
    <div className="grid-30-30-30">
      <CardsRack header={<h6 className="fw-bold">Urgent Actions</h6>} body={urgencActions(summary)} />
      <CardsRack header={<h6 className="fw-bold">Orders</h6>} body={ordersSummary(summary)} />
    </div>
  )
}
