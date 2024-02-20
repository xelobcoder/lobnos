import { useCallback, useEffect, useState } from "react";
import { getDataAndUpdateState, updatePagination } from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import Loader from '../../components/accessories/Loader';
import Pagination from '../../components/accessories/pagination';
import LaboratoryLayout from "../../components/Layout/LaboratoryLayout";

export default function SAMPLE_ASSESSMENT() {
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [loadpage, setLoad] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);


  const fetchInitialData = useCallback(
    async function () {
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
            <Pagination load={setLoad} updateFunction={updateFunction} page={paginate.page} />
          </div>
        </section>
      )
    }
  }

  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate);
  }

  return (
    <LaboratoryLayout>
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
    </LaboratoryLayout>
  );
}



