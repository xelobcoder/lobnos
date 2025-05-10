"use client";
import { useState } from "react";
import ListTable from "../ListTable";
import CollectionSampleModal from "../CollectionSampleModal";
import ReceiveLabSampleModal from "./ReceiveLabSampleModal";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import {
  RiTestTubeLine,
  RiFlaskLine,
  RiMicroscopeLine,
  RiHealthBookLine,
} from "@remixicon/react";

export default function PhelobotomyMainPageClientModule({ data }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [collection, setCollection] = useState({
    billingid: null,
    patientid: null,
    fullname: null,
  });

  const handleCollectSample = async (id, patientid, fullname) => {
    setCollection({ billingid: id, patientid, fullname });
    setShowModal(true);
  };

  const hideModal = () => setShowModal(false);
  const closeModal = () => setOpenModal(false);
  const receiveSample = () => setOpenModal(true);

  const removeCollectedSample = async (billingid) => {
    if (!billingid || isNaN(billingid)) return;
    const dataCopy = [...data];
    const unmatched = dataCopy.filter((item) => item.billingid !== billingid);
    setData(unmatched);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center gap-2 mb-3">
        <RiHealthBookLine className="text-primary" size={24} />
        <h5 className="mb-0">Phlebotomy Sample Management</h5>
      </div>

      <ListTable
        data={data}
        receive={receiveSample}
        handleCollectSample={handleCollectSample}
      />

      {/* Modals */}
      <CollectionSampleModal
        show={showModal}
        hide={hideModal}
        collection={collection}
        employeeid={employeeid}
        removeCollectedSample={removeCollectedSample}
      />

      <ReceiveLabSampleModal show={openModal} hide={closeModal} />
    </div>
  );
}
