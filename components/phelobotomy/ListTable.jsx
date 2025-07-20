import React from "react";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingPhelobotomy } from "../serverActions/ActionFiltering";
import { RiInboxLine, RiTestTubeLine } from '@remixicon/react';


export default function ListTable({ data, handleCollectSample, selectedItems = [], onToggleSelection }) {
	const columns = [
		{
			Header: "Select",
			accessor: "select",
			Cell: ({ row }) => (
				<input
					type="checkbox"
					checked={selectedItems.some(item => item.billingid === row.original.billingid)}
					onChange={() => onToggleSelection(row.original)}
				/>
			),
		},
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
