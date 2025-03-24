import { getDataAndUpdateState } from "../../../components/Auth/customFetch";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import AddWarehouseForm from "../../../components/inventory/WareHouse/AddNewWareHouse";
import { ArrowForwardSharp, DeleteForever, Edit, Preview } from "@mui/icons-material";
import AddShelfForm from "../../../components/inventory/WareHouse/shelf";
import ISLOADING from "../../../components/isLoading";
import RackQuickView from "../../../components/inventory/WareHouse/QuickRackItemsView";
import { useRouter } from "next/navigation";
import { getShelves, getWareHouseList } from "../../../components/inventory/Util";

export default function WareHouse() {
  const defaultValues = { show: false, target: 0 };
  const [warehouseList, setWareHouseList] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [shelfLoading, setShelfLoading] = useState(true);
  const [shouldReload, setReload] = useState(false);
  const [editing, setEditing] = useState({edit: false, data: {}});
  const [showModal, setShowModal] = useState(defaultValues);
  const { show, target } = showModal;
  const router = useRouter();

 


  const displayAddWareHouse = () => { setShowModal({ show: true, target: 1 }); }
  const displayShelf = () => { setShowModal({ show: true, target: 2 }); }
  const closeModal = (isReload) => {
    (isReload && target === 1) ? getWareHouseList() : getShelves('all',setShelves);
    setShowModal(defaultValues);
    setReload(false);
  }

  
  useEffect(() => {
    setShelfLoading(true);
    getWareHouseList(setWareHouseList);
    getShelves('all', setShelves);
    setShelfLoading(false);
  }, []);



  const getWareHouseShelves = async (warehouseid) => {
    if (!warehouseid) return;
    setShelfLoading(true);
    await getDataAndUpdateState(setShelves, `inventory/warehouse/shelves?warehouseId=${warehouseid}`);
    setShelfLoading(false);
  }


  const editWarehouse = async (warehouseid,name) => {
    if (!warehouseid || !name) return;
    setShowModal({ show: true, target: 1 });
    setEditing({ edit: true, data: { name, warehouseid } });
  }

  // TODO: Implement rack card where rack are display in cards with their following items
  //  - should be implement together with the analytics
  // - A click should be added to  warehouse to view rack cards, view stiky notes cards
  //  - a short cut for viewing items in a card with a bottom-up-show
  return (
    <>
      <InventoryLayout>
        <ToastContainer/>
        <div className="d-flex justify-content-between">
           <RackQuickView/>
        <div className="d-flex justify-content-end">
          <button onClick={displayAddWareHouse} className="btn btn-sm btn-primary mx-2">New Warehouse</button>
          <button onClick={displayShelf} className="btn btn-sm btn-primary mx-2">New Rack/shelf</button>
        </div> 
      </div>
        <section className="grid-50 p-2">
          <div>
            <h5>WareHouse</h5>
            <table className="table  billing-cart-table" >
            <thead>
              <tr>
                <th>Warehouse</th>
                  <th>date added</th>
                  <th>view shelf</th>
              </tr>
            </thead>
            <tbody>
              {
                warehouseList.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{new Date(item?.created_on).toLocaleDateString()}</td>
                      <td>
                        <button onClick={(ev) => {editWarehouse(item?.id,item?.name)}} className="btn btn-primary btn-sm p-0 mx-1">
                          <Edit/>
                        </button>
                        <button onClick={(ev) => {router.push(`/inventory/warehouse/racks?warehouseid=${item?.id}&&name=${item?.name}`)}} className="btn btn-warning btn-sm p-0">
                          <Preview/>
                        </button>
                        <button className="btn btn-danger btn-sm p-0 mx-1">
                          <DeleteForever/>
                        </button>
                        <button onClick={(ev) => {getWareHouseShelves(item.id)}} className="btn btn-secondary btn-sm p-0">
                        <ArrowForwardSharp/>
                        </button>
                      </td>
                    </tr>
                  )
                })
             }
            </tbody>
          </table>
          </div>
           <div>
            <h5>Shelves</h5>
            {shelfLoading ? <ISLOADING /> : 
              (
                <table className="table billing-cart-table">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>warehouse</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    shelves.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item?.name}</td>
                          <td>{item?.warehouse}</td>
                      </tr>
                      )
                    })
                  }
                </tbody>
              </table>   
            )
            }
          </div>
        </section>
        <div>
          {(show && target === 1)
            &&
           <AddWarehouseForm handleClose={closeModal} editing={editing.edit} editingdata={editing.data} showModal={show} />}
          {(show && target === 2)
            &&
          (<AddShelfForm handleClose={closeModal} warehxlist={warehouseList} showModal={show} />)}
        </div>
     </InventoryLayout>
    </>
  )
}