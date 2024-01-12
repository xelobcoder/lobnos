import { useCallback, useEffect, useState } from "react"
import ISLOADING from "../../isLoading";
import { getDataAndUpdateState } from "../../Auth/customFetch";

export default function RackListView({ warehouseid, name,shelfid }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getdata = useCallback(async () => {
    setLoading(true);
    await getDataAndUpdateState(setData, `inventory/warehouse/shelves/items?warehouseid=${warehouseid}&&shelfid=${shelfid}`);
    setLoading(false);
  }, [shelfid, warehouseid])
  
  useEffect(() => {
    if (warehouseid && shelfid) {
      getdata();
    }
  }, [getdata,warehouseid,shelfid])
  
  return (
    <div className="card  mx-2 my-2">
      <div className="card-header text-sm modal-color text-capitalize">
        {name}
      </div>
      <div className="card-body br-0">
        {loading && <ISLOADING />}
        {(data.length > 0 && !loading) &&
          (
          <>
            {data.map((item, index) => {
             
           })}
          </>
          )
        }
      </div>
    </div>
  )
}