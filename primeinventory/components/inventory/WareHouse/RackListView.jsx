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
    <div className="card pointer mx-2 my-2" id="rack">
      <div className="card-header fw-bold text-capitalize" id="rack-header">
        {name}
      </div>
      <div className="card-body br-0" id="rack-body">
        {loading && <ISLOADING />}
        {(data.length > 0 && !loading) &&
          (
          <>
            {data.map((item, index) => {
              return (
                <>
                  <div key={index}>{item?.name}</div>
                </>
             )
           })}
          </>
          )
        }
      </div>
    </div>
  )
}