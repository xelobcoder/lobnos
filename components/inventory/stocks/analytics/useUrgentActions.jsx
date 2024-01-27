import { useEffect, useState } from "react"
import { customFetch } from "../../../Auth/customFetch"
import Loader from "../../../accessories/Loader"
import TableDisplay from "../../../accessories/TableDisplay"

export default function UseUrgentActions({ endpoint, columns }) {
  const [isloading, setisLoading] = useState(true)
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    customFetch(endpoint)
      .then((data) => {
        setStocks(data?.result)
        setisLoading(false)
      })
      .catch((err) => {
        setisLoading(false)
        setStocks([])
      })
  }, [endpoint])

  const renderer = () => {
    if (isloading) return <Loader />
    else {
      return <TableDisplay column={columns} data={stocks} />
    }
  }
  return <>{renderer()}</>
}
