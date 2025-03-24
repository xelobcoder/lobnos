import { useSearchParams } from "next/navigation"
import Header from '../../../components/header';
import { customFetch} from "../../../components/Auth/customFetch";
import { useEffect, useState } from "react";
import RackListView from "../../../components/inventory/WareHouse/RackListView";
export default function WareHouseRacks() {
  const warehouseid = parseInt(useSearchParams().get("warehouseid"));
  const name = useSearchParams().get("name");
  const [racks, setRacks] = useState([]);

  const getWareHouseShelves = async (warehouseid) => {
    if (!warehouseid) return;
    const response = await customFetch(`inventory/warehouse/shelves?warehouseId=${warehouseid}`);
    const { status, statusCode, result } = response;
    if (status == "success" && statusCode == 200 && result.length > 0) {
      setRacks(result);
      return;
    }
  }

  useEffect(() => { 
    if (name && warehouseid) {
      getWareHouseShelves(warehouseid);
    }
   }, [warehouseid,name])
  
console.log(racks)
  return ( 
    <>
      <Header />
      <section>
        {(racks.length === 0) ? <h6 className="d-flex justify-content-center mt-2 alert alert-danger mx-3">No Racks in {name} warehouse</h6> : (
          <>
            <div className="grid-5">
            {racks.map((item, index) => {
              return ( 
                <RackListView key={index} name={item?.name} warehouseid={item?.warehouseid} shelfid={item?.id} /> 
             )
           })}
            </div>
          </>
        )}
      </section>
    </>
  )
}