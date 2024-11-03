import { Info, SelectAll, Start, Stop } from "@mui/icons-material";
import { useContext, useState } from "react";
import ProcessingButtons from "./ProcessingButtons";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import { customPost } from "../../Auth/customFetch";
import Pagination from "../../accessories/pagination";
import { useApplicationSettings } from "../../Auth/useApplicationContext";

export default function AscensionProcessingTable({ }) {
	const { isLoading, collection, queryParams, setLoadPage, toast, setQueryParams, canloadPage, updatePageValue, setCollection } = useLaboratoryContext();
	const [bulkselection, setBulkSelection] = useState([]);
	const [selectstatus, setSelectStatus] = useState(false);
	const [currentBulkStatus, setCurrentBulkStatus] = useState({ action: null, target: null });
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;
	const employeeid = user?.employeeid;



	if (isLoading) return <div>Loading .......................</div>;

	if (collection.length === 0 && !isLoading) {
		return (
			<div className="p-3 alert col-3 alert-info text-sm">
				<span className="mx-2">
					<Info />
				</span>
				<span>
					No test found in processing Stage.
				</span>
			</div>
		);
	}

	const updateTestCollectionAfterUpdate = (ascensionid, updateItem) => {
		const prev = [...collection];
		const indexOfAscensionId = prev.findIndex((single) => single.ascensionid === ascensionid);

		if (indexOfAscensionId >= 0) {
			prev[indexOfAscensionId] = updateItem;
		}

		setCollection(prev);
	};

	const addToBulkSelection = (item) => {
		const { ascensionid } = item;

		const isAlreadySelected = bulkselection.some(selectedItem => selectedItem.ascensionid === ascensionid);

		if (isAlreadySelected) return;
		setBulkSelection([...bulkselection, item]);
	};

	const selectAllAscension = () => {
		if (selectstatus === false) {
			setBulkSelection(collection);
			setSelectStatus(true);
		} else {
			setBulkSelection([]);
			setSelectStatus(false);
		}
	};

	const bulkProcessingUpdate = async (action) => {
		if (bulkselection.length === 0) {
			toast.warning(`Please Select One or More Tests`);
			return;
		}

		let successAscensions = [];
		const value = new Date().toISOString();
		const stage = action === "start" ? "processingStartDate" : "processingEndDate";
		
		const handleProcessing = async (item, action) => {
			const { ascensionid, testid, processingStartDate, processingEndDate } = item;

			if (action === "start" && processingStartDate) return;
			if (action === "stop" && processingEndDate) return;


			const selectedItem = { ascensionid, testid, value, employeeid, stage };
			setCurrentBulkStatus({ action, target: ascensionid });

			const { status } = await customPost("ascension/collection/update/stage", 'POST', selectedItem);

			if (status === true) {
				successAscensions.push(ascensionid);
			}

			setCurrentBulkStatus({ action: null, target: null });
		};

		for (const item of bulkselection) {
			await handleProcessing(item, action);
		}

		if (successAscensions.length > 0) {
			const prev = collection;

			successAscensions.map((ascensionid, index) => {
				const indexOfAscensionId = prev.findIndex((single) => single.ascensionid === ascensionid);

				if (!indexOfAscensionId) return ascensionid;

				prev[indexOfAscensionId][stage] = value;

			})

			setCollection(prev);
			setBulkSelection([]);
			setSelectStatus(false);
			toast.success(`Successfully updated ${successAscensions.length} tests.`);
		} else {
			toast.warning(`No tests were updated.`);
		}
	};

	return (
		<div className="container-fluid bg-body-secondary p-2 shadow mx-2 br-5">
			<div className="my-1 d-flex justify-content-between">
				<select
					value={queryParams.count}
					onChange={(ev) => { setQueryParams({ ...queryParams, count: ev.target.value }) }}
					className="custom-select col-1"
				>
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={15}>15</option>
					<option value={20}>20</option>
					<option value={25}>25</option>
					<option value={30}>30</option>
					<option value={35}>35</option>
					<option value={40}>40</option>
					<option value={45}>45</option>
					<option value={50}>50</option>
				</select>
				<div>
					<button onClick={() => { selectAllAscension() }} className="btn btn-light btn-sm">
						<SelectAll /> {selectstatus ? 'Unselect all' : 'Select all'}
					</button>
					<button onClick={() => { bulkProcessingUpdate('start') }} className="btn btn-light btn-sm mx-2">
						<Start /> Start selected
					</button>
					<button onClick={() => { bulkProcessingUpdate('stop') }}  className="btn btn-light btn-sm mx-2">
						<Stop /> Stop selected
					</button>
				</div>
			</div>
			<table className="table text-sm">
				<thead>
					<tr>
						<th style={{ width: '2%', fontSize: '15px' }} className="">#</th>
						<th>Ascension Date</th>
						<th>CustomerId</th>
						<th>BillID</th>
						<th>Name</th>
						<th>Age</th>
						<th>Test Name</th>
						<th>Timing</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody className="table-sm">
					{
						collection.map((item) => (
							<tr key={item.ascensionid}
								className={`${item.clientstatus === "urgent" ? "table-danger" : 'table-white'}`}>
								<td>
									<input
										checked={bulkselection.some(selectedItem => selectedItem.ascensionid === item.ascensionid)}
										onChange={() => addToBulkSelection(item)}
										type="checkbox"
									/>
								</td>
								<td>{new Date(item.ascension_date).toLocaleDateString()}</td>
								<td>{item.patientid}</td>
								<td>{item.billingid}</td>
								<td className="text-uppercase fw-bold">{item.fullname}</td>
								<td>{item.age}</td>
								<td>{item.name}</td>
								<td>{fnTiming(item)}</td>
								<ProcessingButtons
									BulkTargetTo={currentBulkStatus.target}
									action={currentBulkStatus.action}
									item={item}
									updateTestCollectionAfterUpdate={updateTestCollectionAfterUpdate}
									employeeid={employeeid}
								/>
							</tr>
						))
					}
				</tbody>
			</table>
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		</div>
	);
}

