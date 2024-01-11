import { customFetch } from "../../components/Auth/customFetch";
import InventoryLayout from "../../components/inventory/InventoryLayout";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import AddWarehouseForm from "../../components/inventory/WareHouse/AddNewWareHouse";
import { ArrowForwardSharp, DeleteForever, Edit } from "@mui/icons-material";
import AddShelfForm from "../../components/inventory/WareHouse/shelf";
export default function WareHouse() {
  const defaultValues = { show: false, target: 0 };
  const [warehouseList, setWareHouseList] = useState([]);
  const [shouldReload, setReload] = useState(false);
  const [showModal, setShowModal] = useState(defaultValues);
  const { show, target } = showModal;

  const getWareHouseList = () => {
    customFetch("inventory/warehouse")
      .then((data) => { setWareHouseList(data?.result)})
      .catch((err) => toast.error("error in fetching warehouse list", { autoClose: 4000 }));
  }

  const displayAddWareHouse = () => { setShowModal({ show: true, target: 1 }); }
  const displayShelf = () => { setShowModal({ show: true, target: 2 }); }
  const closeModal = (isReload) => { setShowModal(defaultValues); setReload(isReload = false); }

  
  useEffect(() => { getWareHouseList() }, []);
  useEffect(() => {
    if (shouldReload) {
      getWareHouseList();
      setReload(false);
    }
  }, [shouldReload])
  console.log(shouldReload);
  return (
    <>
      <InventoryLayout>
        <ToastContainer/>
        <div className="d-flex justify-content-end">
          <button onClick={displayAddWareHouse} className="btn btn-sm btn-primary mx-2">New Warehouse</button>
          <button onClick={displayShelf} className="btn btn-sm btn-primary mx-2">New Rack/shelf</button>
        </div> 
        <section className="grid-50">
          <div>
            <h5>WareHouse</h5>
            <table className="table" >
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                  <th>date added</th>
                  <th>view shelf</th>
              </tr>
            </thead>
            <tbody>
              {
                warehouseList.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{new Date(item?.created_on).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-primary btn-sm p-0 mx-1">
                          <Edit/>
                        </button>
                        <button className="btn btn-danger btn-sm p-0 mx-1">
                          <DeleteForever/>
                        </button>
                        <button className="btn btn-secondary btn-sm p-0">
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
          </div>
        </section>
        <div>
          {(show && target === 1) && <AddWarehouseForm handleClose={closeModal} showModal={show} />}
          {(show && target === 2) && <AddShelfForm handleClose={closeModal} warehxlist={warehouseList} showModal={show}/>}
        </div>
     </InventoryLayout>
    </>
  )
}