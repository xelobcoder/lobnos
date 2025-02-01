import React from "react";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { customFetch } from "../Auth/customFetch";

export default function ListTable({ data, handleCollectSample, receive }) {

	const getPhelobotomy = async (page, count) => {
		try {
			const result = await customFetch(`test/ascension/pendingCases?count=${count}&&page=${page}`);
			if (Array.isArray(result)) {
				return { result, err: false };
			}
			return { result: [], err: false };
		} catch (error) {
			console.error(error);
			return { result: [], err: true };
		}
	};

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


	const handleSeverSideProcessing = async (pagination) => {
		const { count, page } = pagination;
		return await getPhelobotomy(page, count);
}

	return (
		<div>
			<PrimeTable column={columns}
				handleSeverSideProcessing={handleSeverSideProcessing}
				data={data} filtering={false} serverSideFiltering={true} />
		</div>
	);
}
