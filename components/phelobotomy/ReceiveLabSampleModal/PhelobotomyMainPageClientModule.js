"use client";
import { useState, useEffect } from "react";
import ListTable from "../ListTable";
import CollectionSampleModal from "../CollectionSampleModal";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import {
	RiHealthBookLine,
} from "@remixicon/react";

export default function PhelobotomyMainPageClientModule({ data }) {
	const { applicationsettings } = useApplicationSettings();
	const employeeid = applicationsettings?.user?.employeeid;
	const [localData, setLocalData] = useState(data);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [load, setLoad] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [collection, setCollection] = useState({
		billingid: null,
		patientid: null,
		fullname: null,
	});
	
	const [selectedItems, setSelectedItems] = useState([]);
	const [collections, setCollections] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		setLocalData(data);
	}, [data]);

	const handleCollectSample = async (id, patientid, fullname) => {
		setCollection({ billingid: id, patientid, fullname });
		setShowModal(true);
	};

	const handleMultipleCollect = () => {
		if (selectedItems.length === 0) return;
		const collectionsData = selectedItems.map(item => ({
			billingid: item.billingid,
			patientid: item.patientid,
			fullname: item.fullname
		}));

		setCollections(collectionsData);
		setCurrentIndex(0);
		setCollection(collectionsData[0]);
		setShowModal(true);
	};

	const handleNextItem = () => {
		// Remove the current processed item from collections array
		const currentBillingId = collections[currentIndex]?.billingid;
		const updatedCollections = collections.filter((item, index) => index !== currentIndex);
		setCollections(updatedCollections);

		if (updatedCollections.length > 0) {
			// Stay at the same index since we removed the current item
			const nextIndex = Math.min(currentIndex, updatedCollections.length - 1);
			setCurrentIndex(nextIndex);
			setCollection(updatedCollections[nextIndex]);
		} else {
			// All items processed
			setShowModal(false);
			setCollections([]);
			setCurrentIndex(0);
			setSelectedItems([]);
		}
	};

	const handleToggleSelection = (item) => {
		const isSelected = selectedItems.some(selected => selected.billingid === item.billingid);
		if (isSelected) {
			setSelectedItems(selectedItems.filter(selected => selected.billingid !== item.billingid));
		} else {
			setSelectedItems([...selectedItems, item]);
		}
	};

	const handleSelectAll = () => {
		if (selectedItems.length === localData.length) {
			// If all are selected, clear selection
			setSelectedItems([]);
		} else {
			// Select all items
			setSelectedItems([...localData]);
		}
	};

	const hideModal = () => {
		setShowModal(false);
		// Clear all selections when modal is closed
		setSelectedItems([]);
		setCollections([]);
		setCurrentIndex(0);
	};
	const closeModal = () => setOpenModal(false);
	const receiveSample = () => setOpenModal(true);

	const removeCollectedSample = async (billingid) => {
		if (!billingid || isNaN(billingid)) return;
		setLocalData(prev => prev.filter((item) => item.billingid !== billingid));
		setSelectedItems(prev => prev.filter((item) => item.billingid !== billingid));
		setCollections(prev => prev.filter((item) => item.billingid !== billingid));
	};

	return (
		<div className="container-fluid">
			<div className="d-flex align-items-center gap-2 mb-3">
				<RiHealthBookLine className="text-primary" size={24} />
				<h5 className="mb-0">Phlebotomy Sample Management</h5>
			</div>

			{/* Selection Controls - Always visible */}
			<div className="mb-3 p-3 bg-light border rounded">
				<div className="d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-3">
						<button
							className={`btn btn-${selectedItems.length === localData.length && localData.length > 0 ? "danger" : "primary"} btn-sm`}
							onClick={handleSelectAll}
							disabled={localData.length === 0}
						>
							{selectedItems.length === localData.length && localData.length > 0 ? "Unselect All" : "Select All"}
						</button>
						<span className="text-muted">
							{selectedItems.length} of {localData.length} samples selected
						</span>
						{localData.length === 0 && (
							<span className="text-muted small">(No samples available)</span>
						)}
					</div>
					{selectedItems.length > 0 && (
						<div className="d-flex gap-2">
							<button
								className="btn btn-primary btn-sm"
								onClick={handleMultipleCollect}
							>
								Process Selected ({selectedItems.length})
							</button>
							<button
								className="btn btn-outline-secondary btn-sm"
								onClick={() => setSelectedItems([])}
							>
								Clear Selection
							</button>
						</div>
					)}
				</div>
			</div>

			<ListTable
				data={localData}
				receive={receiveSample}
				handleCollectSample={handleCollectSample}
				selectedItems={selectedItems}
				onToggleSelection={handleToggleSelection}
			/>			{/* Modals */}
			<CollectionSampleModal
				show={showModal}
				hide={hideModal}
				collection={collection}
				employeeid={employeeid}
				removeCollectedSample={removeCollectedSample}
				collections={collections}
				currentIndex={currentIndex}
				onNextItem={handleNextItem}
			/>
		</div>
	);
}
