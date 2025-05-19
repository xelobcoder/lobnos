import React from "react";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingPhelobotomy } from "../serverActions/ActionFiltering";
import { RiInboxLine, RiTestTubeLine } from '@remixicon/react';


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
				<div className="d-flex gap-1">
					<button 
						onClick={receive} 
						className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
					>
						<RiInboxLine size={16} />
						<span>Receive</span>
					</button>
					<button
						className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
						onClick={() => {
							handleCollectSample(
								row.original.billingid,
								row.original.patientid,
								row.original.fullname
							);
						}}
					>
						<RiTestTubeLine size={16} />
						<span>Pull Sample</span>
					</button>
				</div>
			),
		},
	]

	const rowClassName = (row) => {
		if (row.original && row.original.clientstatus === "urgent") {
			return "alert alert-danger  text-white";
		}
		return "";
	};

	return (
		<div>
			<PrimeTable
				column={columns}
				handleSeverSideProcessing={handleSeverSideProcessingPhelobotomy}
				data={data}
				filtering={false}
				serverSideFiltering={true}
				
			/>
		</div>
	);
}
