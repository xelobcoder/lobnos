import { Info, SelectAll, Start, Stop } from "@mui/icons-material";
import moment from "moment";
import { useContext, useState } from "react";
import AuthContext from "../../Auth/useAuthentification";
import ProcessingButtons from "./ProcessingButtons";
import { useLaboratoryContext } from "./LaboratoryStagesContext";

export default function AscensionProcessingTable({ }) {
	const { isLoading, collection, queryParams, setLoadPage, setQueryParams, canloadPage, updatePageValue,setCollection } = useLaboratoryContext();
	const [bulkselection, setBulkSelection] = useState([]);
	const [selectstatus, setSelectStatus] = useState(true);
	const { auth } = useContext(AuthContext);
	const employeeid = auth?.employeeid;


	if (isLoading) return <div>Loading .......................</div>

	if (collection.length === 0 && !isLoading) {
		return (<div className="p-3 alert col-3 alert-info text-sm">
			<span className="mx-2">
				<Info />
			</span>
			<span>
				No test found in processing Stage.
			</span>
		</div>)
	}


	const fnTiming = (item) => {
		const { processingEndDate, processingStartDate } = item;
		const parsedStart = processingStartDate ? moment(processingStartDate).format("LLLL") : '';
		const parsedEnd = processingEndDate ? moment(processingEndDate).format('LLLL') : ''
		return (
			<span>{parsedStart} <br /> {parsedEnd}</span>
		)
	}



	const updateTestCollectionAfterUpdate = (ascensionid, updateItem) => {
		const prev = [...collection];

		const indexOfAscensionId = prev.findIndex((single, index) => single.ascensionid === ascensionid);


		if (indexOfAscensionId >= 0) {

			prev[indexOfAscensionId] = updateItem;
		}

		setCollection(prev);
	}



	const addToBulkSelection = (value) => {
		if (bulkselection.includes(value)) return;
		setBulkSelection([...bulkselection, value]);
	}


	const selectAllAscension = () => {
		if (selectstatus === false) {
			setBulkSelection(collection.map((item, index) => item.ascensionid));
			setSelectStatus(true)
		} else {
			setBulkSelection([]);
			setSelectStatus(false);
		}
	}






	return (
		<div className="container-fluid bg-body-secondary p-2 shadow mx-2 br-5" >
			<div className="my-1 d-flex justify-content-between">
				<select value={queryParams.count} onChange={(ev) => { setQueryParams({ ...queryParams, count: ev.target.value }) }} className="custom-select col-1">
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
						<SelectAll /> {selectstatus ? 'unselect all' : 'select all'}
					</button>
					<button className="btn btn-light btn-sm mx-2"><Start /> start selected</button>
					<button className="btn btn-light btn-sm mx-2"><Stop /> stop selected</button>
				</div>
			</div>
			<table className="table text-sm "  >
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
						collection.map((item, index) => {
							return <tr key={item.ascensionid}
								className={`${item.clientstatus === "urgent" ? "table-danger" : 'table-white'}`}>
								<td >
									<input checked={bulkselection.includes(item.ascensionid)}
										onChange={(ev) => {
											addToBulkSelection(item.ascensionid)
										}}
										type="checkbox" />
								</td>
								<td>
									{new Date(item.ascension_date).toLocaleDateString()}
								</td>
								<td >{item.patientid}</td>
								<td>{item.billingid}</td>
								<td className=" text-uppercase fw-bold">{item.fullname}</td>
								<td >{item.age}</td>
								<td >{item.name}</td>
								<td>{fnTiming(item)}</td>
								<ProcessingButtons
									item={item}
									updateTestCollectionAfterUpdate={updateTestCollectionAfterUpdate}
									employeeid={employeeid} />
							</tr>
						})
					}
				</tbody>
			</table>
		</div>
	)
}

