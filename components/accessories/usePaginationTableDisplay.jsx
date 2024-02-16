import FlexTableDisplay from "./FlexTableDisplay"
import Pagination from "./pagination"
import { useCallback, useEffect, useState } from "react"
import { getDataAndUpdateState, updatePagination } from "../Auth/customFetch"
import Loader from "./Loader"

export default function UsePaginationTableDisplay({ column, endpoint, filtering = false, getdata, update, updatedata }) {
   const [paginate, setPaginate] = useState({ count: 10, page: 1 })
   const [load, setLoad] = useState(false)
   const [data, setData] = useState([])
   const [isloading, setisLoading] = useState(true)

   const updateFunction = (value) => {
      updatePagination(value, setPaginate, paginate)
   }


   const updateData = useCallback(async () => {
      if (update) {
         setData(updatedata);
      }
   }, [updatedata, update])
   

   useEffect(() => {
      updateData()
   }, [updateData])

   const getInitData = useCallback(async () => {
      let url = endpoint
      if (url.toString().includes("?")) {
         url += `&&count=${paginate.count}&&page=${paginate.page}`
      } else {
         url = `${endpoint}?count=${paginate.count}&&page=${paginate.page}`
      }
      await getDataAndUpdateState(setData, url, false, setisLoading)
   }, [paginate, endpoint])
   

   useEffect(() => {
      getInitData();
   }, [getInitData]);

   useEffect(() => {
      getdata(data);
   },[getdata,data])


  const rendering = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div>
          <FlexTableDisplay data={data} column={column} filtering={filtering} />
          <div className="d-flex justify-content-center">
            <Pagination updateFunction={updateFunction} page={paginate.page} load={setLoad} />
          </div>
        </div>
      )
    }
  }

  return <>{rendering()}</>
}
