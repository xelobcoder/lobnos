import React from "react";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingPhelobotomy } from "../serverActions/ActionFiltering";


export default function ListTable({ data, handleCollectSample, receive }) {

	

	const columns = [
		{
			Header: "Date",
			accessor: "date",
			Cell: ({ value }) => new Date(value).toLocaleDateString(),
		},
		{ Header: "Fullname", accessor: "fullname" },
		{ Header: "Age", accessor: "age" },
		{ Header: "Gender", accessor: "gender" },
		{
			Header: "Urgency",
			accessor: "clientstatus",
			Cell: ({ value }) => (
				value === "urgent" ? (
					<span className="btn btn-danger btn-sm">{value}</span>
				) : (
					<div>{value}</div>
				)
			),
		},
		{
			Header: "Action",
			accessor: "action",
			Cell: ({ row }) => (
				<div>
					<button onClick={receive} className="btn btn-primary btn-sm mx-1">
						Receive
					</button>
					<button
						className="btn btn-primary btn-sm mx-1"
						onClick={() => {
							handleCollectSample(
								row.original.billingid,
								row.original.patientid,
								row.original.fullname
							);
						}}
					>
						Pull Sample
					</button>
				</div>
			),
		},
	]


	

	return (
		<div>
			<PrimeTable column={columns}
				handleSeverSideProcessing={handleSeverSideProcessingPhelobotomy}
				data={data} filtering={false} serverSideFiltering={true} />
		</div>
	);
}
