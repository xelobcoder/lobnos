import { useCallback, useEffect, useState, useContext } from "react";
import ListTable from "../../components/phelobotomy/ListTable";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import PhelobotomySidebar from "../../components/PhelobotomySidebar";
import CollectionSampleModal from "../../components/phelobotomy/CollectionSampleModal";
import { customFetch, getDataAndUpdateState, updatePagination } from "../../components/Auth/customFetch";
import ReceiveLabSampleModal from "../../components/phelobotomy/ReceiveLabSampleModal/ReceiveLabSampleModal";
import AuthContext from "../../components/Auth/useAuthentification";
import Loader from "../../components/accessories/Loader";
import Pagination from "../../components/accessories/pagination";

export default function Phelobotomy() {
  const { auth } = useContext(AuthContext);
  const { employeeid } = auth;
  const [data, setData] = useState([]);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [collection, setCollection] = useState({ billingid: null, patientid: null, fullname: null });

  const handleCollectSample = async (id, patientid,fullname) => {
    setCollection({billingid: id, patientid: patientid, fullname: fullname});
    setShowModal(true);
  };


  const hideModal = () => {setShowModal(false);}

  const getPhelobotomy = useCallback(async () => {
    await getDataAndUpdateState(setData, `phelobotomy?count=${paginate.count}&&page=${paginate.page}`, false, setLoading);
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
    if (loading) return <Loader />
    else {
      return (
        <div>
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


  const updatePage = (value) => { updatePagination(value, setPaginate, paginate) }

  return (
    <>
      <SettingsLayout sidebar={<PhelobotomySidebar auth={auth} />}>
        {renderingView()}
      </SettingsLayout>
    </>
  );
}


