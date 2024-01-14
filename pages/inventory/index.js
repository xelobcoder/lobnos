import { useCallback, useState } from "react"
import {ListGroup,ListGroupItem } from 'react-bootstrap'
import { customPost } from "../../components/Auth/customFetch"
import InventoryLayout from "../../components/inventory/InventoryLayout"
import { useEffect } from "react"
import { getStocks, getWareHouseList, handleAssignWare } from "../../components/inventory/Util"
import ADD_STOCK_INVENTORY from "../../components/inventory/addstock";
import Pagination from "../../components/accessories/pagination"
import StockListView from "../../components/inventory/stocks/StockListView"



export default function INVENTORY_PAGE() {
  const [editing, setEditing] = useState({ edit: false, stockid: null, data: {} })
  const [stocksource, setStocks] = useState([])
  const [loading, setLoading] = useState(true);
  const [warehouseList, setWareHouseList] = useState([])
  const [showModal, setShowmodal] = useState(false)

  
  useEffect(() => {
    setLoading(true);
    async function getdata() {
      await getStocks("all", setStocks);
      await getWareHouseList(setWareHouseList);
    }
    getdata();
    setLoading(false);
  }, [])

  const closeModal = (reload) => {
    setShowmodal(false)
    setEditing({ edit: false, stockid: null });
  }

  const show = () => setShowmodal(true);

  const handleDelete = async (id) => {
    if (!id) return false;
    try {
      const data = await customPost("stock", "DELETE", { stockid: id });
      const { status, statusCode } = data;
      if (status === "success" && statusCode === 200) {
        setStocks(stocksource.filter((item) => item.stockid !== id));
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditingStock = (id, data) => {
    if (!id) return
    setEditing({ edit: true, stockid: id, data })
    setShowmodal(true)
  }

  const setLoader = useCallback(() => setLoading(false), []);
  const updateFunction = useCallback((data) => {
    console.log(data);
  },[])
  return (
    <>
      <InventoryLayout>
        <div className="d-flex justify-content-end">
          <select className="custom-select col-3 mx-2">
            <option>select a warehouse</option>
            <option value="all">all warehouse</option>
            {warehouseList.map((item, index) => {
              return <option key={index}>{item?.name}</option>
            })}
          </select>
          <button className="btn btn-primary  btn-sm mx-2">New stock Category</button>
          <button onClick={show} className="btn btn-primary btn-sm">
            New stock
          </button>
        </div>
        {
          loading ?
            <div className="loader"></div>
            :
            (
              <>
              <div style={{ marginTop: "20px" }}>
          <ListGroup>
            <ListGroupItem className="br-0 stock-grid bg-light  text-capitalize">
              <span>date</span>
              <span>name</span>
              <span>category</span>
              <span>units</span>
              <span>quantity Avail.</span>
              <span>Alert level</span>
              <span>date</span>
            </ListGroupItem>
            {stocksource.map((item,index) => {
              return (
                <StockListView
                handleAssignWare={handleAssignWare}
                handleDelete={handleDelete}
                handleEditingStock={handleEditingStock}
                key={index} data={item} />)
          })}
          </ListGroup>
        </div>
        <ADD_STOCK_INVENTORY warehouseList={warehouseList} editing={editing} show={showModal} closeModal={closeModal} />

        <Pagination setLoader={setLoader} updateFuntion={updateFunction} />
              </>
            )
      }
      </InventoryLayout>
    </>
  )
}
