import { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import DebitableBrandBatch from './_DebitableTable';
import { customPost } from '../../../Auth/customFetch';
export default function DispatchStockAccordionList({ data, departmentid,index,invsettings,passToast,removeItem}) {
  const [loadDebitable, setLoadDebitable] = useState(false)
 

  const stocksServed = async (t) => {
    if (Array.isArray(t) && t.length > 0) {
      const resource = { data: t, qtyApproved: data?.quantity_approved, requisitionid: data?.id, departmentid }
      const push_data = await customPost("store/departments/requisitions/serve", "POST", resource)
      const { status, message } = push_data
      if (status === "success") {
        passToast("Added to esrow awaiting validation from department", "success")
        removeItem(data?.id)
      } else {
        passToast(message, "error")
      }
    }
  }
  return (
    <Accordion.Item
      eventKey={index}
      onClick={(ev) => {
        setLoadDebitable(true)
      }}>
      <Accordion.Header>
        <div className="grid-6 text-capitalize" style={{ width: "100%", fontSize: "14px" }}>
          <span>{data?.name}</span>
          <span>{new Date(data?.date).toLocaleDateString()}</span>
          <span>Total store qty({data.quantity})</span>
          <span>Req. Qty({data?.quantity_requested})</span>
          <span>App. Qty({data?.quantity_approved})</span>
          <span className="btn btn-success btn-sm" style={{ width: "max-content" }}>
            {data?.status}
          </span>
        </div>
      </Accordion.Header>
      <Accordion.Body className="bg-secondary">
        <DebitableBrandBatch
          invsettings={invsettings}
          departmentid={departmentid}
          stocksServed={stocksServed}
          disabled={invsettings.stocksAutoDeduct}
          stockid={data?.stockid}
          data={data}
          getDebitable={loadDebitable}
        />
      </Accordion.Body>
    </Accordion.Item>
  )
}