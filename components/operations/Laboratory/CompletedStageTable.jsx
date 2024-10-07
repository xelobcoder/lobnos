import { Info } from "@mui/icons-material";
import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import Pagination from "../../accessories/pagination";


export default function AscentionCompletedTable() {
	const { isLoading, collection, queryParams, setLoadPage, setQueryParams, canloadPage, updatePageValue } = useLaboratoryContext();

	if (isLoading) return <div>Loading .......................</div>;

	if (collection.length === 0 && !isLoading && !canloadPage) {
		return (
			<div className="p-3 alert col-3 alert-info text-sm">
				<span className="mx-2">
					<Info />
				</span>
				<span>No Records Found</span>
			</div>
		);
	}


	if (collection.length === 0 && !isLoading && canloadPage) {
		return (
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		);
	}



	return (
		<div className="container-fluid bg-body-secondary p-2 shadow mx-2 br-5">
			<div className="my-1">
				<select
					value={queryParams.count}
					onChange={(ev) => setQueryParams({ ...queryParams, count: ev.target.value })}
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
			</div>
			<table className="table text-sm">
				<thead>
					<tr>
						<th style={{ width: "2%", fontSize: "15px" }} className="">
							#
						</th>
						<th>Ascension Date</th>
						<th>CustomerId</th>
						<th>BillID</th>
						<th>Name</th>
						<th>Age</th>
						<th>Test Name</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody className="table-sm">
					{collection.map((item, index) => {
						return (
							<tr
								key={index}
								className={`${item.clientstatus === "urgent" ? "table-danger" : "table-white"}`}
							>
								<td>
									<input type="checkbox" />
								</td>
								<td>{new Date(item.ascension_date).toLocaleDateString()}</td>
								<td>{item.patientid}</td>
								<td>{item.billingid}</td>
								<td className="text-uppercase fw-bold">{item.fullname}</td>
								<td>{item.age}</td>
								<td>{item.name}</td>
								<td>
									<div>
										<button
											onClick={() => PrepareResultEntryHeader(item)}
											className="btn btn-light btn-sm"
										>
											Enter result
										</button>
										<button className="btn btn-light mx-2 btn-sm">Enter All related</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		</div>
	);
}


