import  { useReducer, useState, useMemo } from "react";
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { customFetch, customPost } from "../../components/Auth/customFetch";
import InventoryLayout from "../../components/inventory/InventoryLayout";
import { useEffect } from "react";
import { filterStocks, getWareHouseList,updatePagination} from "../../components/inventory/Util";
import ADD_STOCK_INVENTORY from "../../components/inventory/addstock";
import Pagination from "../../components/accessories/pagination";
import StockListView from "../../components/inventory/stocks/StockListView";
import AddStockCategory from "../../components/inventory/stocks/AddStocksCategory";
import Loader from '../../components/accessories/Loader';


export default function INVENTORY_PAGE() {
  const [editing, setEditing] = useState({ edit: false, stockid: null, data: {} });
  const [stocksource, setStocks] = useState([]);
  const [query, dispatchQuery] = useReducer(updatePagination, { count: 10, page: 1 });
  const [loading, setLoading] = useState(true);
  const [warehouseList, setWareHouseList] = useState([]);
  const [loadpaginate, setLoadPaginate] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [showModal, setShowmodal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  const getData = (urlquery) => {
    setLoading(true);
    customFetch(urlquery)
      .then((data) => {
        const { status, statusCode, result } = data;
        if (statusCode === 200 && status === 'success') {
          setStocks(result);
          setLoading(false);
        }
      })
      .catch((err) => setLoading(false));
  }

  useEffect(() => {
    if (loadpaginate) {
      const { count, page } = query;
      getData(`stock?warehouseid=${selectedWarehouse}&&count=${count}&&page=${page}`);
    } else {
      getData(`stock?warehouseid=${selectedWarehouse}&&count=${10}&&page=${1}`);
    }
  }, [selectedWarehouse,loadpaginate,query])
    // this is ensure getwarehouse dosent load anytime , a warehouse is changed
   useEffect( () =>  { getWareHouseList(setWareHouseList);},[])

  const closeModal = () => {
    setShowmodal(false)
    setEditing({ edit: false, stockid: null });
  }

  const closeCategoryModal = () => {setShowCatModal(false)}

  const show = () => {setShowmodal(true)};
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

  const MemoizedPagination = useMemo(() => <Pagination load={setLoadPaginate} updateFunction={dispatchQuery} />, [dispatchQuery]);

  return (
    <>
      <InventoryLayout>
        <div className="d-flex justify-content-between">
          <div className="d-flex">
            <input
              onChange={(ev) => {filterStocks(ev.target.value,selectedWarehouse,query,setStocks)}}
              className="custom-input col-7" type="text" placeholder="filter stock here" />
          </div>
          <div className="d-flex justify-content-end">
            <select className="custom-select col-3 mx-2" onChange={(ev) => {setSelectedWarehouse(ev.target.value)} }> 
              <option>select a warehouse</option>
              <option value="all">all warehouse</option>
              {warehouseList.map((item, index) => {
                return <option value={item?.id} key={index}>{item?.name}</option>
              })}
            </select>
            <button onClick={(ev) => { setShowCatModal(true); }} className="btn btn-primary  btn-sm mx-2">New stock Category</button>
            <button onClick={show} className="btn btn-primary btn-sm">
              New stock
            </button>
          </div>
       </div>
        {
          loading ? <Loader /> :
            (
              <>
                <div>
                  <ListGroup>
                    <ListGroupItem className="br-0 stock-grid mt-2 bg-light  text-capitalize">
                      <span>date</span>
                      <span>name</span>
                      <span>category</span>
                      <span>units</span>
                      <span>quantity Avail.</span>
                      <span>Alert level</span>
                      <span>date</span>
                    </ListGroupItem>
                    {
                      stocksource.length > 0 ?
                        (
                          stocksource.map((item, index) => (
                            <StockListView
                              handleDelete={handleDelete}
                              handleEditingStock={handleEditingStock}
                              key={index}
                              data={item}
                            />
                          ))
                        )
                        :
                        (
                          <ListGroupItem>
                            No data Available
                          </ListGroupItem>
                        )
                    }
                  </ListGroup>
                </div>
                <div className="d-flex justify-content-center mt-1">
                  {MemoizedPagination}
                </div>
                {showModal &&
                  (<ADD_STOCK_INVENTORY warehouseList={warehouseList} editing={editing} show={showModal} closeModal={closeModal} />)}
                {
                  showCatModal && 
                  (
                    <AddStockCategory show={showCatModal} onHide={closeCategoryModal} />
                  )
              }
              </>
            )
        }
      </InventoryLayout>
    </>
  )
}
