import React, { useState } from 'react'
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';
import TableDisplay from "../accessories/TableDisplay"

export default function PendingTableSample({ data, removeClient }) {
  const [showAssesModal, setShowAssesModal] = useState(false)
  const [target, setTarget] = useState(null)

  const openModal = (ev) => {
    setShowAssesModal(true)
  }
  const closeModal = (ev) => {
    setShowAssesModal(false)
  }

  const columns = [
    {
      Header: "billing date",
      accessor: "date",
      Cell: function ({ value }) {
        return <div>{new Date(value).toLocaleDateString()}</div>
      },
    },
    { Header: "fullname", accessor: "fullname" },
    { Header: "billingid", accessor: "billingid" },
    {
      Header: "action",
      accessor: "action",
      Cell: function ({ row }) {
        const item = row.original
        return (
          <div>
            <button
              className="btn btn-primary btn-sm"
              onClick={(ev) => {
                setTarget(item?.billingid)
                openModal()
              }}>
              validate sample
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <TableDisplay column={columns} data={data} filtering={true} showpage={false} />
      <SampleAssessmentModal show={showAssesModal} hide={closeModal} billingid={target} removeClient={removeClient} />
    </>
  )
}
