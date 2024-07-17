import { Suspense, useCallback, useEffect, useState } from "react";
import ISLOADING from "../../components/isLoading";
import { useRouter } from "next/navigation";
import { getDataAndUpdateState } from "../../components/Auth/customFetch";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";


export default function Orders() {
  const navigate = useRouter();
  const getdate = new Date();
  const currentDate = getdate.getFullYear() + '-' + (getdate.getMonth() + 1) + '-' + getdate.getDate();
  const [date, setDate] = useState(currentDate);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrders = useCallback(async function () {
    const url = `orders/temporary?target=all` + (date ? `&date=${date}` : '');
    await getDataAndUpdateState(setData, url);
    setLoading(false);
  }, [date])
  

  useEffect(() => { getOrders() }, [getOrders]);


  const handleProcess = async (event, item) => {
    event.preventDefault();
    const { patientid, processed, orderid,clinicianid,date } = item;
    const url = `/orders/processingorder?orderid=${orderid}&patientid=${patientid}&processed=${processed === 0 ? false : true}&&clinicianid=${clinicianid}&orderdate=${date}`;
    navigate.push(url);
  }
    
  return (
    <FrontDeskLayout>
      {/* date */}
      <div className="mx-2 my-1 d-flex justify-content-between">
        <div className="col-4 d-flex">
          <input type="date"  value={date} className='custom-input mx-2' onChange={(ev) => { setDate(ev.target.value) }} />
          <button className="btn btn-orange btn-sm">search</button>
       </div>
        <div>
          <button className="btn btn-sm btn-light fw-bold mx-2">
          {data.length} records found
          </button>
      </div>
      </div>
      <Suspense fallback={<ISLOADING />}>
      {data.length > 0 && (
        <div className="list-group mx-3 ">
          <div className="list-group-item grid-6 list-group-item-action active text-sm fw-bold">
            <span className="mb-1">Patient ID</span>
            <span>CreatedOn</span>
            <span className="mb-1">Brief details</span>
            <span>Mobile</span>
            <span>status</span>
            <span>Action</span>
          </div>
          {data.map((item, index) => {
            return (
              <div key={index} className="list-group-item grid-6 list-group-item-action pointer text-sm">
                  <span className="mb-1">{item.patientid}</span>
                  <span>{item.created_on.slice(0, 10)}</span>
                <span className="mb-1">
                  {item.firstname} {item?.middlename} {item?.lastname}
                  (
                  <span>{item.age}</span>
                  <span>{"-"}{item.agetype}{" "}</span>
                  <span className="text-capitalize">{item?.gender}</span>
                  )
                </span>
                <span>{item.mobile}</span>
                <span className={item.processed === 0 ? 'text-danger' : 'text-success'}>
                  {item.processed === 0 ? 'pending' : 'processed'}
                </span>
                <span>
                  <button onClick={(ev) => {handleProcess(ev,item)}} className="btn btn-sm btn-success">process order</button>
                </span>
              </div>
            )
          })}
        </div>
      )}
        </Suspense>
    </FrontDeskLayout>
  )
}