import { PlayDisabledSharp } from '@mui/icons-material';
import {Table,TableBody,TableContainer,TableHead,TableRow,Paper,TableCell} from '@mui/material';
import { useCallback, useEffect, useState } from "react"
import { customFetch } from "../../../Auth/customFetch"
import Loader from "../../../accessories/Loader"
export default function DebitableBrandBatch({ data, invsettings, disabled, getDebitable, stocksServed, departmentid, stockid }) {
  const [brands, setBrands] = useState([])
  const [isloading, setIsloading] = useState(true)

  const autoDebit = useCallback(
    (stockbrands) => {
      if (disabled) {
        const approvedQuantity = parseInt(data.quantity_approved)
        let remainder = approvedQuantity
        const updatedDebitable = stockbrands.map((item) => {
          const { storeQty } = item
          const brandbatchqty = parseInt(storeQty)
          const served = Math.min(remainder, brandbatchqty)
          const deficit = brandbatchqty - served
          remainder -= served
          return {
            ...item,
            served,
            availableQty: brandbatchqty,
            currentQty: brandbatchqty - served,
            deficit,
          }
        })
        setBrands(updatedDebitable)
      } else {
        setBrands(stockbrands)
      }
    },
    [disabled, data.quantity_approved]
  )

  useEffect(() => {
    if (getDebitable === true) {
      setIsloading(true)
      customFetch(`store/departments/requisitions/serve/supply?departmentid=${departmentid}&&stockid=${stockid}`)
        .then((data) => {
          setIsloading(false)
          data?.status === "success" && autoDebit(data?.result)
        })
        .catch((err) => {
          setIsloading(false)
          setBrands([])
        })
    }
  }, [departmentid, stockid, getDebitable, autoDebit])

  const renderer = () => {
    if (isloading) {
      return <Loader />
    } else {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-warning">
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Store Qty</TableCell>
                <TableCell>Available Qty</TableCell>
                <TableCell>Current Qty</TableCell>
                <TableCell>Amount served</TableCell>
                <TableCell>
                  <button className="btn btn-light btn-sm" onClick={(ev) => stocksServed(brands)}>
                    served
                  </button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.brand}</TableCell>
                  <TableCell>{row.batchnumber}</TableCell>
                  <TableCell>{row.storeQty}</TableCell>
                  <TableCell>{row.availableQty}</TableCell>
                  <TableCell>{row.currentQty}</TableCell>
                  <TableCell>
                    <input disabled={disabled} className="custom-input" value={row.served} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    }
  }
  return <>{renderer()}</>
} 