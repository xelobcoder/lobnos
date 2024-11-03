import TableDisplay from '../accessories/TableDisplay'
import Pagination from "./pagination"
import { useCallback, useEffect, useState, useContext } from "react";
import { getDataAndUpdateState, updatePagination } from "../Auth/customFetch";
import Loader from "./Loader";
import { useApplicationSettings } from '../Auth/useApplicationContext';


export default function UsePaginationTableDisplay({ exporters = false, column, endpoint, filtering = false, getdata, update, updatedata }) {
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [isloading, setisLoading] = useState(true);
  const { applicationsettings } = useApplicationSettings();
  const { user } = applicationsettings;
  const employeeid = user?.employeeid;

  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate);
  };

  const updateData = useCallback(async () => {
    if (update) {
      setData(updatedata);
    }
  }, [updatedata, update]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const getInitData = useCallback(async () => {
    let url = endpoint;
    if (employeeid) {
      if (url.toString().includes("?")) {
        url += `&&count=${paginate.count}&&page=${paginate.page}&&employeeid=${employeeid}`;
      } else {
        url = `${endpoint}?count=${paginate.count}&&page=${paginate.page}&&employeeid=${employeeid}`;
      }
      await getDataAndUpdateState(setData, url, false, setisLoading);
    }
  }, [paginate, endpoint, employeeid]);

  useEffect(() => {
    getInitData();
  }, [getInitData]);

  useEffect(() => {
    getdata(data);
  }, [getdata, data]);

  const rendering = () => {
    if (isloading) return <Loader />;
    else {
      return (
        <div>
          <TableDisplay exporters={exporters} data={data} column={column} showpage={false} filtering={filtering} />
          <div className="d-flex justify-content-center">
            <Pagination updateFunction={updateFunction} page={paginate.page} load={setLoad} />
          </div>
        </div>
      );
    }
  };

  return <>{rendering()}</>;
}
