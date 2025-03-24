import { useEffect, useState } from "react"
import DepartmentInventoryLayout from "../../../../components/inventory/departments/DepartmentInventoryLayout"
import { useSearchParams } from "next/navigation"
import CardRacks from "../../../../components/accessories/CardRacks"
import { monthCollection } from "../../../../components/Auth/customFetch"
export default function StockUsage() {
  const [stocks, setStocks] = useState([])
  const [isloading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const stockid = useSearchParams().get("stockid")
  const departmentid = useSearchParams().get("departmentid");
  const name = useSearchParams().get('name');

  useEffect(() => {
    if (departmentid && stockid) {
      setLoading(true)
    }
  }, [departmentid, stockid])
  return (
    <DepartmentInventoryLayout>
      <section className="d-flex justify-content-between">
        <div>
          <h4>Stock Usage {"<"}{name} { ">"}</h4>
        </div>
        <div className="d-flex justify-content-between">
          <div>
            <select className="custom-select">
              <option value="7">last 7 days</option>
              <option value="15">last 15 days</option>
              <option value="30">last 30 days</option>
            </select>
          </div>
          <div>
            <input type="date" className="custom-input mx-2" />
          </div>
          <div>
            <input type="date" className="custom-input mx-2" />
          </div>
          <div>
            <button className="btn btn-primary btn-sm mx-3">search</button>
          </div>
        </div>
      </section>
      <section>
        <div className="grid-30-30-30 col-6">
          <CardRacks
            onClick={(ev) => {
              setActive(1)
            }}
            activestate={active === 1}
            header={<h6>Month({monthCollection[new Date().getUTCMonth()]})</h6>}
          />
          <CardRacks
            onClick={(ev) => {
              setActive(2)
            }}
            activestate={active === 2}
            header={<h6>Year({new Date().getFullYear()})</h6>}
          />
        </div>
      </section>
    </DepartmentInventoryLayout>
  )
}
