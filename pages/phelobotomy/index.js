import React, { useCallback, useEffect, useState, useContext } from "react";
import ListTable from "../../components/phelobotomy/ListTable";
import ISLOADING from "../../components/isLoading";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import PhelobotomySidebar from "../../components/PhelobotomySidebar";
import CollectionSampleModal from "../../components/phelobotomy/CollectionSampleModal";
import { customFetch } from "../../components/Auth/customFetch";
import ReceiveLabSampleModal from "../../components/phelobotomy/ReceiveLabSampleModal/ReceiveLabSampleModal";
import AuthContext from "../../components/Auth/useAuthentification";

export default function Phelobotomy() {
  const { auth } = useContext(AuthContext);
  const { employeeid } = auth;
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [collection, setCollection] = useState({ billingid: null, patientid: null, fullname: null });

  const handleCollectSample = async (id, patientid,fullname) => {
    setCollection({billingid: id, patientid: patientid, fullname: fullname});
    setShowModal(true);
  };


  const hideModal = () => {setShowModal(false);}

  const getPhelobotomy = useCallback(async () => {
    const response = await customFetch(`phelobotomy`);
    const { result, statusCode, status } = response;
    if (statusCode === 200 && status === 'success') {
      setLoading(false);
      setData(result);
    }
  }, []);

  useEffect(() => {
    getPhelobotomy();
  }, [getPhelobotomy]);

  const closeModal = () => { setOpenModal(false); }
  const receiveSample = () => { setOpenModal(true); }

  return (
    <>
      <SettingsLayout sidebar={<PhelobotomySidebar auth={auth} />}>
        {loading && <ISLOADING />}
        {!loading && <ListTable data={data} receive={receiveSample} handleCollectSample={handleCollectSample} />}
        {showModal && <CollectionSampleModal employeeid={employeeid} collection={collection} show={showModal} hide={hideModal} />}
        {openModal && <ReceiveLabSampleModal show={openModal} hide={closeModal} />}
      </SettingsLayout>
    </>
  );
}


