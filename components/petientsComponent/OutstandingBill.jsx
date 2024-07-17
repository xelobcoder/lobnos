import { useState } from "react"
import CardRacks from "../accessories/CardRacks"
import { currencyFormatter } from "../Auth/customFetch"
export default function OutstandingBills({ total,count }) {
  const [active, setActive] = useState(false)
  return (
    <CardRacks
      activestate={active}
      header={
        <h5
          onClick={(ev) => {
            setActive(!active)
          }}>
          Total Outstanding Bill
        </h5>
      }
      body={
        <>
          <div className="text-danger d-flex justify-content-center ">
            <h1 className="p-3">
              { currencyFormatter.format(total) || 'loading'}
            </h1>
          </div>
        </>
      }
    />
  )
}
