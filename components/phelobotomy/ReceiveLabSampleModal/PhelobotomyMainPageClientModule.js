"use client"
import { useCallback, useEffect, useState } from "react";
import ListTable from "../ListTable";
import CollectionSampleModal from "../CollectionSampleModal";
import { customFetch, getDataAndUpdateState, updatePagination } from "../../Auth/customFetch";
import ReceiveLabSampleModal from "./ReceiveLabSampleModal";
import Loader from "../../accessories/Loader";
import Pagination from "../../accessories/pagination";
import PhelobotomySummaryAnalytics from "../PhelobotomySummaryAnalytics";
import { useApplicationSettings } from "../../Auth/useApplicationContext";



export default function PhelobotomyMainPageClientModule({ data }) {
	const { applicationsettings } = useApplicationSettings();
	const employeeid = applicationsettings?.user?.employeeid;
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

	



	const closeModal = () => { setOpenModal(false); }
	const receiveSample = () => { setOpenModal(true); }


	const removeCollectedSample = async (billingid) => {
		if (!billingid || isNaN(billingid)) return
		const dataCopy = [...data];
		const unmatched = dataCopy.filter((item, index) => item.billingid != billingid);
		setData(unmatched);
	}



	return (
		<div className="p-1">
			<div>
				<PhelobotomySummaryAnalytics />
				{<ListTable data={data} receive={receiveSample} handleCollectSample={handleCollectSample} />}
				{showModal && <CollectionSampleModal removeCollectedSample={removeCollectedSample} employeeid={employeeid} collection={collection} show={showModal} hide={hideModal} />}
				{openModal && <ReceiveLabSampleModal show={openModal} hide={closeModal} />}
			</div>
		</div>
	);
}


