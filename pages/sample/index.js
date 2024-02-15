import { useCallback, useContext, useEffect, useState } from "react";
import { getDataAndUpdateState, updatePagination } from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import LabSideBarComponents from "../../components/operations/labSideBarComponents";
import AuthContext from "../../components/Auth/useAuthentification";
import Loader from '../../components/accessories/Loader';
import Pagination from '../../components/accessories/pagination';

export default function SAMPLE_ASSESSMENT() {
  const { auth } = useContext(AuthContext);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [loadpage, setLoad] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const fetchInitialData = useCallback(async function () {
    await getDataAndUpdateState(setData, `sample?count=${paginate.count}&&page=${paginate.page}`, false, setLoading);
  }, [paginate])

  useEffect(() => { fetchInitialData() }, [fetchInitialData])

  const removeClientFromList = (id) => {
    if (!id) return;
    setLoading(true);
    setData((prev)=>{
      return prev.filter((item)=>item.billingid !== id)
    })
    setLoading(false);
  }



  const renderingView = () => {
    if (isLoading) {
      return <Loader />
    } else {
      return (
        <section>
          <PendingTableSample
            data={data} removeClient={removeClientFromList}
          />
          <div className="d-flex justify-content-center">
            <Pagination load={setLoad} updateFunction={updateFunction} />
          </div>
        </section>
      )
    }
  }

  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate);
  }

  return (
    <>
      <SettingsLayout sidebar={<LabSideBarComponents auth={auth}/>}>
        <div className="mx-2">
          <div>
            <div className='alert alert-info p-3 alert-dismissible'>
                  <strong>Note:</strong> Please check the sample before validating. click on assess button to view the sample.
                </div>
          </div>
          <div>
            {renderingView()}
          </div>
        </div>
      </SettingsLayout>
    </>
  );
}



