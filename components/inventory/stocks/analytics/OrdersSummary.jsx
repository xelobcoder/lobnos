import { useState } from "react"
import { Tabs, Tab } from "react-bootstrap"
import UseUrgentActions from "./useUrgentActions"
import { useRouter } from "next/navigation"
import { currencyFormatter } from "../../../Auth/customFetch"

export default function OrdersSummary() {
  const navigate = useRouter()
  const [key, setKey] = useState(null)

  const uncompleteOrders = [
    { Header: "date", accessor: "date", Cell: ({ row }) => <div>{new Date(row.original.date).toLocaleDateString()}</div> },
    { Header: "suppliername", accessor: "suppliername" },
    { Header: "qty ordered", accessor: "quantity" },
    { Header: "purchase unit", accessor: "purchaseunit" },
    {
      Header: "actions",
      Cell: ({ row }) => (
        <button
          onClick={(ev) => {
            navigate.push(`/supplier/purchases/receive/${row.original.orderTransactionid}`)
          }}
          className="btn btn-primary btn-sm">
          receive
        </button>
      ),
    },
  ]

  const completedOrders = [
    { Header: "date", accessor: "date", Cell: ({ row }) => <div>{new Date(row.original.date).toLocaleDateString()}</div> },
    { Header: "suppliername", accessor: "suppliername" },
    { Header: "qty ordered", accessor: "quantity" },
    { Header: "qty Received", accessor: "quantityReceived" },
    { Header: "pricing", accessor: "pricing" },
    { Header: "price", accessor: "price" },
    {
      Header: "totalamount", accessor: "totalamount", Cell: ({ row, value }) => {
        return currencyFormatter.format(value);
    } },
    { Header: "purchase unit", accessor: "purchaseunit" },
  ]

  return (
    <>
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="uncomplete" title="Unompleted Orders">
          {key === "uncomplete" && (
            <UseUrgentActions columns={uncompleteOrders} endpoint={`inventory/analytics/urgentactions?action=uncompletedorders`} />
          )}
        </Tab>
        <Tab eventKey="completed" title="Top Completed Orders">
          {key === "completed" && (
            <UseUrgentActions columns={completedOrders} endpoint={`inventory/analytics/urgentactions?action=completedorders`} />
          )}
        </Tab>
      </Tabs>
    </>
  )
}
