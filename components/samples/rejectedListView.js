"use client"
import { customFetch, parseDate } from "../../components/Auth/customFetch";
import PrimeTable from "../accessories/Datatables/PrimeTable";

export default function RejectedSamplesComponent({ data }) {

	const handleSeverSideProcessing = async (pagination) => {
		try {
			const { page, count } = pagination;
			const response = await customFetch(`rejected/sample/list?count=${count}&&page=${page}`);
			const { result } = response;

			if (result && Array.isArray(result)) {
				return { result, err: false }
			}
			return { result: [], err: false }
		} catch (err) {
			return { result: false, err: true }
		}
	}


	const columns = [
		{ Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className="text-capitalize">{value}</div> },
		{
			Header: 'details', accessor: 'age', Cell: ({ value, row }) => {
				const { gender, mobilenumber } = row.original;
				return (<div>{value}{" || "}{gender}{" || "}{mobilenumber}</div>)
			}
		},

		{ Header: 'test', accessor: 'testname', Cell: ({ value }) => <span className="border-bottom border-danger border-2">{value}</span> },
		{ Header: 'collected on', accessor: "collectionEndDate", Cell: ({ value }) => parseDate(value) },
		{ Header: 'collected by', accessor: "sampleCollectedBy" },
		{ Header: 'validated On', accessor: "samplevalidatedon", Cell: ({ value }) => <div>{new Date(value).toLocaleDateString()}</div> },
		{ Header: 'last validated by', accessor: 'validatedby', Cell: ({ value }) => <div>{value}</div> },
		{ Header: 'reason', accessor: 'rejectionmessage', width: 200 },
		{
			Header: 'actions', accessor: '', Cell: ({ row }) => {
				const item = row.original;
				return (
					<span>
						<button className="btn btn-sm btn-secondary"
							onClick={() => {
								window.open(`/sample/rejected/history?ascensionid=${item.ascensionid}`)
							}}>
							history
						</button>
						<button className="btn btn-sm btn-warning mx-1">redraw</button>
					</span>
				)
			}
		}
	]


	return (
		<>
			<h6>Rejected Sample List</h6>
			<section className="ui">
				<PrimeTable column={columns} data={data} filtering={false} serverSideFiltering={true} handleSeverSideProcessing={handleSeverSideProcessing}/>
			</section>
		</>
	)
}