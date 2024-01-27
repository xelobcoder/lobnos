import { useEffect, useState } from "react"
import { customFetch } from "../../../Auth/customFetch"
import CardsRack from "../../../accessories/CardRacks"
import Loader from "../../../accessories/Loader"
export default function SummaryInventoryAnalytics() {
  const [isLoading, setisLoading] = useState(true)
  const [summary, setSummary] = useState({})
  const [active, setActive] = useState(null)

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
            <div className="border-bottom text-sm p-1 d-flex justify-content-between">
              <span className="fw-bold">Near expiry count</span>
              <span>{data?.nearExpiryCount}</span>
            </div>
            <div className="border-bottom text-sm p-1 d-flex justify-content-between">
              <span className="fw-bold">Expired Stocks Count</span>
              <span>{data?.expiredCount}</span>
            </div>
            <div className="border-bottom text-sm p-1 d-flex justify-content-between">
              <span className="fw-bold">Below Alert Level</span>
              <span>{data?.belowAlertLevel}</span>
            </div>
          </div>
        </>
      )
    }
  }

  const ordersSummary = (data) => {
    if (isLoading) return <Loader w={"50px"} h={"50px"} />
    else {
      return (
        <>
          <div className="px-3">
            <div className="border-bottom text-sm p-1 d-flex text-capitalize justify-content-between">
              <span className="fw-bold">incomplete Orders</span>
              <span>{data?.incompleteOrders}</span>
            </div>
            <div className="border-bottom text-sm p-1 text-capitalize d-flex justify-content-between">
              <span className="fw-bold">completed Orders</span>
              <span>{data?.completedOrdersCount}</span>
            </div>
          </div>
        </>
      )
    }
  }

  const wastageSummary = (data) => {
    return (
      <>
        <div className="px-3">
          <div className="border-bottom text-sm  p-1 d-flex justify-content-between">
            <span className="fw-bold">General store level</span>
            <span>{data?.incompleteOrders}</span>
          </div>
          <div className="border-bottom text-sm  p-1 d-flex justify-content-between">
            <span className="fw-bold">Departments</span>
            <span>{data?.incompleteOrders}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="grid-30-30-30 mx-2">
      <CardsRack
        activestate={active == 1}
        onClick={(ev) => {
          setActive(1)
        }}
        header={<h6 className="fw-bold">Urgent Actions</h6>}
        body={urgencActions(summary)}
      />
      <CardsRack
        onClick={(ev) => {
          setActive(2)
        }}
        activestate={active == 2}
        header={<h6 className="fw-bold">Orders</h6>}
        body={ordersSummary(summary)}
      />
      <CardsRack
        onClick={(ev) => {
          setActive(3)
        }}
        activestate={active === 3}
        header={<h6>Wastage</h6>}
        body={wastageSummary(summary)}
      />
    </div>
  )
}
