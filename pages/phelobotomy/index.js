import { useCallback, useEffect, useState, useContext } from "react";
import ListTable from "../../components/phelobotomy/ListTable";
import CollectionSampleModal from "../../components/phelobotomy/CollectionSampleModal";
import { getDataAndUpdateState, updatePagination } from "../../components/Auth/customFetch";
import ReceiveLabSampleModal from "../../components/phelobotomy/ReceiveLabSampleModal/ReceiveLabSampleModal";
import Loader from "../../components/accessories/Loader";
import Pagination from "../../components/accessories/pagination";
import PhelobotomyLayout from "../../components/Layout/PhelobotomyLayout";
import PhelobotomySummaryAnalytics from "../../components/phelobotomy/PhelobotomySummaryAnalytics";
import { useApplicationSettings } from "../../components/Auth/useApplicationContext";



export default function Phelobotomy() {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const [data, setData] = useState([]);
  const [paginate, setPaginate] = useState({ count: 50, page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [collection, setCollection] = useState({ billingid: null, patientid: null, fullname: null });

  const handleCollectSample = async (id, patientid, fullname) => {
    setCollection({ billingid: id, patientid: patientid, fullname: fullname });
    setShowModal(true);
  };



  const hideModal = () => { setShowModal(false); }

  const getPhelobotomy = useCallback(async () => {
    await getDataAndUpdateState(setData, `test/ascension/pendingCases?count=${paginate.count}&&page=${paginate.page}`, false, setLoading);
  }, [paginate]);

  useEffect(() => {
    getPhelobotomy();
  }, [getPhelobotomy]);

  const closeModal = () => { setOpenModal(false); }
  const receiveSample = () => { setOpenModal(true); }


  const removeCollectedSample = async (billingid) => {
    if (!billingid || isNaN(billingid)) return
    const dataCopy = [...data];
    const unmatched = dataCopy.filter((item, index) => item.billingid != billingid);
    setData(unmatched);
  }

  const renderingView = () => {
    if (loading) {
      return <Loader />
    } else {
      return (
        <div>
          <PhelobotomySummaryAnalytics />
          {<ListTable data={data} receive={receiveSample} handleCollectSample={handleCollectSample} />}
          {showModal && <CollectionSampleModal removeCollectedSample={removeCollectedSample} employeeid={employeeid} collection={collection} show={showModal} hide={hideModal} />}
          {openModal && <ReceiveLabSampleModal show={openModal} hide={closeModal} />}
          <div className="d-flex justify-content-center">
            <Pagination page={paginate.page} updateFunction={updatePage} load={setLoad} />
          </div>
        </div>
      )
    }
  }


  const updatePage = (value) => {
    updatePagination(value, setPaginate, paginate);
  }

  return (
    <PhelobotomyLayout>
      <div className="p-4">
        {renderingView()}
      </div>
    </PhelobotomyLayout>
  );
}


