import React, { useCallback, useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { customPost, getDataAndUpdateState } from "../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../accessories/Loader";
import ReceivedCollectionModalTableTr from "./ReceivedCollectionModalTableTr";


export default function CollectionSampleModal({
	show,
	hide,
	collection,
	employeeid,
	removeCollectedSample,
}) {
	const { billingid, patientid, fullname } = collection;
	const [loading, setLoading] = useState(true);
	const [testCollection, setTestCollection] = useState([]);
	const [allCollected, setAllCollected] = useState(false);
	const [multipleSelected, setMultipleSelected] = useState([]);
	const [fullscreen, setFullscreen] = useState(false);


	const fetchClientAscension = useCallback(async (id) => {
		if (!id) return;
		await getDataAndUpdateState(setTestCollection,
			`phelobotomy/transaction/ascensions?billingid=${id}&&state=false&&employeeid=${employeeid}`, false, setLoading
		);
	}, []);

	useEffect(() => {
		if (show) {
			fetchClientAscension(billingid);
		}
	}, [billingid, fetchClientAscension, show]);

	const toggleAllSelections = () => {
		setAllCollected(!allCollected);
		!allCollected ? setMultipleSelected(testCollection.map((item, index) => item.testid)) : setMultipleSelected([])
	};


	const updateCollectionStatus = async (updatedItem, stage, value) => {
		const response = await customPost('ascension/collection/update/stage', 'POST', { ...updatedItem, employeeid });
		const { status } = response;
		if (!status) return;
		if (status === true) {
			toast.success("Sample initiated successfully!");
			updateCollectionAfterStatusChange(updatedItem.ascensionid, stage, value);
		}
	}

	const handleInitiateSelected = async (stage) => {
		try {
			let qualifiedForInitiation = [];
			for (const testid of multipleSelected) {
				const item = testCollection.find((item) => item.testid === testid);
				if (item[stage] || (stage === "collectionEndDate" && !item.collectionStartDate)) continue;
				qualifiedForInitiation.push(item);
			};
			if (qualifiedForInitiation.length == 0) return;
			for (const item of qualifiedForInitiation) {
				const value = new Date().toISOString();
				const updatedItem = { ascensionid: item.id, collection: "true", value, stage };
				updateCollectionStatus(updatedItem, stage, value);
			}
		} catch (err) {
			toast.error("something went wrong");
		}
	};

	const handleSampleMessageChange = (ev, id) => {
		const message = ev.target.value;
		setTestCollection((prev) => prev.map((item) => (item.id === id ? { ...item, samplemessage: message } : item))
		);
	};

	const handleSubmit = async () => {
		setLoading(true);
		const collectedIds = multipleSelected;
		setTestCollection((prev) =>
			prev.filter(item => !collectedIds.includes(item.testid))
		);

		removeCollectedSample(billingid);
		setLoading(false);
	};

	const toggleMultipleSelection = (ev, item) => {
		const { checked } = ev.target;
		setMultipleSelected((prev) =>
			checked
				? [...prev, item.testid]
				: prev.filter((testid) => testid !== item.testid)
		);
	};


	const updateCollectionAfterStatusChange = (asensionid, stage, value) => {
		setTestCollection((prev) => prev.map((currentItem) => currentItem.id === asensionid ? { ...currentItem, [stage]: value, status: stage === "collectionStartDate" ? 'In progresss' : 'Completed' } : currentItem))
	}


	const ModalBodyView = () => {
		if (loading) return (
			<div className="text-center">
				<span>Loading data.........</span><br />
				<Loader />
			</div>
		)



		if (testCollection.length > 0) {
			return (
				<table className="table m-0">
					<thead>
						<tr>
							<th className="text-capitalize bg-body-secondary fw-light">Test</th>
							<th className="text-capitalize bg-body-secondary fw-light">Sample Type</th>
							<th className="text-capitalize bg-body-secondary fw-light">Qty Req</th>
							<th className="text-capitalize bg-body-secondary fw-light">Container</th>
							<th className="text-capitalize bg-body-secondary fw-light">Status</th>
							<th className="text-capitalize bg-body-secondary fw-light">Action</th>
							<th className="text-capitalize bg-body-secondary fw-light">Message</th>
						</tr>
					</thead>
					<tbody>
						{testCollection.map((item, index) => <ReceivedCollectionModalTableTr
							updateCollectionStatus={updateCollectionStatus} toast={toast} key={index} multipleSelected={multipleSelected} toggleMultipleSelection={toggleMultipleSelection} item={item} updateCollectionAfterStatusChange={updateCollectionAfterStatusChange} />)}
						<tr>
							<td colSpan={7}>
								<button onClick={toggleAllSelections} className={`btn btn-${allCollected ? "danger" : "primary"} btn-sm`}>
									{allCollected ? "Unselect All" : "Select All"}
								</button>
								<button onClick={(ev) => { handleInitiateSelected("collectionStartDate") }} className="btn btn-warning btn-sm mx-2">
									Initiate Selected
								</button>
								<button onClick={(ev) => { handleInitiateSelected('collectionEndDate') }} className="btn btn-warning btn-sm mx-2">
									Complete Selected
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			);
		}

		return (
			<span className="d-flex justify-content-center align-items-center">
				<div>
					<svg
						className="text-danger"
						xmlns="http://www.w3.org/2000/svg"
						width="80"
						height="80"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793 7.354 5.646z" />
						<path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
					</svg>
					<h4 className="my-2" style={{ marginLeft: "-20px" }}>
						No Tests Available
					</h4>
				</div>
			</span>
		);
	};

	return (
		<>
			<ToastContainer className={'text-sm'} position="top-center" />
			<Modal show={show} size="fullscreen" backdrop="static" keyboard="false" onHide={hide}>
				<Modal.Header style={{ backgroundColor: "#e9ecef" }} closeButton className="d-flex justify-content-between text-capitalize fw-bold">
					<div>
						{fullname} ({patientid}) - Billing ID: {billingid}
					</div>
				</Modal.Header>
				<Modal.Body>
					{ModalBodyView()}
				</Modal.Body>
				<Modal.Footer>
					<button
						onClick={() => setFullscreen(!fullscreen)}
						className="btn btn-light text-secondary btn-sm mx-5"
					>
						Fullscreen
					</button>
					<button className="btn btn-primary btn-sm" onClick={handleSubmit}>
						Save
					</button>
					<button className="btn btn-danger btn-sm" onClick={hide}>
						Close
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
