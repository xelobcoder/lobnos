import { useCallback, useEffect, useState } from "react";
import { getDataAndUpdateState, updatePagination } from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import Loader from '../../components/accessories/Loader';
import Pagination from '../../components/accessories/pagination';
import LaboratoryLayout from "../../components/Layout/LaboratoryLayout";

export default function SAMPLE_ASSESSMENT() {
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchInitialData = useCallback(async () => {
    await getDataAndUpdateState(setData, `sample/client/list/unvalidated?count=${paginate.count}&page=${paginate.page}`, false, setLoading);
  }, [paginate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const removeClientFromList = (id) => {
    if (!id) return;
    setLoading(true);
    setData((prev) => prev.filter((item) => item.billingid !== id));
    setLoading(false);
  };

  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate);
  };

  const renderingView = () => {
    if (isLoading) {
      return <Loader />;
    }

    return (
      <section>
        <PendingTableSample data={data} removeClient={removeClientFromList} />
        <div className="d-flex justify-content-center">
          <Pagination load={setLoading} updateFunction={updateFunction} page={paginate.page} />
        </div>
      </section>
    );
  };

  return (
    <LaboratoryLayout>
      <div className="container mx-2 text-sm">
        <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
          {data.length > 0 && <div className="alert alert-info p-3 my-2">
            <strong>Note:</strong> Please check the sample before validating. Click on the assess button to view the sample.
          </div>}
        </div>
        <div className="my-2">
          {renderingView()}
        </div>
      </div>
    </LaboratoryLayout>
  );
}
