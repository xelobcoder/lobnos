import React, { useCallback, useEffect, useState } from "react";
import ListTable from "../../components/phelobotomy/ListTable";
import ISLOADING from "../../components/isLoading";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import PhelobotomySidebar from "../../components/PhelobotomySidebar";
import CollectionSampleModal from "../../components/phelobotomy/CollectionSampleModal";
import { customFetch, getDataAndUpdateState } from "../../components/Auth/customFetch";
export default function Phelobotomy() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
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



  return (
    <>
      <SettingsLayout sidebar={<PhelobotomySidebar />}>
        {loading && <ISLOADING />}
        {!loading && <ListTable data={data} handleCollectSample={handleCollectSample} />}
      {showModal  &&   <CollectionSampleModal collection={collection} show={showModal} hide={hideModal} />}
      </SettingsLayout>
    </>
  );
}


