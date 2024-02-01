import { useEffect, useState } from "react"
import DepartmentInventoryLayout from "../../../../components/inventory/departments/DepartmentInventoryLayout"
import { useSearchParams } from "next/navigation"
export default function StockUsage() {
  const [stocks, setStocks] = useState([])
  const [isloading, setLoading] = useState(true)
  const stockid = useSearchParams().get("stockid")
  const departmentid = useSearchParams().get("departmentid")

  useEffect(() => {
    if (departmentid && stockid) {
      setLoading(true);
    }
  }, [departmentid, stockid])
  return (
    <DepartmentInventoryLayout>
     
    </DepartmentInventoryLayout>
  )
}
