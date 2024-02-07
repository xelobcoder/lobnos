import { useState, useEffect, useCallback } from "react"
import { Tab, Tabs } from "react-bootstrap"
import UseUrgentActions from "./useUrgentActions"
import { customFetch } from "../../../Auth/customFetch";
export default function InventoryUrgentActionsView() {
  const [key, setKey] = useState("null")

  const belowAlert = [
    { Header: "stock", accessor: "name" },
    { Header: "material code", accessor: "materialcode" },
    { Header: "consumptionunit", accessor: "consumptionunit" },
    { Header: "alertlevel", accessor: "alertlevel" },
    {
      Header: "quantity",
      accessor: "quantity",
      Cell: ({ row }) => {
        return <div className="bg-warning p-1">{row.original.quantity}</div>
      },
    },
    {
      Header: "action",
      accessor: "",
      Cell: () => {
        return <button className="btn btn-primary btn-sm">order</button>
      },
    },
  ]

  const expired = [
    { Header: "stock", accessor: "name" },
    {
      Header: "received date",
      accessor: "receiveddate",
      Cell: ({ row }) => {
        return <div>{new Date(row.original.receiveddate).toLocaleDateString()}</div>
      },
    },
    {
      Header: "expiry date",
      accessor: "expiry date",
      Cell: ({ row }) => {
        return <div>{new Date(row.original.expirydate).toLocaleDateString()}</div>
      },
    },
    { Header: "batchnumber", accessor: "batchnumber" },
    {
      Header: "quantity received",
      accessor: "quantityReceived",
    },
    {
      Header: "qty Expired",
      accessor: "expiredqty",
      Cell: ({ row }) => {
        return <div className="bg-danger text-white p-1">{row.original.expiredqty}</div>
      },
    },
    {
      Header: "disposed",
      accessor: "",
      Cell: ({ row }) => {
        return <button className="btn btn-danger btn-sm">{row.original.expiredDisposed === 1 ? "disposed" : "not yet"}</button>
      },
    },
  ]

  const nearExpiry = [
    { Header: "stock", accessor: "name" },
    {
      Header: "received date",
      accessor: "receiveddate",
      Cell: ({ row }) => {
        return <div>{new Date(row.original.receiveddate).toLocaleDateString()}</div>
      },
    },
    {
      Header: "expiry date",
      accessor: "expiry date",
      Cell: ({ row }) => {
        return <div>{new Date(row.original.expirydate).toLocaleDateString()}</div>
      },
    },
    {
      Header: "quantity received",
      accessor: "quantityReceived",
    },
    {
      Header: "qty in stock",
      accessor: "qty_in_stock",
    },
  ]


  return (
    <>
      <Tabs id="inventory-brief" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="nearexpiry" title="Near Expiry">
        {key === "nearexpiry" && <UseUrgentActions columns={nearExpiry} endpoint={`inventory/analytics/urgentactions?action=nearexpiry`} />}
        </Tab>
        <Tab eventKey="expired" title="Expired Stocks">
          {key === "expired" && <UseUrgentActions columns={expired} endpoint={`inventory/analytics/urgentactions?action=expired`} />}
        </Tab>
        <Tab eventKey="below" title="Below Alert Level">
          {key === "below" && <UseUrgentActions columns={belowAlert} endpoint={`inventory/analytics/urgentactions?action=belowalert`} />}
        </Tab>
      </Tabs>
    </>
  )
}
